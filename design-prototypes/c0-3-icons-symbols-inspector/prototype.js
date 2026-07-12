// MOOORF — C0.3 Icons & Symbols Inspector Lab Prototype
// Clean, dependency-free vanilla JS interface logic with premium micro-interactions.

(function () {
  // --- MOCK STATE ---
  const S = {
    theme: "day",
    selected: new Set(), // Set of selected cell IDs: "c1", "c2", "c3"
    inspectorPinned: true,
    inspectorOpen: false,
    
    // Project default icon configuration
    projectDefaults: {
      anchor: "centre",
      offsetX: 0,
      offsetY: 0,
      scale: 100,
      rotation: 0,
      opacity: 100,
      tint: "#222222",
      backingType: "circle",
      backingSize: 32,
      backingOpacity: 100,
      backingOffsetX: 0,
      backingOffsetY: 0,
      backingBoundary: true,
      boundaryWidth: 10,
      hideZoom: 45,
      exportInclude: true
    },
    
    // Local cell overrides
    cellsData: {
      c1: {
        id: "c1",
        name: "Studio",
        area: 48,
        iconId: "a-living", // applied sofa icon
        useDefaults: false,
        localConfig: {
          anchor: "centre",
          offsetX: 0,
          offsetY: 0,
          scale: 120, // custom overrides
          rotation: 0,
          opacity: 100,
          tint: "#c31616",
          backingType: "circle",
          backingSize: 36,
          backingOpacity: 100,
          backingOffsetX: 0,
          backingOffsetY: 0,
          backingBoundary: true,
          boundaryWidth: 15,
          hideZoom: 45,
          exportInclude: true
        }
      },
      c2: {
        id: "c2",
        name: "Workspace",
        area: 24,
        iconId: null,
        useDefaults: true,
        localConfig: null
      },
      c3: {
        id: "c3",
        name: "Lounge",
        area: 32,
        iconId: null,
        useDefaults: true,
        localConfig: null
      }
    },

    // Temporary preview state
    previewIconId: null
  };

  // --- GLYPH DATASET ---
  const GLYPHS = [
    // Architecture
    { id: "a-living", name: "Living", cat: "architecture", tags: ["sofa", "living", "couch", "furniture"] },
    { id: "a-bedroom", name: "Bedroom", cat: "architecture", tags: ["bed", "bedroom", "rest", "furniture"] },
    { id: "a-kitchen", name: "Kitchen", cat: "architecture", tags: ["stove", "kitchen", "cook", "counter"] },
    { id: "a-toilet", name: "Toilet", cat: "architecture", tags: ["toilet", "wc", "bathroom", "restroom"] },
    { id: "a-stair", name: "Stairs", cat: "architecture", tags: ["stair", "stairs", "level", "circulation"] },
    { id: "a-lift", name: "Lift", cat: "architecture", tags: ["lift", "elevator", "circulation", "level"] },
    { id: "a-parking", name: "Parking", cat: "architecture", tags: ["parking", "p", "car", "vehicular"] },
    { id: "a-circulation", name: "Circulation", cat: "architecture", tags: ["corridor", "path", "circulation", "loop"] },
    { id: "a-service", name: "Service", cat: "architecture", tags: ["service", "util", "mep", "gear"] },

    // Landscape
    { id: "l-tree", name: "Tree", cat: "landscape", tags: ["tree", "pine", "plant", "green", "outdoor"] },
    { id: "l-green", name: "Green Space", cat: "landscape", tags: ["leaf", "green", "grass", "plant"] },
    { id: "l-water", name: "Water", cat: "landscape", tags: ["water", "waves", "pool", "lake", "outdoor"] },
    { id: "l-outdoor", name: "Outdoor Deck", cat: "landscape", tags: ["table", "umbrella", "deck", "terrace"] },
    { id: "l-terrain", name: "Terrain", cat: "landscape", tags: ["mountain", "terrain", "site", "topo"] },

    // Diagram
    { id: "d-cutx", name: "Void Cross", cat: "diagram", tags: ["void", "cutout", "x", "cross"] },
    { id: "d-entry", name: "Entry", cat: "diagram", tags: ["entry", "in", "arrow", "door"] },
    { id: "d-exit", name: "Exit", cat: "diagram", tags: ["exit", "out", "arrow", "door"] },
    { id: "d-public", name: "Public Zoning", cat: "diagram", tags: ["public", "zoning", "shared", "people"] },
    { id: "d-private", name: "Private Zoning", cat: "diagram", tags: ["private", "zoning", "lock", "restricted"] },
    { id: "d-restricted", name: "Restricted", cat: "diagram", tags: ["restricted", "strike", "block", "no-go"] },

    // Shell & Navigation
    { id: "i-drawer", name: "Drawer", cat: "navigation", tags: ["drawer", "folder", "archive"] },
    { id: "i-undo", name: "Undo", cat: "navigation", tags: ["undo", "back"] },
    { id: "i-redo", name: "Redo", cat: "navigation", tags: ["redo", "forward"] },
    { id: "i-history", name: "History", cat: "navigation", tags: ["history", "clock", "time"] },
    { id: "i-morph", name: "Morph", cat: "navigation", tags: ["morph", "membrane", "bubbles"] },
    { id: "i-motion", name: "Motion", cat: "navigation", tags: ["motion", "wave", "wavefront"] },
    { id: "i-grid", name: "Grid", cat: "navigation", tags: ["grid", "pattern", "snap"] },
    { id: "i-labels", name: "Labels", cat: "navigation", tags: ["labels", "list", "text"] },
    { id: "i-fullscreen", name: "Fullscreen", cat: "navigation", tags: ["fullscreen", "maximize"] },
    { id: "i-close", name: "Close", cat: "navigation", tags: ["close", "cancel", "cross", "x"] }
  ];

  // --- RECENT & FAVOURITES STORAGE ---
  const recents = new Set(["a-living", "l-tree"]);
  const favourites = new Set(["a-bedroom", "d-cutx"]);

  // --- DOM CACHE ---
  const D = {
    inspector: document.getElementById("inspector"),
    inspPin: document.getElementById("insp-pin"),
    inspClose: document.getElementById("insp-close"),
    selBadge: document.getElementById("sel-badge"),
    icSearch: document.getElementById("ic-search-input"),
    icSearchClear: document.getElementById("ic-search-clear"),
    icGrid: document.getElementById("ic-library-grid"),
    
    // Sliders
    optAnchor: document.getElementById("opt-anchor"),
    optOffsetX: document.getElementById("opt-offset-x"),
    optOffsetY: document.getElementById("opt-offset-y"),
    optScale: document.getElementById("opt-scale"),
    optRotation: document.getElementById("opt-rotation"),
    optOpacity: document.getElementById("opt-opacity"),
    optTint: document.getElementById("opt-tint"),
    optBackingType: document.getElementById("opt-backing-type"),
    optBackingSize: document.getElementById("opt-backing-size"),
    optBackingOpacity: document.getElementById("opt-backing-opacity"),
    optBackingOffsetX: document.getElementById("opt-backing-offset-x"),
    optBackingOffsetY: document.getElementById("opt-backing-offset-y"),
    optBackingBoundary: document.getElementById("opt-backing-boundary"),
    optBoundaryWidth: document.getElementById("opt-boundary-width"),
    optDefaultsToggle: document.getElementById("opt-defaults-toggle"),
    optHideZoom: document.getElementById("opt-hide-zoom"),
    optExportToggle: document.getElementById("opt-export-toggle"),

    // Val text display
    valOffsetX: document.getElementById("val-offset-x"),
    valOffsetY: document.getElementById("val-offset-y"),
    valScale: document.getElementById("val-scale"),
    valRotation: document.getElementById("val-rotation"),
    valOpacity: document.getElementById("val-opacity"),
    valBackingSize: document.getElementById("val-backing-size"),
    valBackingOpacity: document.getElementById("val-backing-opacity"),
    valBackingOffsetX: document.getElementById("val-backing-offset-x"),
    valBackingOffsetY: document.getElementById("val-backing-offset-y"),
    valBackingBoundary: document.getElementById("val-backing-boundary"),
    valBoundaryWidth: document.getElementById("val-boundary-width"),
    valHideZoom: document.getElementById("val-hide-zoom"),

    toast: document.getElementById("toast"),
    tooltip: document.getElementById("tooltip"),
    modeSwitch: document.getElementById("mode-switch"),
    removeBtn: document.getElementById("btn-remove-icon")
  };

  // --- INITIALIZATION ---
  function init() {
    bindSelectionHandlers();
    bindInspectorControls();
    bindKeyboardHandlers();
    bindDragHandlers();
    
    renderGrid("all");
    renderAllCellIcons();
    updateInspectorState();
    
    // Sync pinned state dataset on load
    document.body.dataset.inspectorPinned = String(S.inspectorPinned);
  }

  // --- CELL INTERACTION & SELECTION ---
  function bindSelectionHandlers() {
    document.querySelectorAll(".cell").forEach(cell => {
      cell.addEventListener("pointerdown", e => {
        e.stopPropagation();
        
        // Multi selection checks
        if (e.shiftKey || e.metaKey || e.ctrlKey) {
          if (S.selected.has(cell.id)) {
            S.selected.delete(cell.id);
          } else {
            S.selected.add(cell.id);
          }
        } else {
          S.selected.clear();
          S.selected.add(cell.id);
        }
        
        updateSelectionVisuals();
      });
    });

    document.getElementById("stage").addEventListener("pointerdown", e => {
      // Clear selection on empty background click
      if (e.target.id === "stage" || e.target.id === "grid-layer") {
        S.selected.clear();
        updateSelectionVisuals();
      }
    });

    // Top clusters toggles
    document.querySelectorAll(".qv").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("on");
        const key = btn.dataset.qv;
        if (key === "grid") {
          document.getElementById("grid-layer").classList.toggle("g-off", !btn.classList.contains("on"));
        }
      });
    });

    // Theme Mode Switcher
    D.modeSwitch.addEventListener("click", () => {
      S.theme = S.theme === "day" ? "night" : "day";
      document.body.setAttribute("data-theme", S.theme);
      D.modeSwitch.querySelector("span").textContent = S.theme === "day" ? "Day" : "Night";
      toast(`Theme Mode set to: ${S.theme.toUpperCase()}`);
      
      // Update cell contrast classes based on background tint (auto contrast)
      updateCellContrastStyles();
    });
  }

  function updateSelectionVisuals() {
    document.querySelectorAll(".cell").forEach(cell => {
      cell.classList.toggle("selected", S.selected.has(cell.id));
    });
    
    updateInspectorState();
  }

  function updateCellContrastStyles() {
    // Standard auto contrast styling:
    // If night theme: light labels. If day theme: dark labels.
    document.querySelectorAll(".cell").forEach(cell => {
      cell.classList.toggle("light-label", S.theme === "night");
      cell.classList.toggle("dark-label", S.theme === "day");
    });
  }

  // --- KEYBOARD TRIGGERS ---
  function bindKeyboardHandlers() {
    window.addEventListener("keydown", e => {
      // Block triggers if user is inside search input or range/toggle sliders
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        return;
      }

      const key = e.key.toLowerCase();
      
      // Key "I" opens/closes icons inspector
      if (key === "i") {
        e.preventDefault();
        toggleInspector();
      }

      // Key "Escape" closes inspector and cancels hover preview
      if (e.key === "Escape") {
        if (S.previewIconId) {
          cancelHoverPreview();
        } else if (S.inspectorOpen) {
          closeInspector();
        }
      }
    });
  }

  // --- DRAGGING CELLS ---
  function bindDragHandlers() {
    document.querySelectorAll(".cell").forEach(cell => {
      let isDragging = false;
      let startX, startY, origLeft, origTop;

      cell.addEventListener("pointerdown", e => {
        if (e.button !== 0) return; // Left mouse click only
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        origLeft = parseInt(cell.style.left) || 0;
        origTop = parseInt(cell.style.top) || 0;
        cell.setPointerCapture(e.pointerId);
      });

      cell.addEventListener("pointermove", e => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        cell.style.left = `${origLeft + dx}px`;
        cell.style.top = `${origTop + dy}px`;
      });

      cell.addEventListener("pointerup", e => {
        if (!isDragging) return;
        isDragging = false;
        cell.releasePointerCapture(e.pointerId);
        // Free placement on release — production V8.2C0 drag has no
        // implicit grid snap; the applied icon travels with its cell.
      });
    });
  }

  // --- INSPECTOR LIFE CYCLE ---
  function toggleInspector() {
    if (S.inspectorOpen) {
      closeInspector();
    } else {
      openInspector();
    }
  }

  function openInspector() {
    S.inspectorOpen = true;
    D.inspector.hidden = false;
    toast("Icons Inspector Opened");
    
    // Pre-populate input controls based on current selection
    updateInspectorControlsValues();
  }

  function closeInspector() {
    S.inspectorOpen = false;
    D.inspector.hidden = true;
    cancelHoverPreview();
  }

  function updateInspectorState() {
    const count = S.selected.size;
    
    if (count === 0) {
      D.selBadge.textContent = "Project Defaults";
      D.removeBtn.disabled = true;
      D.optDefaultsToggle.disabled = true;
    } else if (count === 1) {
      D.selBadge.textContent = "Selection";
      const id = Array.from(S.selected)[0];
      const data = S.cellsData[id];
      D.removeBtn.disabled = !data.iconId;
      D.optDefaultsToggle.disabled = false;
    } else {
      D.selBadge.textContent = `${count} Cells`;
      D.removeBtn.disabled = false;
      D.optDefaultsToggle.disabled = false;
    }

    // Refresh control visual values to reflect selection
    updateInspectorControlsValues();
  }

  // --- LIBRARY GRID RENDER & FILTERS ---
  function renderGrid(category, query = "") {
    D.icGrid.innerHTML = "";
    
    let filtered = GLYPHS;
    
    // Category filter — recents keep true newest-first insertion order
    if (category === "recent") {
      filtered = [...recents].map(id => GLYPHS.find(g => g.id === id)).filter(Boolean);
    } else if (category === "favourites") {
      filtered = [...favourites].map(id => GLYPHS.find(g => g.id === id)).filter(Boolean);
    } else if (category !== "all") {
      filtered = GLYPHS.filter(g => g.cat === category);
    }

    // Query Search filter
    if (query) {
      const needle = query.toLowerCase().trim();
      filtered = filtered.filter(g => g.name.toLowerCase().includes(needle) || g.tags.some(t => t.includes(needle)));
    }

    if (filtered.length === 0) {
      D.icGrid.innerHTML = `<div style="grid-column:1/-1;padding:24px 8px;color:var(--text-muted);font-size:10px;text-align:center;">No matching glyphs found</div>`;
      return;
    }

    filtered.forEach(glyph => {
      const item = document.createElement("div");
      item.className = "ic-item";
      item.dataset.glyphId = glyph.id;
      item.setAttribute("data-tip", `${glyph.name} · right-click to favourite`);

      // Retrieve path fromdefs
      item.innerHTML = `
        <svg><use href="#${glyph.id}"/></svg>
        <span class="ic-lbl">${glyph.name}</span>
      `;

      // Active state highlight if current applied/preview
      const appliedIconId = getActiveIconIdForSelection();
      if (appliedIconId === glyph.id) {
        item.classList.add("active");
      }
      if (favourites.has(glyph.id)) {
        item.classList.add("fav");
      }

      // Bind events for hover preview & click apply
      item.addEventListener("pointerenter", () => triggerHoverPreview(glyph.id));
      item.addEventListener("pointerleave", () => cancelHoverPreview());
      item.addEventListener("click", () => applyIconToSelection(glyph.id));

      // Right-click toggles favourite (V1 material-shelf convention)
      item.addEventListener("contextmenu", e => {
        e.preventDefault();
        if (favourites.has(glyph.id)) {
          favourites.delete(glyph.id);
          toast(`Removed ${glyph.name} from favourites`);
        } else {
          favourites.add(glyph.id);
          toast(`Added ${glyph.name} to favourites`);
        }
        const activeCat = document.querySelector(".set-chip.active").dataset.cat;
        renderGrid(activeCat, D.icSearch.value);
      });

      D.icGrid.appendChild(item);
    });
  }

  function getActiveIconIdForSelection() {
    if (S.selected.size === 1) {
      const id = Array.from(S.selected)[0];
      return S.cellsData[id].iconId;
    }
    return null;
  }

  // Bind Search Filter
  D.icSearch.addEventListener("input", e => {
    const q = e.target.value;
    D.icSearchClear.hidden = !q;
    const activeCat = document.querySelector(".set-chip.active").dataset.cat;
    renderGrid(activeCat, q);
  });

  D.icSearchClear.addEventListener("click", () => {
    D.icSearch.value = "";
    D.icSearchClear.hidden = true;
    const activeCat = document.querySelector(".set-chip.active").dataset.cat;
    renderGrid(activeCat);
  });

  // Bind Category Chips
  document.querySelectorAll(".set-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".set-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderGrid(chip.dataset.cat, D.icSearch.value);
    });
  });

  // --- HOVER PREVIEW ---
  function triggerHoverPreview(glyphId) {
    if (S.selected.size === 0) return;
    
    S.previewIconId = glyphId;
    
    // Temporarily draw icons with preview class in DOM
    S.selected.forEach(cellId => {
      renderCellIcon(cellId, glyphId, true);
    });
  }

  function cancelHoverPreview() {
    if (!S.previewIconId) return;
    S.previewIconId = null;
    
    // Revert cells to original state
    if (S.selected.size > 0) {
      S.selected.forEach(cellId => {
        const origIconId = S.cellsData[cellId].iconId;
        renderCellIcon(cellId, origIconId);
      });
    }
  }

  // --- APPLY / REMOVE ICON ---
  function applyIconToSelection(glyphId) {
    if (S.selected.size === 0) {
      toast("Please select a space cell to apply the icon");
      return;
    }

    S.selected.forEach(cellId => {
      const data = S.cellsData[cellId];
      data.iconId = glyphId;

      // Initialize local configuration if overrides active
      if (!data.localConfig) {
        data.localConfig = Object.assign({}, S.projectDefaults);
      }

      renderCellIcon(cellId, glyphId);
    });

    // Recents populate from real use: newest first, capped at 8.
    recents.delete(glyphId);
    const recentList = [glyphId, ...recents];
    recents.clear();
    recentList.slice(0, 8).forEach(id => recents.add(id));

    toast(`Applied icon: ${glyphId.replace("a-", "").replace("l-", "").replace("d-", "").replace("i-", "").toUpperCase()}`);
    updateInspectorState();
    
    // Re-render library grid highlights
    const activeCat = document.querySelector(".set-chip.active").dataset.cat;
    renderGrid(activeCat, D.icSearch.value);
  }

  D.removeBtn.addEventListener("click", () => {
    if (S.selected.size === 0) return;

    S.selected.forEach(cellId => {
      S.cellsData[cellId].iconId = null;
      renderCellIcon(cellId, null);
    });

    toast("Icons removed from selection");
    updateInspectorState();
    
    // Re-render library grid highlight removal
    const activeCat = document.querySelector(".set-chip.active").dataset.cat;
    renderGrid(activeCat, D.icSearch.value);
  });

  // --- CELL ICON RENDER ENGINE (HTML DOM Overlay) ---
  function renderAllCellIcons() {
    Object.keys(S.cellsData).forEach(cellId => {
      const data = S.cellsData[cellId];
      renderCellIcon(cellId, data.iconId);
    });
  }

  function renderCellIcon(cellId, iconId, isPreview = false) {
    const wrap = document.getElementById(`${cellId}-icon`);
    if (!wrap) return;

    wrap.innerHTML = "";
    const hostCell = document.getElementById(cellId);
    if (!iconId) {
      if (hostCell) {
        hostCell.classList.remove("has-icon");
        hostCell.style.removeProperty("--label-shift");
      }
      return;
    }

    const cellData = S.cellsData[cellId];

    // Resolve configurations: local vs global default
    const config = cellData.useDefaults ? S.projectDefaults : (cellData.localConfig || S.projectDefaults);

    const size = config.backingSize;
    const opacityVal = config.opacity / 100;
    const scaleVal = config.scale / 100;
    const rotationVal = config.rotation;
    const tintVal = config.tint;

    // Anchor preset → base offset from cell centre, before custom offsets.
    // Cell radius comes from the live DOM so the anchor tracks cell size.
    const cellEl = document.getElementById(cellId);
    const radius = cellEl ? cellEl.offsetWidth / 2 : 50;
    const edge = radius * 0.72; // keep anchored icons inside the boundary
    const ANCHORS = {
      "centre":    [0, 0],
      "above":     [0, -edge],
      "below":     [0, edge],
      "top-left":  [-edge * 0.72, -edge * 0.72],
      "top-right": [edge * 0.72, -edge * 0.72]
    };
    const [ax, ay] = ANCHORS[config.anchor] || ANCHORS.centre;
    const tx = ax + config.offsetX;
    const ty = ay + config.offsetY;

    // Create elements
    if (config.backingType !== "none") {
      const backing = document.createElement("div");
      backing.className = "icon-backing";

      // Set dimensions & styling
      backing.style.width = `${size}px`;
      backing.style.height = `${size}px`;

      const backColor = config.backingType === "auto" ? (S.theme === "night" ? "#222222" : "#ffffff") : "#ffffff";
      backing.style.backgroundColor = backColor;
      backing.style.opacity = (isPreview ? 0.5 : 1) * config.backingOpacity / 100;

      if (config.backingBoundary) {
        const borderCol = S.theme === "night" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
        backing.style.border = `${config.boundaryWidth / 10}px solid ${borderCol}`;
      } else {
        backing.style.border = "none";
      }

      // Backing follows the anchored icon position plus its own offset,
      // and scales with the icon so the pair stays one visual unit.
      backing.style.transform =
        `translate(${tx + config.backingOffsetX}px, ${ty + config.backingOffsetY}px) scale(${scaleVal})`;

      wrap.appendChild(backing);
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon-svg");
    svg.innerHTML = `<use href="#${iconId}"/>`;

    // Apply styling transforms
    svg.style.width = `${size * 0.65}px`;
    svg.style.height = `${size * 0.65}px`;
    svg.style.color = tintVal;

    let transformStr = `translate(${tx}px, ${ty}px) scale(${scaleVal}) rotate(${rotationVal}deg)`;
    svg.style.transform = transformStr;
    svg.style.opacity = isPreview ? 0.5 : opacityVal;

    // Add CSS class for preview visual effect
    if (isPreview) {
      svg.classList.add("preview-mode");
    }

    wrap.appendChild(svg);

    // Centre-anchored icons push the label below the backing so text never
    // strikes through the glyph; other anchors leave the label centred.
    if (hostCell) {
      hostCell.classList.add("has-icon");
      const shift = config.anchor === "centre"
        ? (size / 2) * scaleVal + 10 + ty
        : 0;
      hostCell.style.setProperty("--label-shift", `${shift}px`);
    }
  }

  // --- INSPECTOR CONTROLS SYNCING ---
  function bindInspectorControls() {
    // Pin button toggle
    D.inspPin.addEventListener("click", () => {
      S.inspectorPinned = !S.inspectorPinned;
      document.body.dataset.inspectorPinned = String(S.inspectorPinned);
      D.inspector.classList.toggle("pinned", S.inspectorPinned);
      D.inspPin.classList.toggle("on", S.inspectorPinned);
      toast(S.inspectorPinned ? "Inspector Pinned" : "Inspector Floating");
    });

    D.inspClose.addEventListener("click", closeInspector);

    // Segment options
    bindSegmentToggle("opt-anchor", val => updateActiveConfig("anchor", val));
    bindSegmentToggle("opt-backing-type", val => {
      updateActiveConfig("backingType", val);
      // Toggle controls visibility based on backing selection
      const ctrls = document.querySelectorAll(".backing-ctrls");
      ctrls.forEach(c => c.style.display = val === "none" ? "none" : "flex");
    });

    // Sliders & continuous inputs
    bindSlider("opt-offset-x", val => {
      D.valOffsetX.textContent = `${val}px`;
      updateActiveConfig("offsetX", parseInt(val));
    });
    bindSlider("opt-offset-y", val => {
      D.valOffsetY.textContent = `${val}px`;
      updateActiveConfig("offsetY", parseInt(val));
    });
    bindSlider("opt-scale", val => {
      D.valScale.textContent = `${val}%`;
      updateActiveConfig("scale", parseInt(val));
    });
    bindSlider("opt-rotation", val => {
      D.valRotation.textContent = `${val}°`;
      updateActiveConfig("rotation", parseInt(val));
    });
    bindSlider("opt-opacity", val => {
      D.valOpacity.textContent = `${val}%`;
      updateActiveConfig("opacity", parseInt(val));
    });
    bindSlider("opt-backing-size", val => {
      D.valBackingSize.textContent = `${val}px`;
      updateActiveConfig("backingSize", parseInt(val));
    });
    bindSlider("opt-backing-opacity", val => {
      D.valBackingOpacity.textContent = `${val}%`;
      updateActiveConfig("backingOpacity", parseInt(val));
    });
    bindSlider("opt-backing-offset-x", val => {
      D.valBackingOffsetX.textContent = `${val}px`;
      updateActiveConfig("backingOffsetX", parseInt(val));
    });
    bindSlider("opt-backing-offset-y", val => {
      D.valBackingOffsetY.textContent = `${val}px`;
      updateActiveConfig("backingOffsetY", parseInt(val));
    });
    bindSlider("opt-boundary-width", val => {
      D.valBoundaryWidth.textContent = `${(val / 10).toFixed(1)}px`;
      updateActiveConfig("boundaryWidth", parseInt(val));
    });
    bindSlider("opt-hide-zoom", val => {
      D.valHideZoom.textContent = `${(val / 100).toFixed(2)}x`;
      updateActiveConfig("hideZoom", parseInt(val));
    });

    // Switches
    bindToggle("opt-backing-boundary", val => {
      D.valBackingBoundary.textContent = val ? "on" : "off";
      updateActiveConfig("backingBoundary", val);
      document.querySelector(".backing-boundary-ctrls").style.display = val ? "flex" : "none";
    });

    bindToggle("opt-export-toggle", val => {
      updateActiveConfig("exportInclude", val);
    });

    bindToggle("opt-defaults-toggle", val => {
      // "Use Project Defaults" toggle
      if (S.selected.size > 0) {
        S.selected.forEach(cellId => {
          S.cellsData[cellId].useDefaults = val;
          if (val) {
            // Apply project default preset parameters
            renderCellIcon(cellId, S.cellsData[cellId].iconId);
          }
        });
        
        toast(val ? "Using Project Defaults" : "Using Local Overrides");
        updateInspectorControlsValues();
      }
    });

    // Swatches Tint selection
    document.querySelectorAll("#opt-tint .swatch").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#opt-tint .swatch").forEach(s => s.classList.remove("active"));
        btn.classList.add("active");
        updateActiveConfig("tint", btn.dataset.tint);
      });
    });
  }

  function bindSegmentToggle(containerId, callback) {
    const wrap = document.getElementById(containerId);
    wrap.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        wrap.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        callback(btn.dataset.val);
      });
    });
  }

  function bindSlider(id, callback) {
    const inp = document.getElementById(id);
    inp.addEventListener("input", e => callback(e.target.value));
  }

  function bindToggle(id, callback) {
    const btn = document.getElementById(id);
    btn.addEventListener("click", () => {
      btn.classList.toggle("on");
      callback(btn.classList.contains("on"));
    });
  }

  // --- STATE MUTATORS ---
  function updateActiveConfig(key, value) {
    // If no cells selected, we are modifying global defaults
    if (S.selected.size === 0) {
      S.projectDefaults[key] = value;
      // Re-render all cells using defaults
      Object.keys(S.cellsData).forEach(cellId => {
        if (S.cellsData[cellId].useDefaults) {
          renderCellIcon(cellId, S.cellsData[cellId].iconId);
        }
      });
    } else {
      S.selected.forEach(cellId => {
        const data = S.cellsData[cellId];
        if (!data.localConfig) {
          data.localConfig = Object.assign({}, S.projectDefaults);
        }
        data.localConfig[key] = value;
        
        // Sync icon display rendering
        renderCellIcon(cellId, data.iconId);
      });
    }
  }

  function updateInspectorControlsValues() {
    let config = S.projectDefaults;
    let isOverride = false;

    if (S.selected.size === 1) {
      const id = Array.from(S.selected)[0];
      const data = S.cellsData[id];
      isOverride = !data.useDefaults;
      config = isOverride ? (data.localConfig || S.projectDefaults) : S.projectDefaults;
      
      D.optDefaultsToggle.classList.toggle("on", !isOverride);
    } else if (S.selected.size > 1) {
      // Multiple selection: controls unlock when any member holds overrides
      let allUseDefaults = true;
      S.selected.forEach(cellId => {
        if (!S.cellsData[cellId].useDefaults) allUseDefaults = false;
      });
      isOverride = !allUseDefaults;
      D.optDefaultsToggle.classList.toggle("on", allUseDefaults);
    } else {
      D.optDefaultsToggle.classList.remove("on");
    }

    // Apply values to HTML controls
    setSegmentActive("opt-anchor", config.anchor);
    setSegmentActive("opt-backing-type", config.backingType);
    
    // Sliders
    setSliderValue("opt-offset-x", D.valOffsetX, `${config.offsetX}px`, config.offsetX);
    setSliderValue("opt-offset-y", D.valOffsetY, `${config.offsetY}px`, config.offsetY);
    setSliderValue("opt-scale", D.valScale, `${config.scale}%`, config.scale);
    setSliderValue("opt-rotation", D.valRotation, `${config.rotation}°`, config.rotation);
    setSliderValue("opt-opacity", D.valOpacity, `${config.opacity}%`, config.opacity);
    setSliderValue("opt-backing-size", D.valBackingSize, `${config.backingSize}px`, config.backingSize);
    setSliderValue("opt-backing-opacity", D.valBackingOpacity, `${config.backingOpacity}%`, config.backingOpacity);
    setSliderValue("opt-backing-offset-x", D.valBackingOffsetX, `${config.backingOffsetX || 0}px`, config.backingOffsetX || 0);
    setSliderValue("opt-backing-offset-y", D.valBackingOffsetY, `${config.backingOffsetY || 0}px`, config.backingOffsetY || 0);
    setSliderValue("opt-boundary-width", D.valBoundaryWidth, `${(config.boundaryWidth / 10).toFixed(1)}px`, config.boundaryWidth);
    setSliderValue("opt-hide-zoom", D.valHideZoom, `${(config.hideZoom / 100).toFixed(2)}x`, config.hideZoom);

    // Switches
    setToggleActive("opt-backing-boundary", D.valBackingBoundary, config.backingBoundary);
    setToggleActive("opt-export-toggle", null, config.exportInclude);

    // Color Swatch active highlight
    document.querySelectorAll("#opt-tint .swatch").forEach(s => {
      s.classList.toggle("active", s.dataset.tint === config.tint);
    });

    // Enable/disable inputs based on override check
    const shouldDisable = (S.selected.size > 0 && !isOverride);
    document.querySelectorAll(".insp-body input, .insp-body select, .insp-body .seg:not(#opt-defaults-toggle), .insp-body .swatch").forEach(el => {
      if (el.id !== "opt-defaults-toggle") {
        el.style.pointerEvents = shouldDisable ? "none" : "auto";
        el.style.opacity = shouldDisable ? "0.46" : "1";
      }
    });
  }

  function setSegmentActive(containerId, value) {
    const wrap = document.getElementById(containerId);
    wrap.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.val === value);
    });
  }

  function setSliderValue(inputId, valDisplayId, displayStr, value) {
    const inp = document.getElementById(inputId);
    inp.value = value;
    if (valDisplayId) valDisplayId.textContent = displayStr;
  }

  function setToggleActive(id, valDisplayId, value) {
    const btn = document.getElementById(id);
    btn.classList.toggle("on", value);
    if (valDisplayId) valDisplayId.textContent = value ? "on" : "off";
  }

  // --- UI UTILITIES (TOAST / TOOLTIP) ---
  function toast(message) {
    D.toast.textContent = message;
    D.toast.hidden = false;
    
    // Trigger pop animation
    D.toast.style.animation = "none";
    D.toast.offsetHeight; // reflow trigger
    D.toast.style.animation = "toast-in var(--t-sheet) var(--ease-pop) forwards";
    
    setTimeout(() => {
      D.toast.hidden = true;
    }, 2800);
  }

  // Tooltips setup
  document.addEventListener("pointerover", e => {
    const t = e.target.closest("[data-tip]");
    if (!t) return;
    
    D.tooltip.textContent = t.getAttribute("data-tip");
    D.tooltip.hidden = false;
    D.tooltip.classList.add("show");
    
    // Position tooltip
    const rect = t.getBoundingClientRect();
    D.tooltip.style.left = `${rect.left + rect.width / 2 - D.tooltip.offsetWidth / 2}px`;
    D.tooltip.style.top = `${rect.top - D.tooltip.offsetHeight - 8}px`;
  });

  document.addEventListener("pointerout", e => {
    if (e.target.closest("[data-tip]")) {
      D.tooltip.classList.remove("show");
      D.tooltip.hidden = true;
    }
  });

  // Start the engine
  document.addEventListener("DOMContentLoaded", init);
})();
