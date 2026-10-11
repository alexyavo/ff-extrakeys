/**
 * Settings and key helpers shared by the background page, the content script
 * and the options page. Loaded as a classic script before the others, so its
 * top-level declarations are visible to them.
 */

const DEFAULT_SETTINGS = {
  enabled: true,

  // tmux-style prefix key. Matched on the physical key (KeyboardEvent.code)
  // plus modifiers, so it does not depend on the keyboard layout.
  leader: {
    code: "Backslash",
    ctrlKey: true,
    altKey: false,
    shiftKey: false,
    metaKey: false,
  },

  // How long leader mode waits for the next key. 0 = wait indefinitely.
  leaderTimeoutMs: 2000,
};

const MODIFIER_KEYS = new Set([
  "Shift", "Control", "Alt", "Meta", "AltGraph", "CapsLock", "Fn", "FnLock",
  "Hyper", "Super", "OS", "Symbol", "SymbolLock", "NumLock", "ScrollLock",
]);

function isModifierKey(event) {
  return MODIFIER_KEYS.has(event.key);
}

/** Snapshot of a keydown event in the shape stored as `leader`. */
function keyFromEvent(event) {
  return {
    code: event.code,
    ctrlKey: event.ctrlKey,
    altKey: event.altKey,
    shiftKey: event.shiftKey,
    metaKey: event.metaKey,
  };
}

function matchesKey(event, key) {
  return (
    event.code === key.code &&
    event.ctrlKey === key.ctrlKey &&
    event.altKey === key.altKey &&
    event.shiftKey === key.shiftKey &&
    event.metaKey === key.metaKey
  );
}

/**
 * Name of the key pressed *after* the leader. Printable keys use the typed
 * character, so "N" means Shift+n (like tmux, bindings are case-sensitive).
 * Non-printable keys get explicit modifiers, e.g. "Ctrl+ArrowUp".
 */
function commandKeyFromEvent(event) {
  const parts = [];
  if (event.ctrlKey) parts.push("Ctrl");
  if (event.altKey) parts.push("Alt");
  if (event.metaKey) parts.push("Meta");
  if (event.shiftKey && event.key.length !== 1) parts.push("Shift");
  parts.push(event.key);
  return parts.join("+");
}

const CODE_LABELS = {
  Backslash: "\\", Slash: "/", Semicolon: ";", Quote: "'", Backquote: "`",
  BracketLeft: "[", BracketRight: "]", Comma: ",", Period: ".", Minus: "-",
  Equal: "=", Space: "Space", IntlBackslash: "\\",
};

function labelForCode(code) {
  if (code in CODE_LABELS) return CODE_LABELS[code];
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit[0-9]$/.test(code)) return code.slice(5);
  return code;
}

/** Human-readable form of a stored key, e.g. "Ctrl+\". */
function formatKey(key) {
  const isMac = navigator.platform.startsWith("Mac");
  const parts = [];
  if (key.ctrlKey) parts.push("Ctrl");
  if (key.altKey) parts.push(isMac ? "Option" : "Alt");
  if (key.shiftKey) parts.push("Shift");
  if (key.metaKey) parts.push(isMac ? "Cmd" : "Meta");
  parts.push(labelForCode(key.code));
  return parts.join("+");
}

async function loadSettings() {
  return browser.storage.local.get(DEFAULT_SETTINGS);
}
