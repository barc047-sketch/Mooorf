// Real-shell regression: all activation travels through rendered controls.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TEST_URL = process.env.M1_TEST_URL ?? "http://127.0.0.1:4173/";
const CHROME_PATH = process.env.M1_CHROME_PATH
  ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SCREENSHOT_DIR = process.env.M1_SCREENSHOT_DIR;
const REQUIRED_VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
];
const VIEWPORTS = process.env.M1_VIEWPORT
  ? REQUIRED_VIEWPORTS.filter(({ width, height }) => `${width}x${height}` === process.env.M1_VIEWPORT)
  : REQUIRED_VIEWPORTS;
assert.ok(VIEWPORTS.length > 0, `M1_VIEWPORT must be one of ${REQUIRED_VIEWPORTS.map(({ width, height }) => `${width}x${height}`).join(", ")}`);
const DOCK_INSPECTOR = '[role="toolbar"][aria-label="Canvas tools"] [data-command="open-inspector"]';
const RAIL_INSPECTOR = '[role="toolbar"][aria-label="Canvas navigation"] [data-command="open-inspector"]';
const INSPECTOR = '[data-widget="inspector"]';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CdpClient {
  constructor(url) {
    this.url = url;
    this.sequence = 0;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(`${message.error.code}: ${message.error.message}`));
        else pending.resolve(message.result ?? {});
        return;
      }
      const key = `${message.sessionId ?? "browser"}:${message.method}`;
      for (const listener of this.listeners.get(key) ?? []) listener(message.params ?? {});
    });
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.sequence;
    const payload = { id, method, params, ...(sessionId ? { sessionId } : {}) };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify(payload));
    });
  }

  waitForEvent(method, sessionId, timeoutMs = 10_000) {
    const key = `${sessionId ?? "browser"}:${method}`;
    return new Promise((resolve, reject) => {
      const listeners = this.listeners.get(key) ?? [];
      const timer = setTimeout(() => {
        this.listeners.set(key, listeners.filter((listener) => listener !== onEvent));
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);
      const onEvent = (params) => {
        clearTimeout(timer);
        this.listeners.set(key, listeners.filter((listener) => listener !== onEvent));
        resolve(params);
      };
      listeners.push(onEvent);
      this.listeners.set(key, listeners);
    });
  }

  close() {
    this.socket?.close();
  }
}

async function waitForDevToolsPort(profile, process, timeoutMs = 10_000) {
  const file = join(profile, "DevToolsActivePort");
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) throw new Error(`Chrome exited before exposing DevTools (${process.exitCode})`);
    try {
      const [port, path] = (await readFile(file, "utf8")).trim().split("\n");
      if (port && path) return `ws://127.0.0.1:${port}${path}`;
    } catch {
      // Chrome writes DevToolsActivePort after its profile is ready.
    }
    await delay(40);
  }
  throw new Error("Timed out waiting for Chrome DevTools");
}

async function evaluate(client, sessionId, expression) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  }, sessionId);
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
  }
  return response.result?.value;
}

async function waitFor(client, sessionId, expression, message, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  let last;
  while (Date.now() < deadline) {
    last = await evaluate(client, sessionId, expression);
    if (last) return last;
    await delay(50);
  }
  throw new Error(`${message}; last value: ${JSON.stringify(last)}`);
}

const buttonInfoExpression = (selector) => `(() => {
  const nodes = [...document.querySelectorAll(${JSON.stringify(selector)})];
  if (nodes.length !== 1) return { count: nodes.length };
  const button = nodes[0];
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const hit = document.elementFromPoint(x, y);
  const path = [];
  let current = hit;
  while (current && path.length < 4) {
    path.push({
      tag: current.tagName,
      command: current.getAttribute?.("data-command"),
      ariaLabel: current.getAttribute?.("aria-label"),
      role: current.getAttribute?.("role"),
      className: typeof current.className === "string" ? current.className : null,
      pointerEvents: getComputedStyle(current).pointerEvents,
      zIndex: getComputedStyle(current).zIndex,
    });
    current = current.parentElement;
  }
  return {
    count: 1,
    rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
    center: { x, y },
    active: button.getAttribute("data-active"),
    expanded: button.getAttribute("aria-expanded"),
    focused: button.getAttribute("data-focused"),
    hit: path[0],
    path,
  };
})()`;

async function buttonInfo(client, sessionId, selector) {
  return evaluate(client, sessionId, buttonInfoExpression(selector));
}

async function pointerClick(client, sessionId, selector) {
  const before = await buttonInfo(client, sessionId, selector);
  assert.equal(before.count, 1, `expected one rendered button for ${selector}`);
  if (selector.includes('data-command="open-inspector"')) {
    assert.ok(
      before.rect.width >= 29.99 && before.rect.height >= 29.99,
      `${selector} keeps the authored 30x30 hit target; got ${JSON.stringify(before.rect)}`
    );
  }
  const { x, y } = before.center;
  await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }, sessionId);
  await client.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 }, sessionId);
  await client.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: 1 }, sessionId);
  return before;
}

async function assertLauncherState(client, sessionId, selector, expected, context) {
  const info = await buttonInfo(client, sessionId, selector);
  assert.equal(info.count, 1, `${context}: exactly one launcher exists`);
  assert.equal(info.active, expected.expanded ? "true" : null, `${context}: visual active state is truthful`);
  assert.equal(info.expanded, String(expected.expanded), `${context}: aria-expanded is truthful`);
  assert.equal(info.focused, expected.focused ? "true" : null, `${context}: widget focus state is truthful`);
}

