/**
 * Keys accepted after the leader, mapped to commands implemented in
 * background.js. Keys are named as produced by commandKeyFromEvent():
 * printable keys by character ("N" is Shift+n), others like "Ctrl+ArrowUp".
 */
const BINDINGS = {
  N: {
    command: "detach-tab",
    description: "Detach the current tab into a new window",
  },
};
