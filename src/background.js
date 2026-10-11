/**
 * Background event page (Manifest V3, Firefox / Waterfox).
 *
 * Not persistent: started on demand for events and torn down when idle.
 * Keep state in browser.storage, never in globals.
 *
 * Commands are requested by the content script (which owns key handling) and
 * run here because they need tabs/windows APIs.
 */

const COMMANDS = {
  /** Move the sender's tab into a window of its own. */
  async "detach-tab"(sender) {
    const tab = sender.tab;
    if (!tab?.id) {
      return;
    }
    const siblings = await browser.tabs.query({ windowId: tab.windowId });
    if (siblings.length < 2) {
      return; // already alone in its window
    }
    await browser.windows.create({ tabId: tab.id, incognito: tab.incognito });
  },
};

browser.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== "command") {
    return;
  }
  const run = COMMANDS[message.name];
  if (!run) {
    console.warn(`[ff-extrakeys] unknown command "${message.name}"`);
    return;
  }
  return run(sender).catch((err) => {
    console.error(`[ff-extrakeys] command "${message.name}" failed:`, err);
  });
});