async function pointerClickTextButton(client, sessionId, rootSelector, text) {
  const info = await evaluate(client, sessionId, `(() => {
    const nodes = [...document.querySelectorAll(${JSON.stringify(rootSelector)})]
      .filter((node) => node.textContent?.trim().toLowerCase() === ${JSON.stringify(text.toLowerCase())});
    if (nodes.length !== 1) return { count: nodes.length };
    const rect = nodes[0].getBoundingClientRect();
    return { count: 1, center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } };
  })()`);
  assert.equal(info.count, 1, `expected one ${text} button in ${rootSelector}`);
  const { x, y } = info.center;
  await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }, sessionId);
  await client.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 }, sessionId);
  await client.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: 1 }, sessionId);
}

async function pressButton(client, sessionId, selector, key) {
  const focused = await evaluate(client, sessionId, `(() => {
    const nodes = [...document.querySelectorAll(${JSON.stringify(selector)})];
    if (nodes.length !== 1) return false;
    nodes[0].focus({ preventScroll: true });
    return document.activeElement === nodes[0];
  })()`);
  assert.equal(focused, true, `${selector} receives keyboard focus`);
  const isSpace = key === " ";
  const event = {
    key,
    code: isSpace ? "Space" : "Enter",
    windowsVirtualKeyCode: isSpace ? 32 : 13,
    nativeVirtualKeyCode: isSpace ? 32 : 13,
    ...(isSpace ? { text: " ", unmodifiedText: " " } : {}),
  };
  await client.send("Input.dispatchKeyEvent", { type: "keyDown", ...event }, sessionId);
  await client.send("Input.dispatchKeyEvent", { type: "keyUp", ...event }, sessionId);
}

async function focusKeyTarget(client, sessionId, selector) {
  return evaluate(client, sessionId, `(() => {
    const target = ${selector ? `document.querySelector(${JSON.stringify(selector)})` : `document.querySelector("main.stage")`};
    if (!(target instanceof HTMLElement)) return null;
    if (!target.matches("input, textarea, select, button, [contenteditable], [role]")) {
      target.setAttribute("tabindex", "-1");
    }
    if (${selector ? "true" : "false"}) {
      target.scrollIntoView({ behavior: "instant", block: "center", inline: "nearest" });
    }
    target.focus({ preventScroll: true });
    if ((target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
      && typeof target.selectionStart === "number") {
      target.setSelectionRange(target.value.length, target.value.length);
    }
    return document.activeElement === target ? {
      tag: target.tagName,
      role: target.getAttribute("role"),
      ariaLabel: target.getAttribute("aria-label"),
      className: typeof target.className === "string" ? target.className : null,
      editable: target.isContentEditable,
    } : null;
  })()`);
}

async function dispatchPhysicalKey(client, sessionId, {
  key,
  code,
  virtualKey,
  shift = false,
  ctrl = false,
  meta = false,
  alt = false,
  repeat = false,
  raw = false,
  text,
}) {
  const modifiers = (alt ? 1 : 0) | (ctrl ? 2 : 0) | (meta ? 4 : 0) | (shift ? 8 : 0);
  const event = {
    key,
    code,
    modifiers,
    autoRepeat: repeat,
    windowsVirtualKeyCode: virtualKey,
    nativeVirtualKeyCode: virtualKey,
    ...(text === undefined ? {} : { text, unmodifiedText: text.toLowerCase() }),
  };
  await client.send("Input.dispatchKeyEvent", { type: repeat || raw ? "rawKeyDown" : "keyDown", ...event }, sessionId);
  await client.send("Input.dispatchKeyEvent", { type: "keyUp", ...event, autoRepeat: false }, sessionId);
}

async function pressGlobalI(client, sessionId, {
  selector,
  uppercase = false,
  ctrl = false,
  meta = false,
  alt = false,
  repeat = false,
  textInput = true,
  raw = false,
  insertTextAfter = false,
} = {}) {
  const target = await focusKeyTarget(client, sessionId, selector);
  assert.ok(target, `physical I target exists: ${selector ?? "main.stage"}`);
  await dispatchPhysicalKey(client, sessionId, {
    key: uppercase ? "I" : "i",
    code: "KeyI",
    virtualKey: 73,
    shift: uppercase,
    ctrl,
    meta,
    alt,
    repeat,
    raw,
    text: textInput && !insertTextAfter ? uppercase ? "I" : "i" : undefined,
  });
  if (insertTextAfter) {
    await client.send("Input.insertText", { text: uppercase ? "I" : "i" }, sessionId);
  }
  return target;
}

async function pressEscape(client, sessionId, selector) {
  const target = await focusKeyTarget(client, sessionId, selector);
  assert.ok(target, `Escape target exists: ${selector ?? "main.stage"}`);
  await dispatchPhysicalKey(client, sessionId, {
    key: "Escape",
    code: "Escape",
    virtualKey: 27,
  });
  return target;
}

async function pressBackspace(client, sessionId, selector) {
  const target = await focusKeyTarget(client, sessionId, selector);
  assert.ok(target, `Backspace target exists: ${selector}`);
  await dispatchPhysicalKey(client, sessionId, {
    key: "Backspace",
    code: "Backspace",
    virtualKey: 8,
  });
  return target;
}

async function inspectorSnapshot(client, sessionId) {
  return evaluate(client, sessionId, `(() => {
    const frames = [...document.querySelectorAll(${JSON.stringify(INSPECTOR)})];
    const frame = frames[0];
    const activeView = [...document.querySelectorAll('nav[aria-label="View mode"] button')]
      .find((button) => button.getAttribute("data-active") === "true")?.textContent?.trim() ?? null;
    if (!frame) return { count: frames.length, view: activeView, minimized: false, front: false, reachable: false, rect: null };
    const rect = frame.getBoundingClientRect();
    return {
      count: frames.length,
      view: activeView,
      minimized: frame.getAttribute("data-min") === "true",
      front: frame.getAttribute("data-depth") === "front",
      reachable: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
      rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
    };
  })()`);
}

