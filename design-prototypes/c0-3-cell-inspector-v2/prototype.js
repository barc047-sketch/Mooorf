// MOOORF — C0.3 Cell Inspector V2 isolated prototype.
// Mock state only: production rebuild must use the Master Graph, registry and history owners.

(function () {
  "use strict";

  var GLYPHS = [
    { id: "a-living", name: "Living", cat: "architecture", tags: ["sofa", "living", "couch", "furniture"] },
    { id: "a-bedroom", name: "Bedroom", cat: "architecture", tags: ["bed", "bedroom", "rest"] },
    { id: "a-kitchen", name: "Kitchen", cat: "architecture", tags: ["kitchen", "cook", "counter"] },
    { id: "a-toilet", name: "Toilet", cat: "architecture", tags: ["toilet", "wc", "bathroom"] },
    { id: "a-stair", name: "Stairs", cat: "architecture", tags: ["stairs", "level", "circulation"] },
    { id: "a-lift", name: "Lift", cat: "architecture", tags: ["lift", "elevator", "access"] },
    { id: "a-parking", name: "Parking", cat: "architecture", tags: ["parking", "car", "vehicle"] },
    { id: "a-circulation", name: "Circulation", cat: "architecture", tags: ["corridor", "path", "loop"] },
    { id: "a-service", name: "Service", cat: "architecture", tags: ["service", "utility", "mep"] },
    { id: "l-tree", name: "Tree", cat: "landscape", tags: ["tree", "plant", "green"] },
    { id: "l-green", name: "Green Space", cat: "landscape", tags: ["leaf", "green", "garden"] },
    { id: "l-water", name: "Water", cat: "landscape", tags: ["water", "pool", "lake"] },
    { id: "l-outdoor", name: "Outdoor Deck", cat: "landscape", tags: ["deck", "terrace", "outdoor"] },
    { id: "l-terrain", name: "Terrain", cat: "landscape", tags: ["terrain", "site", "topography"] },
    { id: "d-cutx", name: "Void Cross", cat: "diagram", tags: ["void", "cut", "cross"] },
    { id: "d-public", name: "Public", cat: "diagram", tags: ["public", "shared", "people"] },
    { id: "d-private", name: "Private", cat: "diagram", tags: ["private", "lock", "zoning"] },
    { id: "d-restricted", name: "Restricted", cat: "diagram", tags: ["restricted", "no go", "block"] },
    { id: "n-north", name: "North", cat: "annotation", tags: ["north", "orientation", "arrow"] },
    { id: "n-scalebar", name: "Scale Bar", cat: "annotation", tags: ["scale", "measure", "bar"] },
    { id: "n-section", name: "Section", cat: "annotation", tags: ["section", "cut", "marker"] },
    { id: "n-leader", name: "Leader", cat: "annotation", tags: ["leader", "callout", "note"] },
    { id: "n-note", name: "Note", cat: "annotation", tags: ["note", "text", "document"] },
    { id: "n-dim", name: "Dimension", cat: "annotation", tags: ["dimension", "measure", "distance"] },
    { id: "d-entry", name: "Entry", cat: "wayfinding", tags: ["entry", "in", "door"] },
    { id: "d-exit", name: "Exit", cat: "wayfinding", tags: ["exit", "out", "door"] },
    { id: "w-move", name: "Movement", cat: "wayfinding", tags: ["movement", "route", "arrow"] },
    { id: "w-view", name: "View", cat: "wayfinding", tags: ["view", "sight", "eye"] },
    { id: "w-sign", name: "Signpost", cat: "wayfinding", tags: ["sign", "direction", "route"] },
    { id: "e-sun", name: "Sun", cat: "environment", tags: ["sun", "solar", "daylight"] },
    { id: "e-wind", name: "Wind", cat: "environment", tags: ["wind", "air", "breeze"] },
    { id: "e-warm", name: "Warm Wind", cat: "environment", tags: ["warm", "wind", "heat"] },
    { id: "e-cool", name: "Cool Wind", cat: "environment", tags: ["cool", "wind", "cold"] },
    { id: "e-rain", name: "Rain", cat: "environment", tags: ["rain", "weather", "water"] },
    { id: "e-compass", name: "Compass", cat: "environment", tags: ["compass", "orientation", "north"] },
    { id: "x-access", name: "Accessible", cat: "accessibility", tags: ["accessible", "wheelchair", "access"] },
    { id: "x-ramp", name: "Ramp", cat: "accessibility", tags: ["ramp", "slope", "access"] },
    { id: "x-hearing", name: "Hearing", cat: "accessibility", tags: ["hearing", "audio", "access"] },
    { id: "x-guide", name: "Tactile Guide", cat: "accessibility", tags: ["tactile", "guide", "access"] },
    { id: "s-power", name: "Power", cat: "services", tags: ["power", "electric", "energy"] },
    { id: "s-water", name: "Water Service", cat: "services", tags: ["water", "plumbing", "service"] },
    { id: "s-hvac", name: "HVAC", cat: "services", tags: ["hvac", "air", "service"] },
    { id: "s-waste", name: "Waste", cat: "services", tags: ["waste", "bin", "service"] },
    { id: "s-data", name: "Data", cat: "services", tags: ["data", "network", "server"] }
  ];

  var MATERIALS = [
    { id: "cream", name: "Museum Cream", colour: "rgb(220, 216, 202)", tags: "cream neutral warm" },
    { id: "clay", name: "Clay", colour: "rgb(198, 178, 153)", tags: "clay warm earth" },
    { id: "sage", name: "Sage", colour: "rgb(167, 182, 164)", tags: "sage green landscape" },
    { id: "steel", name: "Steel", colour: "rgb(164, 176, 190)", tags: "steel blue cool" },
    { id: "bronze", name: "Bronze", colour: "rgb(185, 159, 104)", tags: "bronze gold metal" },
    { id: "graphite", name: "Graphite", colour: "rgb(90, 90, 92)", tags: "graphite dark grey" },
    { id: "bone", name: "Gallery Bone", colour: "rgb(238, 237, 226)", tags: "bone white neutral" },
    { id: "mist", name: "Mist", colour: "rgb(198, 203, 200)", tags: "mist pale grey" },
    { id: "moss", name: "Moss", colour: "rgb(103, 119, 92)", tags: "moss deep green" },
    { id: "ink", name: "Ink", colour: "rgb(40, 40, 40)", tags: "ink black dark" },
    { id: "wine", name: "Oxblood", colour: "rgb(112, 48, 52)", tags: "wine red oxblood" },
    { id: "sand", name: "Sand", colour: "rgb(207, 193, 164)", tags: "sand beige warm" }
  ];

  var TEXT_FACTORY = { preset: "technical", size: 100, colour: "auto" };
  var SYMBOL_FACTORY = {
    anchor: "centre", offsetX: 0, offsetY: 0, scale: 100, rotation: 0, opacity: 100,
    tint: "#222222", backingType: "circle", backingSize: 32, backingOpacity: 100,
    backingOffsetX: 0, backingOffsetY: 0, backingOutline: true, outlineWidth: 10, hideZoom: 45
  };
  var STYLE_FACTORY = {
    fill: "cream",
    boundary: { visible: true, style: "solid", width: 10, offset: 0, opacity: 100, align: "centre", colour: "auto" },
    core: { visible: true, size: 6, opacity: 85, colour: "auto", offsetX: 0, offsetY: 0 }
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function glyphById(id) { return GLYPHS.find(function (glyph) { return glyph.id === id; }) || null; }
  function materialById(id) { return MATERIALS.find(function (material) { return material.id === id; }) || MATERIALS[0]; }

  var S = {
    theme: "day",
    selected: new Set(["c1"]),
    inspectorOpen: false,
    inspectorPinned: true,
    activeTab: "content",
    activeCategory: "all",
    previewSymbolId: null,
    zoom: 1,
    editingCellId: null,
    editorOriginal: null,
    drag: null,
    grid: true,
    labels: true,
    projectDefaults: { text: clone(TEXT_FACTORY), symbol: clone(SYMBOL_FACTORY), style: clone(STYLE_FACTORY) },
    cells: {
      c1: {
        id: "c1", content: { name: "Studio", area: 48, body: "Primary live-work volume facing the courtyard." },
        symbolId: "a-living",
        systems: {
          text: { useDefault: false, local: { preset: "technical", size: 100, colour: "auto" } },
          symbol: { useDefault: false, local: Object.assign(clone(SYMBOL_FACTORY), { anchor: "above", scale: 92, tint: "#c31616", backingSize: 30 }) },
          style: { useDefault: false, local: Object.assign(clone(STYLE_FACTORY), { fill: "clay" }) }
        }
      },
      c2: {
        id: "c2", content: { name: "Workspace", area: 24, body: "Focused desk zone with north light." }, symbolId: null,
        systems: { text: { useDefault: true, local: null }, symbol: { useDefault: true, local: null }, style: { useDefault: true, local: null } }
      },
      c3: {
        id: "c3", content: { name: "Lounge", area: 32, body: "Soft seating for low-light evening use." }, symbolId: null,
        systems: {
          text: { useDefault: false, local: { preset: "editorial", size: 95, colour: "auto" } },
          symbol: { useDefault: true, local: null },
          style: { useDefault: false, local: Object.assign(clone(STYLE_FACTORY), { fill: "steel" }) }
        }
      }
    },
    recents: ["a-living", "l-tree"],
    favourites: new Set(["a-bedroom", "d-cutx", "n-north"]),
    styleClipboard: null,
    savedPresets: [],
    toastTimer: null
  };

  var D = {
    stage: $("#stage"), world: $("#world"), grid: $("#grid-layer"), selectionHint: $("#selection-hint"),
    editor: $("#cell-editor"), ceName: $("#ce-name"), ceArea: $("#ce-area"), ceBody: $("#ce-body"),
    inspector: $("#inspector"), pin: $("#insp-pin"), close: $("#insp-close"), badge: $("#sel-badge"),
    fName: $("#f-name"), fArea: $("#f-area"), fBody: $("#f-body"),
    search: $("#ic-search-input"), searchClear: $("#ic-search-clear"), glyphGrid: $("#ic-library-grid"),
    appliedPreview: $("#ap-preview"), appliedName: $("#ap-name"), remove: $("#btn-remove-icon"),
    fillPreview: $("#fill-preview"), browser: $("#mb-mock"), browserGrid: $("#mb-grid"),
    browserSearch: $("#mb-mock .mb-search input"), browserClose: $("#mb-close"),
    toast: $("#toast"), tooltip: $("#tooltip"), modeSwitch: $("#mode-switch"), modeLabel: $("#mode-label")
  };

  function defaultsFor(system) { return S.projectDefaults[system]; }
  function resolved(cellId, system) {
    var entry = S.cells[cellId].systems[system];
    return entry.useDefault ? defaultsFor(system) : (entry.local || defaultsFor(system));
  }
  function selectedIds() { return Array.from(S.selected); }
  function primaryId() { return selectedIds()[0] || null; }

  function init() {
    installAccessibility();
    markFutureShellControls();
    bindSelectionAndDrag();
    bindInlineEditor();
    bindInspector();
    bindContentControls();
    bindSymbolLibrary();
    bindSystemControls();
    bindStyleActions();
    bindMaterialBrowser();
    bindShellAndKeyboard();
    bindTooltips();
    D.inspector.classList.add("pinned");
    D.pin.setAttribute("aria-pressed", "true");
    D.modeSwitch.setAttribute("aria-pressed", "false");
    document.body.dataset.inspectorPinned = "true";
    document.body.dataset.inspectorOpen = "false";
    document.body.dataset.editing = "false";
    document.body.dataset.labels = "true";
    D.selectionHint.dataset.zoom = "1.00x";
    renderMaterialGrid("");
    renderAllCells();
    updateSelectionVisuals();
    syncInspector();
  }

  /* ── Selection, group drag and inline content editing ───────────── */
  function bindSelectionAndDrag() {
    $$(".cell").forEach(function (cell) {
      cell.addEventListener("pointerdown", function (event) {
        if (event.button !== 0 || S.editingCellId || event.__editorCommitted) return;
        event.stopPropagation();
        var additive = event.shiftKey || event.metaKey || event.ctrlKey;
        if (additive) {
          if (S.selected.has(cell.id)) S.selected.delete(cell.id);
          else S.selected.add(cell.id);
        } else if (!S.selected.has(cell.id) || S.selected.size > 1) {
          S.selected.clear();
          S.selected.add(cell.id);
        }
        updateSelectionVisuals();
        if (!S.selected.has(cell.id)) return;
        var starts = {};
        selectedIds().forEach(function (id) {
          var selectedCell = document.getElementById(id);
          starts[id] = { left: parseFloat(selectedCell.style.left) || 0, top: parseFloat(selectedCell.style.top) || 0 };
        });
        S.drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, starts: starts, moved: false };
        cell.setPointerCapture(event.pointerId);
      });

      cell.addEventListener("pointermove", function (event) {
        if (!S.drag || S.drag.pointerId !== event.pointerId || S.editingCellId) return;
        var dx = (event.clientX - S.drag.startX) / S.zoom;
        var dy = (event.clientY - S.drag.startY) / S.zoom;
        if (Math.abs(dx) + Math.abs(dy) > 2) S.drag.moved = true;
        selectedIds().forEach(function (id) {
          var selectedCell = document.getElementById(id);
          selectedCell.style.left = (S.drag.starts[id].left + dx) + "px";
          selectedCell.style.top = (S.drag.starts[id].top + dy) + "px";
          selectedCell.classList.toggle("dragging", S.drag.moved);
        });
      });

      function finishDrag(event) {
        if (!S.drag || S.drag.pointerId !== event.pointerId) return;
        selectedIds().forEach(function (id) { document.getElementById(id).classList.remove("dragging"); });
        if (cell.hasPointerCapture(event.pointerId)) cell.releasePointerCapture(event.pointerId);
        S.drag = null;
      }
      cell.addEventListener("pointerup", finishDrag);
      cell.addEventListener("pointercancel", finishDrag);

      cell.addEventListener("dblclick", function (event) {
        event.preventDefault();
        event.stopPropagation();
        S.selected.clear();
        S.selected.add(cell.id);
        updateSelectionVisuals();
        openInlineEditor(cell.id);
      });

      cell.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        var additive = event.shiftKey || event.metaKey || event.ctrlKey;
        if (!additive) S.selected.clear();
        if (additive && S.selected.has(cell.id)) S.selected.delete(cell.id);
        else S.selected.add(cell.id);
        updateSelectionVisuals();
      });
    });

    D.stage.addEventListener("pointerdown", function (event) {
      if (event.__editorCommitted) return;
      if (event.target === D.stage || event.target === D.grid) {
        S.selected.clear();
        updateSelectionVisuals();
      }
    });

    D.stage.addEventListener("wheel", function (event) {
      if (S.editingCellId) return;
      event.preventDefault();
      setZoom(S.zoom * Math.exp(-event.deltaY * .0012));
    }, { passive: false });
  }

  function bindInlineEditor() {
    document.addEventListener("pointerdown", function (event) {
      if (!S.editingCellId || D.editor.contains(event.target)) return;
      commitInlineEditor();
      event.__editorCommitted = true;
    }, true);

    [D.ceName, D.ceArea, D.ceBody].forEach(function (field) {
      field.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          cancelInlineEditor();
          return;
        }
        if (event.key === "Enter" && !(field === D.ceBody && event.shiftKey)) {
          event.preventDefault();
          commitInlineEditor();
        }
      });
    });
  }

  function openInlineEditor(cellId) {
    if (S.editingCellId) commitInlineEditor();
    S.editingCellId = cellId;
    S.editorOriginal = clone(S.cells[cellId].content);
    D.ceName.value = S.editorOriginal.name;
    D.ceArea.value = String(S.editorOriginal.area);
    D.ceBody.value = S.editorOriginal.body;
    D.editor.hidden = false;
    document.body.dataset.editing = "true";
    D.editor.setAttribute("role", "dialog");
    D.editor.setAttribute("aria-label", "Edit " + S.editorOriginal.name);
    positionInlineEditor(cellId);
    requestAnimationFrame(function () { D.ceName.focus(); D.ceName.select(); });
  }

  function positionInlineEditor(cellId) {
    var cellRect = document.getElementById(cellId).getBoundingClientRect();
    var stageRect = D.stage.getBoundingClientRect();
    var width = 286;
    var height = D.editor.offsetHeight || 170;
    var left = cellRect.right - stageRect.left + 12;
    if (left + width > stageRect.width - 12) left = cellRect.left - stageRect.left - width - 12;
    var top = clamp(cellRect.top - stageRect.top + cellRect.height / 2 - height / 2, 70, stageRect.height - height - 16);
    D.editor.style.left = Math.max(70, left) + "px";
    D.editor.style.top = top + "px";
  }

  function commitInlineEditor() {
    if (!S.editingCellId) return;
    var id = S.editingCellId;
    var area = parseArea(D.ceArea.value);
    if (area === null) {
      area = S.editorOriginal.area;
      toast("Area must be a positive numeric value; the previous area was kept.");
    }
    S.cells[id].content = {
      name: D.ceName.value.trim() || "Untitled Space",
      area: area,
      body: D.ceBody.value.trim()
    };
    closeInlineEditor();
    renderCell(id);
    syncContentFields();
    toast("Cell content committed · Table / Master Graph production contract");
  }

  function cancelInlineEditor() {
    if (!S.editingCellId) return;
    closeInlineEditor();
    toast("Inline edit cancelled");
  }

  function closeInlineEditor() {
    D.editor.hidden = true;
    S.editingCellId = null;
    S.editorOriginal = null;
    document.body.dataset.editing = "false";
  }

  function parseArea(value) {
    var number = Number(String(value).replace(/m²/gi, "").replace(/,/g, "").trim());
    return Number.isFinite(number) && number > 0 ? Math.round(number * 100) / 100 : null;
  }

  function updateSelectionVisuals() {
    $$(".cell").forEach(function (cell) {
      var selected = S.selected.has(cell.id);
      cell.classList.toggle("selected", selected);
      cell.setAttribute("aria-selected", String(selected));
    });
    syncInspector();
  }

  function setZoom(value) {
    S.zoom = clamp(value, .25, 1.5);
    D.world.style.setProperty("--canvas-zoom", S.zoom.toFixed(3));
    D.selectionHint.dataset.zoom = S.zoom.toFixed(2) + "x";
    renderAllCellSymbols();
  }

  /* ── Cell render layer ─────────────────────────────────────────── */
  function renderAllCells() { Object.keys(S.cells).forEach(renderCell); }
  function renderAllCellSymbols() { Object.keys(S.cells).forEach(renderCellSymbol); }

  function renderCell(cellId) {
    var cell = document.getElementById(cellId);
    var data = S.cells[cellId];
    var text = resolved(cellId, "text");
    var style = resolved(cellId, "style");
    var material = materialById(style.fill);
    var contrast = contrastColour(material.colour);
    cell.querySelector(".nm").textContent = data.content.name;
    cell.querySelector(".ar").textContent = formatArea(data.content.area) + " m²";
    cell.querySelector(".bd").textContent = data.content.body;
    cell.dataset.tpreset = text.preset;
    cell.dataset.tcol = text.colour;
    cell.style.setProperty("--text-scale", String(text.size / 100));
    cell.style.setProperty("--cell-fill", material.colour);
    cell.style.setProperty("--cell-text", text.colour === "auto" ? contrast : text.colour);

    var boundary = cell.querySelector(".cell-boundary");
    var boundaryWidth = Math.max(.5, style.boundary.width / 10);
    if (style.boundary.style === "double") boundaryWidth = Math.max(3, boundaryWidth);
    boundary.hidden = !style.boundary.visible;
    boundary.style.borderStyle = style.boundary.style;
    boundary.style.borderWidth = boundaryWidth + "px";
    boundary.style.borderColor = style.boundary.colour === "auto" ? contrast : style.boundary.colour;
    boundary.style.opacity = String(style.boundary.opacity / 100);
    var inset = boundaryInset(style.boundary.align, style.boundary.offset, boundaryWidth);
    boundary.style.inset = inset + "px";

    var core = cell.querySelector(".core-dot");
    core.hidden = !style.core.visible;
    core.style.width = style.core.size + "px";
    core.style.height = style.core.size + "px";
    core.style.opacity = String(style.core.opacity / 100);
    core.style.backgroundColor = style.core.colour === "auto" ? contrast : style.core.colour;
    core.style.transform = "translate(calc(-50% + " + style.core.offsetX + "px), calc(-50% + " + style.core.offsetY + "px))";
    renderCellSymbol(cellId);
  }

  function renderCellSymbol(cellId) {
    var data = S.cells[cellId];
    var cell = document.getElementById(cellId);
    var wrap = document.getElementById(cellId + "-icon");
    var symbol = S.previewSymbolId && S.selected.has(cellId) ? S.previewSymbolId : data.symbolId;
    var preview = Boolean(S.previewSymbolId && S.selected.has(cellId));
    var config = resolved(cellId, "symbol");
    wrap.innerHTML = "";
    cell.style.removeProperty("--label-shift");
    if (!symbol || S.zoom < config.hideZoom / 100) return;
    var radius = cell.offsetWidth / 2;
    var edge = radius * .56;
    var anchors = { centre: [0, 0], above: [0, -edge], below: [0, edge], "top-left": [-edge * .7, -edge * .7], "top-right": [edge * .7, -edge * .7] };
    var anchor = anchors[config.anchor] || anchors.centre;
    var x = anchor[0] + config.offsetX;
    var y = anchor[1] + config.offsetY;
    var scale = config.scale / 100;
    var style = resolved(cellId, "style");
    var fill = materialById(style.fill).colour;

    if (config.backingType !== "none") {
      var backing = document.createElement("span");
      backing.className = "icon-backing" + (preview ? " preview-mode" : "");
      backing.style.width = config.backingSize + "px";
      backing.style.height = config.backingSize + "px";
      backing.style.backgroundColor = config.backingType === "auto" ? contrastColour(fill) : "#ffffff";
      backing.style.opacity = String(config.backingOpacity / 100);
      backing.style.border = config.backingOutline ? (config.outlineWidth / 10).toFixed(1) + "px solid rgba(30,30,30,.22)" : "none";
      backing.style.transform = "translate(" + (x + config.backingOffsetX) + "px," + (y + config.backingOffsetY) + "px) scale(" + scale + ")";
      wrap.appendChild(backing);
    }
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon-svg" + (preview ? " preview-mode" : ""));
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = "<use href=\"#" + symbol + "\"></use>";
    svg.style.width = config.backingSize * .64 + "px";
    svg.style.height = config.backingSize * .64 + "px";
    svg.style.color = config.tint;
    svg.style.opacity = String(config.opacity / 100);
    svg.style.transform = "translate(" + x + "px," + y + "px) scale(" + scale + ") rotate(" + config.rotation + "deg)";
    wrap.appendChild(svg);
    if (config.anchor === "centre") cell.style.setProperty("--label-shift", Math.min(radius * .18, config.backingSize * scale * .25 + 5) + "px");
  }

  function boundaryInset(align, offset, width) {
    if (align === "inside") return Math.max(0, offset);
    if (align === "outside") return -(offset + width);
    return -offset;
  }

  function contrastColour(colour) {
    var values = String(colour).match(/[\d.]+/g);
    if (!values || values.length < 3) return S.theme === "night" ? "#f5f6ee" : "#171719";
    var rgb = values.slice(0, 3).map(Number).map(function (channel) {
      channel /= 255;
      return channel <= .03928 ? channel / 12.92 : Math.pow((channel + .055) / 1.055, 2.4);
    });
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2] > .42 ? "#171719" : "#f5f6ee";
  }

  function formatArea(value) { return Number.isInteger(value) ? String(value) : String(value.toFixed(2)).replace(/0+$/, "").replace(/\.$/, ""); }

  /* ── Inspector lifecycle and content controls ──────────────────── */
  function bindInspector() {
    $$(".insp-tab").forEach(function (tab) {
      tab.addEventListener("click", function () { selectTab(tab.dataset.tab); });
    });
    D.pin.addEventListener("click", function () {
      S.inspectorPinned = !S.inspectorPinned;
      D.inspector.classList.toggle("pinned", S.inspectorPinned);
      D.pin.classList.toggle("on", S.inspectorPinned);
      D.pin.setAttribute("aria-pressed", String(S.inspectorPinned));
      document.body.dataset.inspectorPinned = String(S.inspectorPinned);
      toast(S.inspectorPinned ? "Inspector pinned" : "Inspector floating over Canvas");
    });
    D.close.addEventListener("click", closeInspector);
  }

  function selectTab(tabName) {
    S.activeTab = tabName;
    $$(".insp-tab").forEach(function (tab) {
      var active = tab.dataset.tab === tabName;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    $$(".tab-panel").forEach(function (panel) {
      var active = panel.dataset.panel === tabName;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
  }

  function openInspector() {
    S.inspectorOpen = true;
    D.inspector.hidden = false;
    document.body.dataset.inspectorOpen = "true";
    syncInspector();
  }

  function closeInspector() {
    S.inspectorOpen = false;
    D.inspector.hidden = true;
    document.body.dataset.inspectorOpen = "false";
    closeMaterialBrowser();
    cancelSymbolPreview();
  }

  function toggleInspector() { if (S.inspectorOpen) closeInspector(); else openInspector(); }

  function bindContentControls() {
    [[D.fName, "name"], [D.fArea, "area"], [D.fBody, "body"]].forEach(function (pair) {
      var field = pair[0];
      var key = pair[1];
      field.addEventListener("change", function () { applyContentField(key, field.value); });
      field.addEventListener("keydown", function (event) {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); syncContentFields(); field.blur(); }
        if (event.key === "Enter" && !(field === D.fBody && event.shiftKey)) {
          event.preventDefault();
          applyContentField(key, field.value);
          field.blur();
        }
      });
    });
  }

  function applyContentField(key, value) {
    if (!S.selected.size) return;
    var parsed = key === "area" ? parseArea(value) : value.trim();
    if (key === "area" && parsed === null) {
      toast("Area must be a positive numeric value");
      syncContentFields();
      return;
    }
    selectedIds().forEach(function (id) {
      S.cells[id].content[key] = key === "name" ? (parsed || "Untitled Space") : parsed;
      renderCell(id);
    });
    syncContentFields();
    toast((S.selected.size > 1 ? S.selected.size + " Cells" : "Cell") + " updated · Table / Master Graph production contract");
  }

  function syncContentFields() {
    var ids = selectedIds();
    [D.fName, D.fArea, D.fBody].forEach(function (field) { field.disabled = ids.length === 0; });
    if (!ids.length) {
      D.fName.value = D.fArea.value = D.fBody.value = "";
      D.fName.placeholder = D.fArea.placeholder = D.fBody.placeholder = "Select a Cell";
      return;
    }
    [[D.fName, "name"], [D.fArea, "area"], [D.fBody, "body"]].forEach(function (pair) {
      var values = ids.map(function (id) { return S.cells[id].content[pair[1]]; });
      var mixed = values.some(function (value) { return value !== values[0]; });
      pair[0].value = mixed ? "" : String(values[0]);
      pair[0].placeholder = mixed ? "Mixed" : "";
      pair[0].dataset.mixed = String(mixed);
    });
  }

  /* ── Drawable-symbol registry, filtering and preview ───────────── */
  function bindSymbolLibrary() {
    D.search.addEventListener("input", function () {
      D.searchClear.hidden = !D.search.value;
      renderGlyphGrid();
    });
    D.searchClear.addEventListener("click", function () {
      D.search.value = "";
      D.searchClear.hidden = true;
      D.search.focus();
      renderGlyphGrid();
    });
    $$(".set-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        S.activeCategory = chip.dataset.cat;
        $$(".set-chip").forEach(function (item) {
          var active = item === chip;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        renderGlyphGrid();
      });
    });
    D.remove.addEventListener("click", removeSymbols);
  }

  function filteredGlyphs() {
    var list;
    if (S.activeCategory === "recent") list = S.recents.map(glyphById).filter(Boolean);
    else if (S.activeCategory === "favourites") list = Array.from(S.favourites).map(glyphById).filter(Boolean);
    else if (S.activeCategory === "all") list = GLYPHS.slice();
    else list = GLYPHS.filter(function (glyph) { return glyph.cat === S.activeCategory; });
    var query = D.search.value.trim().toLowerCase();
    if (query) list = list.filter(function (glyph) {
      return glyph.name.toLowerCase().includes(query) || glyph.tags.some(function (tag) { return tag.includes(query); });
    });
    return list;
  }

  function renderGlyphGrid() {
    D.glyphGrid.innerHTML = "";
    var list = filteredGlyphs();
    if (!list.length) {
      var empty = document.createElement("div");
      empty.className = "library-empty";
      empty.textContent = S.activeCategory === "custom"
        ? "Custom symbol import is a clearly marked production handoff; this isolated prototype does not persist assets."
        : "No matching drawable symbols.";
      D.glyphGrid.appendChild(empty);
      return;
    }
    var ids = selectedIds();
    var activeId = ids.length && ids.every(function (id) { return S.cells[id].symbolId === S.cells[ids[0]].symbolId; }) ? S.cells[ids[0]].symbolId : null;
    list.forEach(function (glyph) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "ic-item";
      item.dataset.glyphId = glyph.id;
      item.innerHTML = "<svg aria-hidden=\"true\"><use href=\"#" + glyph.id + "\"></use></svg><span class=\"ic-lbl\">" + glyph.name + "</span>";
      item.classList.toggle("active", activeId === glyph.id);
      item.classList.toggle("fav", S.favourites.has(glyph.id));
      item.setAttribute("aria-label", glyph.name + ". Apply or replace symbol. Right-click or press F to favourite.");
      item.setAttribute("aria-pressed", String(activeId === glyph.id));
      item.dataset.tip = glyph.name + " · click apply/replace · right-click or F favourite";
      item.addEventListener("pointerenter", function () { previewSymbol(glyph.id); });
      item.addEventListener("pointerleave", function () { cancelSymbolPreview(glyph.id); });
      item.addEventListener("focus", function () { previewSymbol(glyph.id); });
      item.addEventListener("blur", function () { cancelSymbolPreview(glyph.id); });
      item.addEventListener("click", function () { applySymbol(glyph.id); });
      item.addEventListener("contextmenu", function (event) { event.preventDefault(); toggleFavourite(glyph.id); });
      item.addEventListener("keydown", function (event) {
        if (event.key.toLowerCase() === "f") { event.preventDefault(); toggleFavourite(glyph.id); }
      });
      D.glyphGrid.appendChild(item);
    });
  }

  function previewSymbol(glyphId) {
    if (!S.selected.size) return;
    S.previewSymbolId = glyphId;
    selectedIds().forEach(renderCellSymbol);
  }

  function cancelSymbolPreview(expectedId) {
    if (!S.previewSymbolId || (expectedId && S.previewSymbolId !== expectedId)) return;
    S.previewSymbolId = null;
    selectedIds().forEach(renderCellSymbol);
  }

  function applySymbol(glyphId) {
    if (!S.selected.size) { toast("Select a Cell before applying a drawable symbol"); return; }
    S.previewSymbolId = null;
    selectedIds().forEach(function (id) { S.cells[id].symbolId = glyphId; renderCellSymbol(id); });
    S.recents = [glyphId].concat(S.recents.filter(function (id) { return id !== glyphId; })).slice(0, 8);
    toast((S.selected.size > 1 ? "Applied to " + S.selected.size + " Cells" : "Symbol applied") + " · one primary symbol per Cell");
    syncAppliedSymbol();
    renderGlyphGrid();
  }

  function removeSymbols() {
    if (!S.selected.size) return;
    var changed = false;
    selectedIds().forEach(function (id) {
      if (S.cells[id].symbolId) changed = true;
      S.cells[id].symbolId = null;
      renderCellSymbol(id);
    });
    if (changed) toast("Primary symbol removed; content and style were preserved");
    syncAppliedSymbol();
    renderGlyphGrid();
  }

  function toggleFavourite(glyphId) {
    var glyph = glyphById(glyphId);
    if (S.favourites.has(glyphId)) { S.favourites.delete(glyphId); toast(glyph.name + " removed from favourites"); }
    else { S.favourites.add(glyphId); toast(glyph.name + " added to favourites"); }
    renderGlyphGrid();
  }

  function syncAppliedSymbol() {
    var ids = selectedIds();
    D.appliedPreview.innerHTML = "";
    if (!ids.length) {
      D.appliedName.textContent = "No Cell selected";
      D.remove.disabled = true;
      return;
    }
    var symbolIds = ids.map(function (id) { return S.cells[id].symbolId; });
    var mixed = symbolIds.some(function (id) { return id !== symbolIds[0]; });
    var glyph = mixed ? null : glyphById(symbolIds[0]);
    D.appliedName.textContent = mixed ? "Mixed symbols" : (glyph ? glyph.name : "No symbol");
    if (glyph) D.appliedPreview.innerHTML = "<svg aria-hidden=\"true\"><use href=\"#" + glyph.id + "\"></use></svg>";
    D.remove.disabled = !symbolIds.some(Boolean);
  }

  /* ── Default / local / mixed style systems ────────────────────── */
  function bindSystemControls() {
    $$(".scope-act").forEach(function (button) {
      button.addEventListener("click", function () { toggleScope(button.dataset.system); });
    });
    $$("#text-presets .tp-card").forEach(function (button) {
      button.addEventListener("click", function () { updateConfig("text", "preset", button.dataset.preset); });
    });
    bindSlider("opt-text-size", "text", "size");
    bindSwatches("opt-text-colour", "text", "colour", "col");

    bindSegment("opt-anchor", "symbol", "anchor");
    bindSlider("opt-offset-x", "symbol", "offsetX");
    bindSlider("opt-offset-y", "symbol", "offsetY");
    bindSlider("opt-scale", "symbol", "scale");
    bindSlider("opt-rotation", "symbol", "rotation");
    bindSwatches("opt-tint", "symbol", "tint", "tint");
    bindSegment("opt-backing-type", "symbol", "backingType");
    bindSlider("opt-backing-size", "symbol", "backingSize");
    bindSlider("opt-backing-opacity", "symbol", "backingOpacity");
    bindSlider("opt-backing-offset-x", "symbol", "backingOffsetX");
    bindSlider("opt-backing-offset-y", "symbol", "backingOffsetY");
    bindToggle("opt-backing-outline", "symbol", "backingOutline");
    bindSlider("opt-outline-width", "symbol", "outlineWidth");
    bindSlider("opt-hide-zoom", "symbol", "hideZoom");

    bindSwatches("opt-fill", "style", "fill", "mat");
    bindToggle("opt-boundary-on", "style", "boundary.visible");
    bindSegment("opt-boundary-style", "style", "boundary.style");
    bindSlider("opt-b-width", "style", "boundary.width");
    bindSlider("opt-b-offset", "style", "boundary.offset");
    bindSlider("opt-b-opacity", "style", "boundary.opacity");
    bindSegment("opt-b-align", "style", "boundary.align");
    bindSwatches("opt-b-colour", "style", "boundary.colour", "col");
    bindToggle("opt-core-on", "style", "core.visible");
    bindSlider("opt-core-size", "style", "core.size");
    bindSlider("opt-core-opacity", "style", "core.opacity");
    bindSwatches("opt-core-colour", "style", "core.colour", "col");
    bindSlider("opt-core-offset-x", "style", "core.offsetX");
    bindSlider("opt-core-offset-y", "style", "core.offsetY");

    $$(".disc").forEach(function (button) {
      button.addEventListener("click", function () {
        var body = document.getElementById("disc-" + button.dataset.disc);
        var open = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", String(open));
        body.hidden = !open;
      });
    });
    bindSegment("opt-selmode", null, null, function (value) {
      document.body.dataset.selmode = value;
      $$("#opt-selmode button").forEach(function (button) {
        var active = button.dataset.val === value;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      toast("Selection display: " + ({ keyline: "Clean Keyline", orbit: "Dotted Orbit", both: "Keyline + Orbit" }[value]));
    });
  }

  function bindSegment(id, system, path, callback) {
    var wrapper = document.getElementById(id);
    $$("button", wrapper).forEach(function (button) {
      button.addEventListener("click", function () {
        if (callback) callback(button.dataset.val);
        else updateConfig(system, path, button.dataset.val);
      });
    });
  }

  function bindSlider(id, system, path) {
    document.getElementById(id).addEventListener("input", function (event) {
      updateConfig(system, path, Number(event.target.value), true);
    });
  }

  function bindToggle(id, system, path) {
    document.getElementById(id).addEventListener("click", function (event) {
      updateConfig(system, path, !event.currentTarget.classList.contains("on"));
    });
  }

  function bindSwatches(id, system, path, dataKey) {
    $$(".swatch", document.getElementById(id)).forEach(function (button) {
      button.addEventListener("click", function () { updateConfig(system, path, button.dataset[dataKey]); });
    });
  }

  function getPath(object, path) {
    return path.split(".").reduce(function (value, key) { return value == null ? undefined : value[key]; }, object);
  }

  function setPath(object, path, value) {
    var keys = path.split(".");
    var target = object;
    keys.slice(0, -1).forEach(function (key) { target = target[key]; });
    target[keys[keys.length - 1]] = value;
  }

  function updateConfig(system, path, value, continuous) {
    var ids = selectedIds();
    if (!ids.length) setPath(defaultsFor(system), path, value);
    else ids.forEach(function (id) {
      var entry = S.cells[id].systems[system];
      if (entry.useDefault || !entry.local) entry.local = clone(resolved(id, system));
      entry.useDefault = false;
      setPath(entry.local, path, value);
    });
    if (system === "symbol") renderAllCellSymbols();
    else renderAllCells();
    syncSystemControls();
    if (!continuous) toast((ids.length > 1 ? ids.length + " Cells" : ids.length ? "Local Cell" : "Project Default") + " " + system + " updated");
  }

  function scopeState(system) {
    var ids = selectedIds();
    if (!ids.length) return "project";
    var entries = ids.map(function (id) { return S.cells[id].systems[system]; });
    if (entries.every(function (entry) { return entry.useDefault; })) return "default";
    if (entries.every(function (entry) { return !entry.useDefault; }) && entries.every(function (entry) { return same(entry.local, entries[0].local); })) return "local";
    return "mixed";
  }

  function toggleScope(system) {
    var ids = selectedIds();
    if (!ids.length) return;
    var state = scopeState(system);
    if (state === "default") ids.forEach(function (id) {
      S.cells[id].systems[system].useDefault = false;
      S.cells[id].systems[system].local = clone(defaultsFor(system));
    });
    else ids.forEach(function (id) {
      S.cells[id].systems[system].useDefault = true;
      S.cells[id].systems[system].local = null;
    });
    renderAllCells();
    syncInspector();
    toast(state === "default" ? "Local override created" : "Returned to Project Default");
  }

  function commonValue(system, path) {
    var ids = selectedIds();
    if (!ids.length) return { mixed: false, value: getPath(defaultsFor(system), path) };
    var values = ids.map(function (id) { return getPath(resolved(id, system), path); });
    return { mixed: values.some(function (value) { return !same(value, values[0]); }), value: values[0] };
  }

  function syncScope(system) {
    var row = document.getElementById("scope-" + system);
    var button = $(".scope-act", row);
    var label = $(".scope-lbl", row);
    var state = scopeState(system);
    row.dataset.state = state;
    if (state === "project") { label.textContent = "Project Default"; button.textContent = "Editing Default"; button.disabled = true; }
    if (state === "default") { label.textContent = "Project Default · inherited"; button.textContent = "Create Override"; button.disabled = false; }
    if (state === "local") { label.textContent = S.selected.size > 1 ? "Local Cell Overrides" : "Local Cell Override"; button.textContent = "Return to Default"; button.disabled = false; }
    if (state === "mixed") { label.textContent = "Mixed"; button.textContent = "Use Project Default"; button.disabled = false; }
    setSystemDisabled(system, state === "default");
  }

  function setSystemDisabled(system, disabled) {
    var selectors = {
      text: ["#text-presets button", "#opt-text-size", "#opt-text-colour button"],
      symbol: ["#opt-anchor button", "#opt-offset-x", "#opt-offset-y", "#opt-scale", "#opt-rotation", "#opt-tint button", "#opt-backing-type button", "#opt-backing-size", "#opt-backing-opacity", "#opt-backing-offset-x", "#opt-backing-offset-y", "#opt-backing-outline", "#opt-outline-width", "#opt-hide-zoom"],
      style: ["#opt-fill button", "#btn-open-browser", "#opt-boundary-on", "#opt-boundary-style button", "#opt-b-width", "#opt-b-offset", "#opt-b-opacity", "#opt-b-align button", "#opt-b-colour button", "#opt-core-on", "#opt-core-size", "#opt-core-opacity", "#opt-core-colour button", "#opt-core-offset-x", "#opt-core-offset-y"]
    };
    selectors[system].forEach(function (selector) { $$(selector).forEach(function (element) { element.disabled = disabled; }); });
  }

  function syncSystemControls() {
    ["text", "symbol", "style"].forEach(syncScope);
    syncSegment("text-presets", "text", "preset", ".tp-card", "preset");
    syncSlider("opt-text-size", "val-text-size", "text", "size", function (value) { return value + "%"; });
    syncSwatches("opt-text-colour", "text", "colour", "col");

    syncSegment("opt-anchor", "symbol", "anchor");
    syncSlider("opt-offset-x", "val-offset-x", "symbol", "offsetX", px);
    syncSlider("opt-offset-y", "val-offset-y", "symbol", "offsetY", px);
    syncSlider("opt-scale", "val-scale", "symbol", "scale", percent);
    syncSlider("opt-rotation", "val-rotation", "symbol", "rotation", function (value) { return value + "°"; });
    syncSwatches("opt-tint", "symbol", "tint", "tint");
    syncSegment("opt-backing-type", "symbol", "backingType");
    syncSlider("opt-backing-size", "val-backing-size", "symbol", "backingSize", px);
    syncSlider("opt-backing-opacity", "val-backing-opacity", "symbol", "backingOpacity", percent);
    syncSlider("opt-backing-offset-x", "val-backing-offset-x", "symbol", "backingOffsetX", px);
    syncSlider("opt-backing-offset-y", "val-backing-offset-y", "symbol", "backingOffsetY", px);
    syncToggle("opt-backing-outline", "val-backing-outline", "symbol", "backingOutline");
    syncSlider("opt-outline-width", "val-outline-width", "symbol", "outlineWidth", tenthsPx);
    syncSlider("opt-hide-zoom", "val-hide-zoom", "symbol", "hideZoom", function (value) { return (value / 100).toFixed(2) + "x"; });

    syncSwatches("opt-fill", "style", "fill", "mat");
    syncToggle("opt-boundary-on", null, "style", "boundary.visible");
    syncSegment("opt-boundary-style", "style", "boundary.style");
    syncSlider("opt-b-width", "val-b-width", "style", "boundary.width", tenthsPx);
    syncSlider("opt-b-offset", "val-b-offset", "style", "boundary.offset", px);
    syncSlider("opt-b-opacity", "val-b-opacity", "style", "boundary.opacity", percent);
    syncSegment("opt-b-align", "style", "boundary.align");
    syncSwatches("opt-b-colour", "style", "boundary.colour", "col");
    syncToggle("opt-core-on", null, "style", "core.visible");
    syncSlider("opt-core-size", "val-core-size", "style", "core.size", px);
    syncSlider("opt-core-opacity", "val-core-opacity", "style", "core.opacity", percent);
    syncSwatches("opt-core-colour", "style", "core.colour", "col");
    syncSlider("opt-core-offset-x", "val-core-offset-x", "style", "core.offsetX", px);
    syncSlider("opt-core-offset-y", "val-core-offset-y", "style", "core.offsetY", px);
    syncConditionalControls();
  }

  function syncSegment(id, system, path, itemSelector, dataKey) {
    var state = commonValue(system, path);
    $$((itemSelector || "button"), document.getElementById(id)).forEach(function (button) {
      var value = button.dataset[dataKey || "val"];
      var active = !state.mixed && value === String(state.value);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function syncSlider(id, valueId, system, path, formatter) {
    var state = commonValue(system, path);
    var input = document.getElementById(id);
    input.value = state.value;
    input.setAttribute("aria-valuetext", state.mixed ? "Mixed" : formatter(state.value));
    if (valueId) document.getElementById(valueId).textContent = state.mixed ? "Mixed" : formatter(state.value);
  }

  function syncToggle(id, valueId, system, path) {
    var state = commonValue(system, path);
    var button = document.getElementById(id);
    button.classList.toggle("on", !state.mixed && Boolean(state.value));
    button.classList.toggle("mixed", state.mixed);
    button.setAttribute("aria-checked", state.mixed ? "mixed" : String(Boolean(state.value)));
    if (valueId) document.getElementById(valueId).textContent = state.mixed ? "mixed" : (state.value ? "on" : "off");
  }

  function syncSwatches(id, system, path, dataKey) {
    var state = commonValue(system, path);
    $$(".swatch", document.getElementById(id)).forEach(function (button) {
      var active = !state.mixed && button.dataset[dataKey] === String(state.value);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function syncConditionalControls() {
    var backing = commonValue("symbol", "backingType");
    var outline = commonValue("symbol", "backingOutline");
    $$(".backing-ctrls").forEach(function (row) { row.hidden = !backing.mixed && backing.value === "none"; });
    $$(".backing-outline-ctrls").forEach(function (row) { row.hidden = (!backing.mixed && backing.value === "none") || (!outline.mixed && !outline.value); });
    var boundary = commonValue("style", "boundary.visible");
    $$(".boundary-ctrls").forEach(function (row) { row.hidden = !boundary.mixed && !boundary.value; });
    if (!boundary.mixed && !boundary.value) {
      $("#disc-boundary-more").hidden = true;
      $(".disc[data-disc='boundary-more']").setAttribute("aria-expanded", "false");
    }
    var core = commonValue("style", "core.visible");
    $$(".core-ctrls").forEach(function (row) { row.hidden = !core.mixed && !core.value; });
    if (!core.mixed && !core.value) {
      $("#disc-core-more").hidden = true;
      $(".disc[data-disc='core-more']").setAttribute("aria-expanded", "false");
    }
    var fill = commonValue("style", "fill");
    D.fillPreview.style.background = fill.mixed ? "conic-gradient(#c6b299 0 25%,#a7b6a4 0 50%,#a4b0be 0 75%,#5a5a5c 0)" : materialById(fill.value).colour;
  }

  function px(value) { return value + "px"; }
  function percent(value) { return value + "%"; }
  function tenthsPx(value) { return (value / 10).toFixed(1) + "px"; }

  /* ── Style clipboard, reset and local preset studies ───────────── */
  function bindStyleActions() {
    $("#btn-copy-style").addEventListener("click", copyStyle);
    $("#btn-paste-style").addEventListener("click", pasteStyle);
    $("#btn-reset-style").addEventListener("click", resetStyle);
    $("#btn-save-preset").addEventListener("click", savePreset);
  }

  function snapshotVisualStyle(cellId) {
    return {
      text: clone(cellId ? resolved(cellId, "text") : defaultsFor("text")),
      symbol: clone(cellId ? resolved(cellId, "symbol") : defaultsFor("symbol")),
      style: clone(cellId ? resolved(cellId, "style") : defaultsFor("style"))
    };
  }

  function copyStyle() {
    var id = primaryId();
    if (!id) return;
    S.styleClipboard = snapshotVisualStyle(id);
    syncStyleActionState();
    toast("Style copied · content and symbol identity excluded");
  }

  function pasteStyle() {
    if (!S.styleClipboard || !S.selected.size) return;
    applyVisualSnapshot(S.styleClipboard);
    toast("Style pasted · content and symbol identity preserved");
  }

  function applyVisualSnapshot(snapshot) {
    var ids = selectedIds();
    if (!ids.length) {
      S.projectDefaults.text = clone(snapshot.text);
      S.projectDefaults.symbol = clone(snapshot.symbol);
      S.projectDefaults.style = clone(snapshot.style);
    } else ids.forEach(function (id) {
      ["text", "symbol", "style"].forEach(function (system) {
        S.cells[id].systems[system] = { useDefault: false, local: clone(snapshot[system]) };
      });
    });
    renderAllCells();
    syncInspector();
  }

  function resetStyle() {
    var ids = selectedIds();
    if (!ids.length) {
      S.projectDefaults = { text: clone(TEXT_FACTORY), symbol: clone(SYMBOL_FACTORY), style: clone(STYLE_FACTORY) };
      toast("Project visual defaults reset to factory values");
    } else {
      ids.forEach(function (id) {
        ["text", "symbol", "style"].forEach(function (system) { S.cells[id].systems[system] = { useDefault: true, local: null }; });
      });
      toast("Returned to Project Defaults · content and symbol identity preserved");
    }
    renderAllCells();
    syncInspector();
  }

  function savePreset() {
    var snapshot = snapshotVisualStyle(primaryId());
    S.savedPresets.push(snapshot);
    if (S.savedPresets.length > 6) S.savedPresets.shift();
    renderSavedPresets();
    toast("Visual preset saved for this prototype session");
  }

  function renderSavedPresets() {
    var wrapper = $("#style-preset-dots");
    wrapper.hidden = !S.savedPresets.length;
    wrapper.innerHTML = "";
    S.savedPresets.forEach(function (preset, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "preset-dot";
      button.textContent = String(index + 1);
      button.style.setProperty("--preset-colour", materialById(preset.style.fill).colour);
      button.style.setProperty("--preset-text", contrastColour(materialById(preset.style.fill).colour));
      button.setAttribute("aria-label", "Apply saved visual preset " + (index + 1));
      button.dataset.tip = "Apply preset " + (index + 1) + " · symbol identity stays unchanged";
      button.addEventListener("click", function () { applyVisualSnapshot(preset); toast("Visual preset applied · symbol identity preserved"); });
      wrapper.appendChild(button);
    });
  }

  function syncStyleActionState() {
    var hasSelection = S.selected.size > 0;
    $("#btn-copy-style").disabled = !hasSelection;
    $("#btn-paste-style").disabled = !hasSelection || !S.styleClipboard;
    $("#btn-paste-style").dataset.tip = S.styleClipboard ? "Paste visual style; content and symbol identity stay unchanged" : "Paste unavailable · copy a Cell style first";
  }

  /* ── Explicit Material Browser handoff mock ────────────────────── */
  function bindMaterialBrowser() {
    $("#btn-open-browser").addEventListener("click", openMaterialBrowser);
    D.browserClose.addEventListener("click", closeMaterialBrowser);
    D.browserSearch.addEventListener("input", function () { renderMaterialGrid(D.browserSearch.value); });
  }

  function openMaterialBrowser() {
    D.browser.hidden = false;
    D.browser.setAttribute("role", "dialog");
    D.browser.setAttribute("aria-label", "Material Browser handoff mock");
    D.browser.setAttribute("aria-modal", "false");
    D.browserSearch.focus();
    toast("Material Browser handoff mock opened · production reuses the V1 owner");
  }

  function closeMaterialBrowser() { D.browser.hidden = true; }

  function renderMaterialGrid(query) {
    var needle = String(query || "").trim().toLowerCase();
    var list = MATERIALS.filter(function (material) { return !needle || material.name.toLowerCase().includes(needle) || material.tags.includes(needle); });
    D.browserGrid.innerHTML = "";
    if (!list.length) {
      var empty = document.createElement("div");
      empty.className = "library-empty";
      empty.textContent = "No matching mock materials.";
      D.browserGrid.appendChild(empty);
      return;
    }
    list.forEach(function (material) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "mb-item";
      button.innerHTML = "<span class=\"mb-orb\" style=\"--material-colour:" + material.colour + "\"></span><span>" + material.name + "</span>";
      button.setAttribute("aria-label", "Apply " + material.name + " material to Cell fill");
      button.addEventListener("click", function () { updateConfig("style", "fill", material.id); toast(material.name + " applied from Material Browser handoff mock"); });
      D.browserGrid.appendChild(button);
    });
  }

  /* ── Shell truthfulness, shortcuts, theme and feedback ─────────── */
  function bindShellAndKeyboard() {
    D.modeSwitch.addEventListener("click", function () {
      S.theme = S.theme === "day" ? "night" : "day";
      document.body.dataset.theme = S.theme;
      D.modeLabel.textContent = S.theme === "day" ? "Day" : "Night";
      D.modeSwitch.setAttribute("aria-pressed", String(S.theme === "night"));
      D.modeSwitch.setAttribute("aria-label", S.theme === "day" ? "Switch to night mode" : "Switch to day mode");
      D.modeSwitch.dataset.tip = S.theme === "day" ? "Night mode · ⇧D" : "Day mode · ⇧D";
      D.modeSwitch.title = D.modeSwitch.dataset.tip;
      renderAllCells();
      toast((S.theme === "day" ? "Day" : "Night") + " mode");
    });
    var gridButton = $(".qv[data-qv='grid']");
    var labelsButton = $(".qv[data-qv='labels']");
    gridButton.classList.add("on");
    gridButton.setAttribute("aria-pressed", "true");
    labelsButton.setAttribute("aria-pressed", "true");
    gridButton.addEventListener("click", function () {
      S.grid = !S.grid;
      D.grid.classList.toggle("g-off", !S.grid);
      gridButton.classList.toggle("on", S.grid);
      gridButton.setAttribute("aria-pressed", String(S.grid));
    });
    labelsButton.addEventListener("click", function () {
      S.labels = !S.labels;
      document.body.dataset.labels = String(S.labels);
      labelsButton.classList.toggle("on", S.labels);
      labelsButton.setAttribute("aria-pressed", String(S.labels));
    });
    $(".rw[data-rail='canvas']").addEventListener("click", function () { toast("Canvas is the current prototype workspace"); });

    window.addEventListener("keydown", function (event) {
      var editingField = /^(INPUT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName);
      if (event.key === "Escape") {
        if (S.editingCellId) { event.preventDefault(); cancelInlineEditor(); return; }
        if (!D.browser.hidden) { event.preventDefault(); closeMaterialBrowser(); return; }
        if (S.previewSymbolId) { event.preventDefault(); cancelSymbolPreview(); return; }
        if (S.inspectorOpen && !editingField) { event.preventDefault(); closeInspector(); }
        return;
      }
      if (editingField || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() === "i") { event.preventDefault(); toggleInspector(); }
      if (event.key.toLowerCase() === "g") { event.preventDefault(); gridButton.click(); }
      if (event.key.toLowerCase() === "l") { event.preventDefault(); labelsButton.click(); }
      if (event.key.toLowerCase() === "d" && event.shiftKey) { event.preventDefault(); D.modeSwitch.click(); }
      if (event.key === "+" || event.key === "=") { event.preventDefault(); setZoom(S.zoom + .1); }
      if (event.key === "-") { event.preventDefault(); setZoom(S.zoom - .1); }
    });
  }

  function markFutureShellControls() {
    [
      ["#drawer-launcher", "Project Drawer · future shell handoff"],
      ["#project-name-btn", "Project menu · future shell handoff"],
      ["#undo-btn", "Undo unavailable · isolated prototype has no production history"],
      ["#redo-btn", "Redo unavailable · isolated prototype has no production history"],
      ["#history-btn", "History · future production handoff"],
      [".qv[data-qv='morph']", "Morph · outside this inspector prototype"],
      [".qv[data-qv='motion']", "Motion · outside this inspector prototype"],
      [".qv[data-qv='fullscreen']", "Full Screen · future shell handoff"],
      [".rw[data-rail='data']", "Data / Table · future workspace handoff"],
      [".rw[data-rail='dashboard']", "Dashboard · future workspace handoff"],
      [".rw[data-rail='files']", "File Intake · future workspace handoff"]
    ].forEach(function (entry) {
      var button = $(entry[0]);
      button.disabled = true;
      button.dataset.tip = entry[1];
      button.title = entry[1];
      button.setAttribute("aria-label", entry[1]);
    });
  }

  function installAccessibility() {
    D.toast.setAttribute("role", "status");
    D.toast.setAttribute("aria-live", "polite");
    D.tooltip.setAttribute("role", "tooltip");
    D.inspector.setAttribute("aria-label", "Cell Inspector");
    D.searchClear.setAttribute("aria-label", "Clear symbol search");
    $$("[data-tip]").forEach(function (element) {
      if (!element.getAttribute("aria-label") && !element.textContent.trim()) element.setAttribute("aria-label", element.dataset.tip);
      element.title = element.dataset.tip;
    });
    $$(".tgl").forEach(function (toggle) { toggle.setAttribute("role", "switch"); });
    $$(".seg").forEach(function (group) {
      group.setAttribute("role", "group");
      $$("button", group).forEach(function (button) { button.setAttribute("aria-pressed", String(button.classList.contains("active"))); });
    });
    $$(".insp-tab").forEach(function (tab) {
      var name = tab.dataset.tab;
      var panel = $(".tab-panel[data-panel='" + name + "']");
      tab.id = "tab-" + name;
      panel.id = "panel-" + name;
      tab.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
    });
    selectTab("content");
  }

  function bindTooltips() {
    document.addEventListener("pointerover", function (event) {
      var target = event.target.closest("[data-tip]");
      if (target) showTooltip(target);
    });
    document.addEventListener("pointerout", function (event) {
      var target = event.target.closest("[data-tip]");
      if (target && (!event.relatedTarget || !target.contains(event.relatedTarget))) hideTooltip();
    });
    document.addEventListener("focusin", function (event) { var target = event.target.closest("[data-tip]"); if (target) showTooltip(target); });
    document.addEventListener("focusout", function (event) { if (event.target.closest("[data-tip]")) hideTooltip(); });
  }

  function showTooltip(target) {
    D.tooltip.textContent = target.dataset.tip;
    D.tooltip.hidden = false;
    var rect = target.getBoundingClientRect();
    var left = clamp(rect.left + rect.width / 2 - D.tooltip.offsetWidth / 2, 6, window.innerWidth - D.tooltip.offsetWidth - 6);
    var top = rect.top - D.tooltip.offsetHeight - 7;
    if (top < 5) top = rect.bottom + 7;
    D.tooltip.style.left = left + "px";
    D.tooltip.style.top = top + "px";
  }

  function hideTooltip() { D.tooltip.hidden = true; }

  function toast(message) {
    window.clearTimeout(S.toastTimer);
    D.toast.textContent = message;
    D.toast.hidden = false;
    S.toastTimer = window.setTimeout(function () { D.toast.hidden = true; }, 2400);
  }

  function syncInspector() {
    var count = S.selected.size;
    D.badge.textContent = count === 0 ? "Project Defaults" : count === 1 ? S.cells[primaryId()].content.name : count + " Cells · Mixed supported";
    syncContentFields();
    syncAppliedSymbol();
    syncSystemControls();
    syncStyleActionState();
    renderGlyphGrid();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
