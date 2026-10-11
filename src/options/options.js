const els = {
  enabled: document.getElementById("enabled"),
  leader: document.getElementById("leader"),
  leaderReset: document.getElementById("leader-reset"),
  timeout: document.getElementById("timeout"),
  bindings: document.getElementById("bindings"),
};

let leader = DEFAULT_SETTINGS.leader;

function renderBindings() {
  els.bindings.replaceChildren();
  for (const [key, { description }] of Object.entries(BINDINGS)) {
    const row = els.bindings.insertRow();
    const keys = row.insertCell();
    keys.append(kbd(formatKey(leader)), " ", kbd(key));
    row.insertCell().textContent = description;
  }
}

function kbd(text) {
  const el = document.createElement("kbd");
  el.textContent = text;
  return el;
}

function showLeader() {
  els.leader.value = formatKey(leader);
  renderBindings();
}

async function setLeader(next) {
  leader = next;
  await browser.storage.local.set({ leader });
  showLeader();
}

async function init() {
  const settings = await loadSettings();
  leader = settings.leader;
  els.enabled.checked = settings.enabled;
  els.timeout.value = settings.leaderTimeoutMs;
  showLeader();
}

els.enabled.addEventListener("change", () => {
  browser.storage.local.set({ enabled: els.enabled.checked });
});

els.timeout.addEventListener("change", () => {
  const value = Math.max(0, Math.round(Number(els.timeout.value)) || 0);
  els.timeout.value = value;
  browser.storage.local.set({ leaderTimeoutMs: value });
});

// Record a new leader: click the field, press the combination.
els.leader.addEventListener("focus", () => {
  els.leader.value = "";
});

els.leader.addEventListener("blur", showLeader);

els.leader.addEventListener("keydown", (event) => {
  const plainTab =
    event.key === "Tab" && !event.ctrlKey && !event.altKey && !event.metaKey;
  if (plainTab) {
    return; // keep keyboard navigation working
  }
  event.preventDefault();
  if (isModifierKey(event)) {
    return;
  }
  setLeader(keyFromEvent(event)).then(() => els.leader.blur());
});

els.leaderReset.addEventListener("click", () => {
  setLeader(DEFAULT_SETTINGS.leader);
});

document.addEventListener("DOMContentLoaded", init);