async function waitInspectorClosed(client, sessionId, context) {
  await waitFor(
    client,
    sessionId,
    `document.querySelectorAll(${JSON.stringify(INSPECTOR)}).length === 0`,
    `${context}: Inspector did not close`
  );
}

async function pointFromSelectedCell(client, sessionId) {
  return waitFor(client, sessionId, `(() => {
    const anchor = document.querySelector('.organism-label-anchor[data-primary="true"]');
    const canvas = document.querySelector('canvas.organism-canvas, canvas[data-testid="space-canvas"]');
    if (!canvas) return null;
    const canvasRect = canvas.getBoundingClientRect();
    const anchorRect = anchor?.getBoundingClientRect();
    const x = anchorRect?.left ?? canvasRect.left + canvasRect.width / 2 + 85;
    const y = anchorRect?.top ?? canvasRect.top + canvasRect.height / 2 + 30;
    return x >= canvasRect.left && x <= canvasRect.right && y >= canvasRect.top && y <= canvasRect.bottom ? { x, y } : null;
  })()`, "selected Cell did not expose a rendered Canvas point");
}

async function pointerAt(client, sessionId, point, { button = "left", clickCount = 1 } = {}) {
  const buttons = button === "left" ? 1 : button === "right" ? 2 : 4;
  await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y }, sessionId);
  await client.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button, buttons, clickCount }, sessionId);
  await client.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button, buttons: 0, clickCount }, sessionId);
}

async function doubleClickAt(client, sessionId, point) {
  await pointerAt(client, sessionId, point, { clickCount: 1 });
  await delay(70);
  await pointerAt(client, sessionId, point, { clickCount: 2 });
}

async function assertInspector(client, sessionId, viewport, context) {
  const state = await waitFor(client, sessionId, `(() => {
    const frames = [...document.querySelectorAll(${JSON.stringify(INSPECTOR)})];
    if (frames.length !== 1) return null;
    const frame = frames[0];
    const body = frame.querySelector(".wframe-body");
    const transform = getComputedStyle(frame).transform;
    if (transform !== "none" && transform !== "matrix(1, 0, 0, 1, 0, 0)") return null;
    const rect = frame.getBoundingClientRect();
    const bodyRect = body?.getBoundingClientRect();
    const bodyStyle = body ? getComputedStyle(body) : null;
    if (rect.left < -0.5 || rect.top < -0.5 || rect.right > innerWidth + 0.5 || rect.bottom > innerHeight + 0.5) return null;
    if (!bodyRect || !bodyStyle || bodyStyle.display === "none" || bodyStyle.visibility === "hidden" || bodyRect.height <= 30) return null;
    return {
      count: frames.length,
      minimized: frame.getAttribute("data-min"),
      depth: frame.getAttribute("data-depth"),
      rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
      body: body && bodyRect ? {
        display: bodyStyle.display,
        visibility: bodyStyle.visibility,
        rect: { left: bodyRect.left, top: bodyRect.top, right: bodyRect.right, bottom: bodyRect.bottom, width: bodyRect.width, height: bodyRect.height },
      } : null,
      noSelection: frame.textContent?.includes("Select one or more Cells") ?? false,
    };
  })()`, `${context}: Inspector did not render`);
  assert.equal(state.count, 1, `${context}: exactly one Inspector exists`);
  assert.equal(state.minimized, null, `${context}: Inspector is not minimized`);
  assert.ok(state.body && state.body.display !== "none" && state.body.visibility !== "hidden" && state.body.rect.height > 30, `${context}: full Inspector body is visible`);
  assert.ok(state.rect.left >= -0.5 && state.rect.top >= -0.5, `${context}: Inspector starts inside viewport`);
  assert.ok(state.rect.right <= viewport.width + 0.5 && state.rect.bottom <= viewport.height + 0.5, `${context}: Inspector ends inside viewport`);
  return state;
}

async function closeInspector(client, sessionId) {
  const count = await evaluate(client, sessionId, `document.querySelectorAll(${JSON.stringify(INSPECTOR)}).length`);
  if (count === 0) return;
  await waitFor(client, sessionId, `(() => {
    const frame = document.querySelector(${JSON.stringify(INSPECTOR)});
    if (!frame) return false;
    const transform = getComputedStyle(frame).transform;
    return transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)";
  })()`, "Inspector frame did not settle before close");
  await pointerClick(client, sessionId, 'button[aria-label="Close Inspector"]');
  await waitFor(client, sessionId, `document.querySelectorAll(${JSON.stringify(INSPECTOR)}).length === 0`, "Inspector did not close");
}

async function dragInspectorPartlyOffscreen(client, sessionId) {
  const start = await evaluate(client, sessionId, `(() => {
    const head = document.querySelector(${JSON.stringify(`${INSPECTOR} .wframe-head`)});
    if (!head) return null;
    const rect = head.getBoundingClientRect();
    return { x: rect.left + 56, y: rect.top + rect.height / 2 };
  })()`);
  assert.ok(start, "Inspector title strip exists for real pointer drag");
  await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: start.x, y: start.y }, sessionId);
  await client.send("Input.dispatchMouseEvent", { type: "mousePressed", x: start.x, y: start.y, button: "left", buttons: 1, clickCount: 1 }, sessionId);
  await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: -900, y: start.y + 20, button: "left", buttons: 1 }, sessionId);
  await client.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: -900, y: start.y + 20, button: "left", buttons: 0, clickCount: 1 }, sessionId);
  return waitFor(client, sessionId, `(() => {
    const rect = document.querySelector(${JSON.stringify(INSPECTOR)})?.getBoundingClientRect();
    return rect && rect.left < 0 ? { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom } : null;
  })()`, "real pointer drag did not place Inspector partly off-screen");
}

