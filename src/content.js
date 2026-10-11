/**
 * Content script: owns key handling.
 *
 * Press the leader (default Ctrl+\), then a bound key (see common/bindings.js).
 * The leader and the following key are swallowed so the page never sees them.
 *
 * Runs at document_start with a capture-phase listener on window so it sees
 * keys before page scripts do. Does not run on privileged pages (about:*,
 * addons.mozilla.org) and does not see keys while focus is in the browser UI.
 *
 * Coexisting with other key handlers (Vimium, site shortcuts): those usually
 * also listen on window in the capture phase and stop propagation for keys
 * they bind, so whichever registered first wins. To make the key *after* the
 * leader reach us regardless, leader mode moves focus into a hidden text input
 * owned by this script. Vimium and nearly every site ignore keys typed into an
 * editable element, so they let it through. Focus is restored afterwards.
 */

let settings = structuredClone(DEFAULT_SETTINGS);
let pending = false;
let pendingTimer = null;
let indicator = null;
let focusTrap = null;
let previousFocus = null;

loadSettings().then((loaded) => {
  settings = loaded;
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") {
    return;
  }
  for (const [key, { newValue }] of Object.entries(changes)) {
    settings[key] = newValue ?? DEFAULT_SETTINGS[key];
  }
});

function swallow(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function enterLeaderMode() {
  pending = true;
  previousFocus = document.activeElement;
  showIndicator();
  grabFocus();
  if (settings.leaderTimeoutMs > 0) {
    pendingTimer = setTimeout(leaveLeaderMode, settings.leaderTimeoutMs);
  }
}

function leaveLeaderMode() {
  if (!pending) {
    return;
  }
  pending = false;
  clearTimeout(pendingTimer);
  pendingTimer = null;
  hideIndicator();
  releaseFocus();
}

function runCommand(name) {
  browser.runtime.sendMessage({ type: "command", name }).catch((err) => {
    console.warn(`[ff-extrakeys] command "${name}" failed: ${err.message}`);
  });
}

window.addEventListener(
  "keydown",
  (event) => {
    if (event.isComposing) {
      return;
    }

    if (pending) {
      if (isModifierKey(event)) {
        return; // let the user hold Shift etc. for the next key
      }
      swallow(event);
      leaveLeaderMode();
      const binding = BINDINGS[commandKeyFromEvent(event)];
      if (binding) {
        runCommand(binding.command);
      }
      return;
    }

    if (!settings.enabled || event.repeat) {
      return;
    }
    if (matchesKey(event, settings.leader)) {
      swallow(event);
      enterLeaderMode();
    }
  },
  true
);

// Leaving the page (alt-tab, clicking the URL bar) cancels a pending leader.
window.addEventListener("blur", leaveLeaderMode);

/* Hidden input that holds focus while waiting for the key after the leader. */

function grabFocus() {
  if (!focusTrap) {
    focusTrap = document.createElement("input");
    focusTrap.type = "text";
    focusTrap.tabIndex = -1;
    focusTrap.setAttribute("aria-hidden", "true");
    focusTrap.setAttribute("autocomplete", "off");
    focusTrap.style.cssText = [
      "position: fixed",
      "top: 0",
      "left: 0",
      "width: 1px",
      "height: 1px",
      "margin: 0",
      "padding: 0",
      "border: 0",
      "opacity: 0",
      "pointer-events: none",
    ].join(";");
    // Anything that steals focus (Escape in Vimium, a click) cancels leader mode.
    focusTrap.addEventListener("blur", leaveLeaderMode);
  }
  (document.body ?? document.documentElement).appendChild(focusTrap);
  focusTrap.focus({ preventScroll: true });
}

function releaseFocus() {
  if (!focusTrap) {
    return;
  }
  const target = previousFocus;
  previousFocus = null;
  focusTrap.remove();
  if (target && target !== document.body && target.isConnected) {
    target.focus({ preventScroll: true });
  }
}

/* Small corner badge while waiting for the key after the leader. */

function showIndicator() {
  if (indicator) {
    return;
  }
  indicator = document.createElement("div");
  indicator.textContent = `${formatKey(settings.leader)} …`;
  indicator.style.cssText = [
    "all: initial",
    "position: fixed",
    "right: 12px",
    "bottom: 12px",
    "z-index: 2147483647",
    "padding: 6px 10px",
    "border-radius: 6px",
    "background: rgba(0, 0, 0, 0.8)",
    "color: #fff",
    "font: 12px/1 system-ui, sans-serif",
    "pointer-events: none",
  ].join(";");
  (document.body ?? document.documentElement).appendChild(indicator);
}

function hideIndicator() {
  indicator?.remove();
  indicator = null;
}
