# ff-extrakeys

tmux-style leader-key shortcuts for Firefox and Waterfox. Manifest V3 WebExtension.

Press the **leader** (default `Ctrl+\`), then a key:

| Keys           | Action                                      |
| -------------- | ------------------------------------------- |
| `<leader>` `N` | Detach the current tab into a new window    |

The leader is configurable in the extension's preferences
(`about:addons` -> ff-extrakeys -> Preferences): click the field and press the
new combination. A small badge appears in the page corner while the extension
waits for the key after the leader. Bindings are case-sensitive like tmux:
`N` is Shift+n.

Limitations inherent to WebExtensions: shortcuts work inside web pages only.
They do nothing on privileged pages (`about:*`, addons.mozilla.org, the PDF
viewer) or while focus is in the address bar or another part of the browser UI.

### Vimium and other key handlers

Vimium (and many sites) capture keys before page scripts and stop propagation
for keys they bind. To stay compatible, leader mode moves focus into a hidden
text field owned by this extension while it waits for the second key; Vimium
treats that as insert mode and lets the key through. Focus is restored right
after. The leader itself must be a key Vimium does not bind: the default
`Ctrl+\` is fine.

## Layout

```
src/                     the extension itself (this is what gets packaged)
  manifest.json
  common/settings.js     defaults, key matching/formatting helpers (shared)
  common/bindings.js     key -> command table; add new shortcuts here
  content.js             runs in pages: leader detection, key capture, badge
  background.js          runs commands that need tabs/windows APIs
  options/               preferences UI
  icons/                 PNG icons generated from assets/icon.svg
assets/icon.svg          icon source (rsvg-convert -w 96 -h 96 assets/icon.svg -o ...)
docs/PUBLISHING.md       how to publish on addons.mozilla.org
web-ext-config.mjs       web-ext settings (points `run` at the local Waterfox)
```

To add a shortcut: add an entry to `BINDINGS` in `src/common/bindings.js` and a
matching handler to `COMMANDS` in `src/background.js`.

## Development

```sh
npm install
npm start        # launch Waterfox with the extension loaded; reloads on file changes
npm run lint     # validate manifest and sources
npm run build    # produce web-ext-artifacts/ff-extrakeys-<version>.xpi
npm run sign     # upload a new version to the AMO listing (see docs/PUBLISHING.md)
```

`npm start` uses `/Applications/Waterfox.app` (see `web-ext-config.mjs`).
To target a different browser:

```sh
npx web-ext run --firefox /path/to/binary
```

### Loading manually (no web-ext)

Open `about:debugging#/runtime/this-firefox` in Waterfox, click
**Load Temporary Add-on...**, and pick `src/manifest.json`. The add-on is
removed when the browser exits.

### Installing permanently in Waterfox

Waterfox does not require add-ons to be signed, so a local build can be
installed for good: run `npm run build`, then in `about:addons` choose the gear
icon -> **Install Add-on From File...** and pick the `.xpi` from
`web-ext-artifacts/`.

### Signing and publishing

Unsigned add-ons show a "could not be verified" warning in `about:addons`.
Only a Mozilla-signed build removes it. The intended route is the official
listing on addons.mozilla.org, documented step by step in
[docs/PUBLISHING.md](docs/PUBLISHING.md).

For a private, unlisted build instead (signed but not on the store), set
`WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET` from
<https://addons.mozilla.org/developers/addon/api/key/> and run
`npm run sign:unlisted`.

### Debugging

`about:debugging#/runtime/this-firefox` -> **Inspect** next to ff-extrakeys opens
the background page console. Content script logs appear in the regular page
devtools console.