async function installEventEvidence(client, sessionId) {
  await evaluate(client, sessionId, `(() => {
    window.__m1OwnerPathEvidence = [];
    window.__m1ShortcutKeyEvidence = [];
    const record = (event) => {
      const command = event.target?.closest?.('[data-command="open-inspector"]');
      if (!command) return;
      window.__m1OwnerPathEvidence.push({
        type: event.type,
        key: event.key ?? null,
        target: {
          tag: event.target?.tagName ?? null,
          command: event.target?.getAttribute?.("data-command") ?? null,
          ariaLabel: event.target?.getAttribute?.("aria-label") ?? null,
        },
        path: event.composedPath().slice(0, 4).map((node) => ({
          tag: node.tagName ?? null,
          command: node.getAttribute?.("data-command") ?? null,
          ariaLabel: node.getAttribute?.("aria-label") ?? null,
          role: node.getAttribute?.("role") ?? null,
          className: typeof node.className === "string" ? node.className : null,
        })),
      });
    };
    document.addEventListener("pointerdown", record, true);
    document.addEventListener("click", record, true);
    document.addEventListener("keydown", record, true);
    document.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() !== "i") return;
      window.__m1ShortcutKeyEvidence.push({
        key: event.key,
        repeat: event.repeat,
        ctrl: event.ctrlKey,
        meta: event.metaKey,
        alt: event.altKey,
        shift: event.shiftKey,
        target: {
          tag: event.target?.tagName ?? null,
          role: event.target?.getAttribute?.("role") ?? null,
          ariaLabel: event.target?.getAttribute?.("aria-label") ?? null,
          className: typeof event.target?.className === "string" ? event.target.className : null,
          editable: event.target?.isContentEditable ?? false,
        },
        view: [...document.querySelectorAll('nav[aria-label="View mode"] button')]
          .find((button) => button.getAttribute("data-active") === "true")?.textContent?.trim() ?? null,
      });
      // The app listener was registered during shell mount, before this QA
      // listener. Suppress only Chrome's unrelated native modifier action
      // after the application has had its real physical keydown opportunity.
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) event.preventDefault();
    }, true);
    return true;
  })()`);
}

