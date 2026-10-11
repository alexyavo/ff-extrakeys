# Publishing to addons.mozilla.org (AMO)

Publishing makes the extension an official, Mozilla-signed add-on: no
"could not be verified" banner, one-click install from the store, and
automatic updates in Firefox and Waterfox.

## One-time setup

1. Sign in at <https://addons.mozilla.org/developers/> with a Firefox account.
2. Enable two-factor authentication on the Firefox account (required for
   extension developers).
3. Optional, for uploading later versions from the terminal: create API
   credentials at <https://addons.mozilla.org/developers/addon/api/key/> and
   export them as `WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET`.

## Pre-flight

```sh
npm run lint     # must report 0 errors
npm run build    # -> web-ext-artifacts/ff-extrakeys-<version>.xpi
```

Every upload needs a `version` in `src/manifest.json` higher than any version
AMO has seen for this add-on ID.

## First submission (web UI)

Developer Hub -> **Submit a New Add-on** -> **On this site** (listed).

1. **Upload** the `.xpi` from `web-ext-artifacts/`. Wait for validation to
   pass.
2. **Source code**: answer **No**. There is no build step; the package is the
   source. (If a bundler or minifier is ever added, this becomes **Yes** and a
   source zip with build instructions must be attached.)
3. **Listing details**: paste from [Listing content](#listing-content) below.
4. **Notes to reviewer**: paste from [Reviewer notes](#reviewer-notes).
5. **Submit**. Automated review is immediate. Requesting access to all sites
   (`<all_urls>`) usually triggers a manual review, which takes from a day to
   a few weeks; you get an email either way.

After approval, install the add-on from its AMO page. It replaces the locally
installed unsigned copy (same ID), the warning disappears, and future versions
update automatically.

## Later versions

Bump `version`, build, then either upload through the Developer Hub
(**Upload New Version**) or from the terminal:

```sh
npm run sign     # uploads to the listed channel and waits for signing
```

## Listing content

**Name**: ff-extrakeys

**Summary** (shown in search results, max 250 characters):

> tmux-style leader key for the browser. Press Ctrl+\ then a key to run
> tab and window commands: N detaches the current tab into its own window.
> The leader key is configurable.

**Description**:

> ff-extrakeys adds a configurable leader key, like the prefix key in tmux.
> Press the leader (default Ctrl+\), then a key:
>
> - N: detach the current tab into a new window
>
> A small badge in the page corner shows while the extension waits for the
> second key. Bindings are case-sensitive like tmux, so N means Shift+n.
>
> The leader key and its timeout are configurable in the extension's
> preferences. It coexists with Vimium: while waiting for the second key,
> focus is held in a hidden field that Vimium treats as insert mode.
>
> Limitations: shortcuts work inside web pages only. They do nothing on
> privileged pages (about:*, addons.mozilla.org, the PDF viewer) or while
> focus is in the address bar.
>
> Privacy: the extension collects no data and makes no network requests.
> Source code: https://github.com/alexyavo/ff-extrakeys

**Categories**: Tabs

**Tags**: keyboard, shortcuts, tabs, tmux, vim

**Homepage** and **Support site**: https://github.com/alexyavo/ff-extrakeys
(support: the repo's Issues page)

**License**: MIT

**Privacy policy**: none needed. On the data-collection questions answer that
the add-on collects no data. The manifest already declares this
(`data_collection_permissions.required: ["none"]`).

**Icon**: AMO takes the 128 px icon from the manifest. Screenshots are
optional; a capture of the preferences page and of the corner badge is enough.

## Reviewer notes

> No build step: the uploaded package is the complete source, also published
> at https://github.com/alexyavo/ff-extrakeys.
>
> The content script runs on all URLs because the extension implements
> keyboard shortcuts with a capture-phase keydown listener; it has to be
> present in every page to see the keys. It injects nothing except a small
> badge and a hidden, temporary input element while waiting for the second
> key of a sequence. There are no network requests, no remote code and no
> data collection.
>
> To test: install, open any https page, press Ctrl+\ (a badge appears
> bottom-right), then Shift+N. The tab moves into a new window. The leader
> key can be changed in the preferences page.