async function runShortcutScenarios(client, sessionId, viewport, evidence) {
  evidence.shortcutCases = [];
  const mark = (label) => console.info(`[${viewport.width}x${viewport.height}] shortcut: ${label}`);
  const record = async (label, pre, target) => {
    const post = await inspectorSnapshot(client, sessionId);
    evidence.shortcutCases.push({ label, target, pre, post });
    return post;
  };

  await closeInspector(client, sessionId);
  mark("closed/uppercase/minimized/background/off-screen");
  await pointerClickTextButton(client, sessionId, 'nav[aria-label="View mode"] button', "canvas");
  await waitFor(client, sessionId, `Boolean(document.querySelector('canvas.organism-canvas, canvas[data-testid="space-canvas"]'))`, "Canvas did not render for shortcut QA");

  let pre = await inspectorSnapshot(client, sessionId);
  let target = await pressGlobalI(client, sessionId);
  await assertInspector(client, sessionId, viewport, "Canvas lowercase i closed-state open");
  await record("canvas-closed-lowercase-open", pre, target);

  pre = await inspectorSnapshot(client, sessionId);
  target = await pressGlobalI(client, sessionId);
  await waitInspectorClosed(client, sessionId, "Canvas second-i toggle");
  await record("canvas-frontmost-second-i-close", pre, target);

  pre = await inspectorSnapshot(client, sessionId);
  target = await pressGlobalI(client, sessionId, { uppercase: true });
  await assertInspector(client, sessionId, viewport, "Canvas uppercase I open");
  await record("canvas-uppercase-open", pre, target);

  await pointerClick(client, sessionId, 'button[aria-label="Minimize Inspector"]');
  pre = await inspectorSnapshot(client, sessionId);
  assert.equal(pre.minimized, true, "shortcut QA enters minimized Inspector state through real control");
  target = await pressGlobalI(client, sessionId);
  await assertInspector(client, sessionId, viewport, "Canvas minimized i recovery");
  await record("canvas-minimized-expand", pre, target);

  await pointerClick(client, sessionId, 'button[aria-label="Layout widget"]');
  await waitFor(client, sessionId, `document.querySelector(${JSON.stringify(INSPECTOR)})?.getAttribute("data-depth") === "back"`, "shortcut QA could not place Layout in front");
  pre = await inspectorSnapshot(client, sessionId);
  target = await pressGlobalI(client, sessionId);
  const foreground = await assertInspector(client, sessionId, viewport, "Canvas background i focus");
  assert.equal(foreground.depth, "front", "background Inspector comes forward instead of closing");
  await record("canvas-background-focus", pre, target);

  const offscreen = await dragInspectorPartlyOffscreen(client, sessionId);
  pre = await inspectorSnapshot(client, sessionId);
  assert.equal(pre.reachable, false, "shortcut QA places Inspector partly off-screen");
  target = await pressGlobalI(client, sessionId);
  const recovered = await assertInspector(client, sessionId, viewport, "Canvas off-screen i recovery");
  evidence.shortcutOffscreen = { before: offscreen, after: recovered.rect };
  await record("canvas-offscreen-reveal", pre, target);

  await closeInspector(client, sessionId);
  mark("modifier and repeat guards");
  for (const guard of [
    { label: "ctrl-i", options: { ctrl: true } },
    { label: "meta-i", options: { meta: true } },
    { label: "alt-i", options: { alt: true } },
    { label: "repeat-i", options: { repeat: true } },
  ]) {
    mark(`${guard.label}: dispatch`);
    pre = await inspectorSnapshot(client, sessionId);
    target = await pressGlobalI(client, sessionId, guard.options);
    const post = await record(`guard-${guard.label}`, pre, target);
    assert.equal(post.count, 0, `${guard.label} does not open the Inspector`);
    mark(`${guard.label}: passed`);
  }

  await pointerClick(client, sessionId, 'button[aria-label="Add Space"]');
  mark("Inspector editing guards");
  await waitFor(client, sessionId, `Boolean(document.querySelector('.organism-label-anchor[data-primary="true"]') || document.querySelector('canvas[data-testid="space-canvas"]'))`, "Add Space did not select a real Cell");
  mark("Inspector editing guards: selection rendered");
  await pressGlobalI(client, sessionId);
  mark("Inspector editing guards: I dispatched");
  await assertInspector(client, sessionId, viewport, "Inspector fields typing guard setup");
  mark("Inspector editing guards: Inspector ready");
  await pointerClickTextButton(client, sessionId, 'nav[aria-label="View mode"] button', "table");
  await waitFor(client, sessionId, `Boolean(document.querySelector('table'))`, "Table did not render for Inspector field guards");
  mark("Inspector editing guards: Table shell ready");

  const inspectorFields = [
    { label: "inspector-name", selector: `${INSPECTOR} input[aria-label="Space Name"]`, inserts: true },
    { label: "inspector-area", selector: `${INSPECTOR} input[aria-label="Area · m²"]`, inserts: false },
    { label: "inspector-body", selector: `${INSPECTOR} textarea[aria-label="Body / subtext"]`, inserts: true },
  ];
  for (const field of inspectorFields) {
    await delay(120);
    mark(`${field.label}: dispatch`);
    const beforeValue = await evaluate(client, sessionId, `document.querySelector(${JSON.stringify(field.selector)})?.value`);
    pre = await inspectorSnapshot(client, sessionId);
    target = await pressGlobalI(client, sessionId, {
      selector: field.selector,
      uppercase: field.uppercase,
      textInput: false,
      raw: true,
      insertTextAfter: field.inserts,
    });
    const afterValue = await evaluate(client, sessionId, `document.querySelector(${JSON.stringify(field.selector)})?.value`);
    const post = await record(`typing-${field.label}`, pre, target);
    assert.equal(post.count, 1, `${field.label} typing does not toggle the Inspector`);
    if (field.inserts) assert.equal(afterValue, `${beforeValue}${field.uppercase ? "I" : "i"}`, `${field.label} receives normal text input`);
    else assert.equal(afterValue, beforeValue, `${field.label} rejects a non-numeric character without toggling`);
    if (field.inserts) {
      await pressBackspace(client, sessionId, field.selector);
      assert.equal(await evaluate(client, sessionId, `document.querySelector(${JSON.stringify(field.selector)})?.value`), beforeValue, `${field.label} draft is restored after physical typing proof`);
    }
    assert.equal((await inspectorSnapshot(client, sessionId)).count, 1, `${field.label} editing preserves the Inspector`);
    mark(`${field.label}: passed`);
  }

  await delay(120);
  mark("Inspector field guard cleanup: dispatch second i");
  await pressGlobalI(client, sessionId, { selector: 'nav[aria-label="View mode"] button[data-active="true"]' });
  mark("Inspector field guard cleanup: second i complete");
  await waitInspectorClosed(client, sessionId, "Inspector field guard cleanup");
  mark("Inspector field guard cleanup: Inspector closed");
  mark("Table shortcut and editing guards");
  await waitFor(client, sessionId, `Boolean(document.querySelector('table'))`, "Table did not render for shortcut QA");
  mark("Table shortcut and editing guards: Table ready");

  pre = await inspectorSnapshot(client, sessionId);
  target = await pressGlobalI(client, sessionId, { selector: "table" });
  mark("Table shortcut and editing guards: I dispatched");
  await assertInspector(client, sessionId, viewport, "Table lowercase i open");
  mark("Table shortcut and editing guards: Inspector ready");
  await record("table-closed-lowercase-open", pre, target);
  await pressGlobalI(client, sessionId, { selector: "table" });
  await waitInspectorClosed(client, sessionId, "Table second-i toggle");

  const tableFields = [
    { label: "table-name", selector: 'table input[aria-label="Space name"]', inserts: true },
    { label: "table-area", selector: 'table input[type="number"]', inserts: false },
    { label: "table-body", selector: 'table textarea[aria-label^="Body of"]', inserts: true },
  ];
  for (const field of tableFields) {
    await delay(120);
    mark(`${field.label}: dispatch`);
    const beforeValue = await evaluate(client, sessionId, `document.querySelector(${JSON.stringify(field.selector)})?.value`);
    pre = await inspectorSnapshot(client, sessionId);
    target = await pressGlobalI(client, sessionId, {
      selector: field.selector,
      textInput: false,
      raw: true,
      insertTextAfter: field.inserts,
    });
    const afterValue = await evaluate(client, sessionId, `document.querySelector(${JSON.stringify(field.selector)})?.value`);
    const post = await record(`typing-${field.label}`, pre, target);
    assert.equal(post.count, 0, `${field.label} typing does not open the Inspector`);
    if (field.inserts) assert.equal(afterValue, `${beforeValue}i`, `${field.label} receives normal text input`);
    else assert.equal(afterValue, beforeValue, `${field.label} rejects a non-numeric character without toggling`);
    mark(`${field.label}: passed`);
  }

  const combobox = 'table [role="combobox"]';
  mark("table-combobox-role: dispatch");
  pre = await inspectorSnapshot(client, sessionId);
  target = await pressGlobalI(client, sessionId, { selector: combobox, textInput: false, raw: true });
  let post = await record("typing-table-combobox-role", pre, target);
  assert.equal(post.count, 0, "combobox role does not open the Inspector");
  await pressEscape(client, sessionId, combobox);
  mark("table-combobox-role: passed");

  await evaluate(client, sessionId, `(() => {
    const editor = document.createElement("div");
    editor.id = "m1-contenteditable-guard";
    editor.contentEditable = "true";
    editor.setAttribute("role", "textbox");
    editor.textContent = "guard";
    document.querySelector("main.stage")?.append(editor);
    return true;
  })()`);
  pre = await inspectorSnapshot(client, sessionId);
  target = await pressGlobalI(client, sessionId, { selector: "#m1-contenteditable-guard", uppercase: true, textInput: false, raw: true, insertTextAfter: true });
  post = await record("typing-contenteditable-textbox-role", pre, target);
  assert.equal(post.count, 0, "contenteditable textbox role does not open the Inspector");
  assert.match(await evaluate(client, sessionId, `document.querySelector("#m1-contenteditable-guard")?.textContent`), /I/, "contenteditable receives physical I text");

  await pointerClickTextButton(client, sessionId, 'nav[aria-label="View mode"] button', "canvas");
  mark("right-click, Escape and inline editor regressions");
  await waitFor(client, sessionId, `Boolean(document.querySelector('.organism-label-anchor[data-primary="true"]') || document.querySelector('canvas[data-testid="space-canvas"]'))`, "selected Cell did not return after Table switch");
  const cellPoint = await pointFromSelectedCell(client, sessionId);
  await pointerAt(client, sessionId, cellPoint, { button: "right" });
  await waitFor(client, sessionId, `Boolean(document.querySelector('[data-context-surface="object-radial"]'))`, "right-click radial regression");
  await pressEscape(client, sessionId);
  await waitFor(client, sessionId, `!document.querySelector('[data-context-surface="object-radial"]')`, "Escape did not close the right-click radial");

  await doubleClickAt(client, sessionId, cellPoint);
  const inlineName = '.inline-cell-editor input[aria-label="Space name"]';
  await waitFor(client, sessionId, `Boolean(document.querySelector(${JSON.stringify(inlineName)}))`, "double activation did not open the inline Cell editor");
  const inlineBefore = await evaluate(client, sessionId, `document.querySelector(${JSON.stringify(inlineName)})?.value`);
  pre = await inspectorSnapshot(client, sessionId);
  target = await pressGlobalI(client, sessionId, { selector: inlineName, textInput: false, raw: true, insertTextAfter: true });
  const inlineAfter = await evaluate(client, sessionId, `document.querySelector(${JSON.stringify(inlineName)})?.value`);
  post = await record("typing-inline-cell-editor", pre, target);
  assert.equal(post.count, 0, "inline Cell editor typing does not open the Inspector");
  assert.equal(inlineAfter, `${inlineBefore}i`, "inline Cell editor receives physical i text");
  await pressEscape(client, sessionId, inlineName);
  await waitFor(client, sessionId, `!document.querySelector('.inline-cell-editor')`, "inline Cell editor Escape did not cancel");

  for (const view of ["table", "canvas", "table"]) {
    await pointerClickTextButton(client, sessionId, 'nav[aria-label="View mode"] button', view);
    await waitFor(client, sessionId, `document.querySelector('nav[aria-label="View mode"] button[data-active="true"]')?.textContent?.trim() === ${JSON.stringify(view)}`, `view switch to ${view} did not settle`);
  }
  pre = await inspectorSnapshot(client, sessionId);
  target = await pressGlobalI(client, sessionId, { selector: "table" });
  await assertInspector(client, sessionId, viewport, "single listener after view switches");
  post = await record("view-switch-single-listener", pre, target);
  assert.equal(post.count, 1, "view switching retains exactly one global I listener effect");
  mark("complete");

  evidence.shortcutKeyEvents = await evaluate(client, sessionId, "window.__m1ShortcutKeyEvidence");
}

async function runViewport(client, viewport) {
  const target = await client.send("Target.createTarget", { url: "about:blank" });
  const attached = await client.send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
  const sessionId = attached.sessionId;
  await client.send("Page.enable", {}, sessionId);
  await client.send("Runtime.enable", {}, sessionId);
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: false,
  }, sessionId);
  const loaded = client.waitForEvent("Page.loadEventFired", sessionId);
  await client.send("Page.navigate", { url: TEST_URL }, sessionId);
  await loaded;
  await waitFor(client, sessionId, `document.querySelectorAll(${JSON.stringify(DOCK_INSPECTOR)}).length === 1 && document.querySelectorAll(${JSON.stringify(RAIL_INSPECTOR)}).length === 1`, "real Dock and Rail Inspector commands did not render");
  await installEventEvidence(client, sessionId);

  const evidence = {
    viewport,
    canvas: {
      dockButton: await buttonInfo(client, sessionId, DOCK_INSPECTOR),
      railButton: await buttonInfo(client, sessionId, RAIL_INSPECTOR),
    },
  };

  await pointerClick(client, sessionId, DOCK_INSPECTOR);
  const noSelection = await assertInspector(client, sessionId, viewport, "Canvas Dock closed/no-selection click");
  await assertLauncherState(client, sessionId, DOCK_INSPECTOR, { expanded: true, focused: true }, "Canvas Dock open");
  await assertLauncherState(client, sessionId, RAIL_INSPECTOR, { expanded: true, focused: true }, "Canvas Rail mirrors open state");
  assert.equal(noSelection.noSelection, true, "Canvas Dock opens truthful no-selection Inspector content");

  await pointerClick(client, sessionId, 'button[aria-label="Minimize Inspector"]');
  await waitFor(client, sessionId, `${JSON.stringify(INSPECTOR)} && document.querySelector(${JSON.stringify(INSPECTOR)})?.getAttribute("data-min") === "true"`, "Inspector did not minimize");
  await assertLauncherState(client, sessionId, DOCK_INSPECTOR, { expanded: false, focused: false }, "Canvas Dock minimized");
  await pointerClick(client, sessionId, DOCK_INSPECTOR);
  await assertInspector(client, sessionId, viewport, "Canvas Dock minimized recovery");

  await pointerClick(client, sessionId, 'button[aria-label="Layout widget"]');
  await waitFor(client, sessionId, `document.querySelector(${JSON.stringify(INSPECTOR)})?.getAttribute("data-depth") === "back"`, "Layout did not move in front of Inspector");
  await pointerClick(client, sessionId, RAIL_INSPECTOR);
  const focused = await assertInspector(client, sessionId, viewport, "Canvas Rail background focus");
  await assertLauncherState(client, sessionId, RAIL_INSPECTOR, { expanded: true, focused: true }, "Canvas Rail focused");
  assert.equal(focused.depth, "front", "Rail activation focuses the existing Inspector");

  evidence.canvas.partlyOffscreen = await dragInspectorPartlyOffscreen(client, sessionId);
  await pointerClick(client, sessionId, DOCK_INSPECTOR);
  await waitFor(client, sessionId, `(() => {
    const rect = document.querySelector(${JSON.stringify(INSPECTOR)})?.getBoundingClientRect();
    return rect && rect.left >= 11.5 && rect.right <= innerWidth - 11.5;
  })()`, "Dock activation did not restore Inspector to the viewport");
  evidence.canvas.inspectorAfterRecovery = (await assertInspector(client, sessionId, viewport, "Canvas Dock off-screen recovery")).rect;

  // C0 M2 — promote the existing seam inside this same Inspector and exercise
  // apply + pointer preview/revert + favourites through rendered controls.
  await pointerClick(client, sessionId, 'button[aria-label="Add Space"]');
  await pointerClickTextButton(client, sessionId, '.m1-tabs button', "symbol");
  await waitFor(client, sessionId, `document.querySelectorAll('.m1-tabs button').length === 3 && document.querySelectorAll('.m2-symbol-apply:not(:disabled)').length === 133`, "M2 Symbol tab did not expose the exact audited library");
  await evaluate(client, sessionId, `document.querySelector('.m2-symbol-card:first-child .m2-symbol-apply:not(:disabled)')?.scrollIntoView({ block: 'center' })`);
  await pointerClick(client, sessionId, '.m2-symbol-card:first-child .m2-symbol-apply:not(:disabled)');
  const appliedSymbol = await waitFor(client, sessionId, `document.querySelector('.m2-symbol-card[data-active="true"]')?.querySelector('.m2-symbol-apply span')?.textContent`, "Symbol apply did not become canonical");
  const cards = await evaluate(client, sessionId, `(() => [...document.querySelectorAll('.m2-symbol-apply:not(:disabled)')].slice(0, 2).map((button) => {
    const rect = button.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, name: button.querySelector('span')?.textContent };
  }))()`);
  assert.equal(cards.length, 2, "two symbol cards are available for preview/revert");
  await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: cards[1].x, y: cards[1].y }, sessionId);
  await waitFor(client, sessionId, `document.querySelector('.m2-symbol-card[data-active="true"] .m2-symbol-apply span')?.textContent === ${JSON.stringify(cards[1].name)}`, "hover preview did not project the candidate symbol");
  await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 }, sessionId);
  await waitFor(client, sessionId, `document.querySelector('.m2-symbol-card[data-active="true"] .m2-symbol-apply span')?.textContent === ${JSON.stringify(appliedSymbol)}`, "pointer leave did not revert to the canonical symbol");
  await evaluate(client, sessionId, `document.querySelector('.m2-symbol-card:first-child .m2-symbol-star')?.scrollIntoView({ block: 'center' })`);
  await pointerClick(client, sessionId, '.m2-symbol-card:first-child .m2-symbol-star');
  assert.equal(await evaluate(client, sessionId, `document.querySelector('.m2-symbol-card:first-child .m2-symbol-star')?.getAttribute('aria-pressed')`), "true", "favourite toggle persists in the canonical resource owner");
  evidence.canvas.m2Symbol = { appliedSymbol, auditedCards: 133 };
  if (process.env.M2_SMOKE_ONLY === "1") {
    evidence.inspectorCount = await evaluate(client, sessionId, `document.querySelectorAll(${JSON.stringify(INSPECTOR)}).length`);
    evidence.documentBounds = await evaluate(client, sessionId, `({
      viewport: { width: innerWidth, height: innerHeight },
      document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
    })`);
    assert.equal(evidence.inspectorCount, 1, "M2 smoke contains exactly one Inspector");
    assert.equal(evidence.documentBounds.document.width, viewport.width, "M2 smoke has no horizontal shell overflow");
    await client.send("Target.closeTarget", { targetId: target.targetId });
    return evidence;
  }

  await closeInspector(client, sessionId);
  await pressButton(client, sessionId, DOCK_INSPECTOR, "Enter");
  await assertInspector(client, sessionId, viewport, "Canvas Dock Enter");
  await closeInspector(client, sessionId);

  await pointerClickTextButton(client, sessionId, 'nav[aria-label="View mode"] button', "table");
  await waitFor(client, sessionId, `document.querySelector("table") && document.querySelectorAll(${JSON.stringify(DOCK_INSPECTOR)}).length === 1 && document.querySelectorAll(${JSON.stringify(RAIL_INSPECTOR)}).length === 1`, "Table shell did not retain both real Inspector commands");
  evidence.table = {
    dockButton: await buttonInfo(client, sessionId, DOCK_INSPECTOR),
    railButton: await buttonInfo(client, sessionId, RAIL_INSPECTOR),
  };

  await pointerClick(client, sessionId, DOCK_INSPECTOR);
  evidence.table.inspectorAfterDock = (await assertInspector(client, sessionId, viewport, "Table Dock click")).rect;
  await assertLauncherState(client, sessionId, DOCK_INSPECTOR, { expanded: true, focused: true }, "Table Dock open");
  await closeInspector(client, sessionId);
  await pointerClick(client, sessionId, RAIL_INSPECTOR);
  await assertInspector(client, sessionId, viewport, "Table Rail click");

  await pointerClick(client, sessionId, 'button[aria-label="Layout widget"]');
  await waitFor(client, sessionId, `document.querySelector(${JSON.stringify(INSPECTOR)})?.getAttribute("data-depth") === "back"`, "Table Layout did not move in front of Inspector");
  await pointerClick(client, sessionId, DOCK_INSPECTOR);
  const tableFocused = await assertInspector(client, sessionId, viewport, "Table Dock background focus");
  assert.equal(tableFocused.depth, "front", "Table Dock focuses the existing Inspector");

  await pointerClick(client, sessionId, 'button[aria-label="Minimize Inspector"]');
  await pointerClick(client, sessionId, RAIL_INSPECTOR);
  await assertInspector(client, sessionId, viewport, "Table Rail minimized recovery");
  await closeInspector(client, sessionId);
  await pressButton(client, sessionId, RAIL_INSPECTOR, " ");
  evidence.table.inspectorAfterSpace = (await assertInspector(client, sessionId, viewport, "Table Rail Space")).rect;

  await runShortcutScenarios(client, sessionId, viewport, evidence);

  const allEvents = await evaluate(client, sessionId, "window.__m1OwnerPathEvidence");
  evidence.events = [
    allEvents.find((event) => event.type === "pointerdown" && event.path[0]?.className === "dock-btn"),
    allEvents.find((event) => event.type === "pointerdown" && event.path[0]?.className === "rail-btn"),
    allEvents.find((event) => event.type === "keydown" && event.key === "Enter"),
    allEvents.find((event) => event.type === "keydown" && event.key === " "),
  ].filter(Boolean);
  evidence.inspectorCount = await evaluate(client, sessionId, `document.querySelectorAll(${JSON.stringify(INSPECTOR)}).length`);
  evidence.documentBounds = await evaluate(client, sessionId, `({
    viewport: { width: innerWidth, height: innerHeight },
    document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
  })`);
  assert.equal(evidence.inspectorCount, 1, "final state contains exactly one Inspector");
  assert.deepEqual(evidence.documentBounds.viewport, viewport, "CDP viewport is deterministic");
  assert.equal(evidence.documentBounds.document.width, viewport.width, "shell has no horizontal document overflow");
  assert.equal(evidence.documentBounds.document.height, viewport.height, "shell has no vertical document overflow");
  assert.ok(allEvents.some((event) => event.type === "pointerdown"), "real pointerdown reached an Inspector command");
  assert.ok(allEvents.some((event) => event.type === "keydown" && event.key === "Enter"), "Enter reached an Inspector command");
  assert.ok(allEvents.some((event) => event.type === "keydown" && event.key === " "), "Space reached an Inspector command");

  if (SCREENSHOT_DIR) {
    const screenshot = await client.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
      fromSurface: true,
    }, sessionId);
    await writeFile(
      join(SCREENSHOT_DIR, `c0-m1-correction4-${viewport.width}x${viewport.height}.png`),
      Buffer.from(screenshot.data, "base64")
    );
  }

  await client.send("Target.closeTarget", { targetId: target.targetId });
  return evidence;
}

const profile = await mkdtemp(join(tmpdir(), "mooorf-m1-browser-"));
const chrome = spawn(CHROME_PATH, [
  "--headless=new",
  "--disable-gpu",
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-extensions",
  "--disable-features=MediaRouter,OptimizationHints,Translate",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  "about:blank",
], { stdio: "ignore" });

let client;
try {
  const devToolsUrl = await waitForDevToolsPort(profile, chrome);
  client = new CdpClient(devToolsUrl);
  await client.connect();
  const results = [];
  for (const viewport of VIEWPORTS) results.push(await runViewport(client, viewport));
  console.info(JSON.stringify({ url: TEST_URL, results }, null, 2));
  console.info("C0 M1 real-shell Inspector launcher and global I shortcut browser integration passed");
} finally {
  client?.close();
  if (chrome.exitCode === null) {
    const exited = new Promise((resolve) => chrome.once("exit", resolve));
    chrome.kill("SIGTERM");
    await Promise.race([exited, delay(2_000)]);
  }
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await rm(profile, { recursive: true, force: true });
      break;
    } catch (error) {
      if (attempt === 3) throw error;
      await delay(100);
    }
  }
}
