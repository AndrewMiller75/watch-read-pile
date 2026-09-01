# Watch & Read Pile

Andrew's personal film / book / TV / game / comics tracker. A single
self-contained page plus a service worker, installable as a progressive web
app and usable offline.

## Why this repo exists

Until September 2026 the app was installed on the phone from a temporary
origin that no longer serves anything, so the catalogue on the phone could
never be updated. GitHub Pages gives it a permanent HTTPS home, which is what
a service worker needs, and makes "update the catalogue" mean "push".

## Layout

| File | What it is |
| --- | --- |
| `index.html` | The whole app — markup, CSS, script and all 279 catalogue items in one file. |
| `sw.js` | Service worker. Network-first for the page, cache-first for icons. |
| `manifest.webmanifest` | PWA manifest — name, icons, standalone display. |
| `icons/` | 192, 512 and maskable-512 app icons. |
| `deploy.sh` | Stamps a new build into `sw.js`, commits and pushes. |

## Deploying an update

    ./deploy.sh "what changed"

That rewrites the `BUILD` constant in `sw.js` with a fresh timestamp, commits
everything, and pushes to `main`. GitHub Pages republishes within a minute or
so. The installed app picks the new catalogue up on next launch with a
network connection, because the worker asks the network for `index.html`
before falling back to its cache.

## Things that will bite

- **Item ids must stay stable.** Seen-state and removals are stored in
  `localStorage` under the single key `wrpile.v2`, as maps keyed by each
  item's `data-id`. Change an id and its tick is orphaned; change the id of
  something previously removed and it comes back.
- **State is per-origin and per-device.** Ticks on the phone are not ticks on
  the desktop, and never have been. The **Backup** button exports the state
  JSON and restores a pasted one — use it before any move to a new origin.
- **The counts in the markup are decorative.** `recount()` recomputes the
  per-medium and per-genre numbers from the DOM at boot, so the hard-coded
  ones drift and do not matter.

## Not done yet

The catalogue is still hand-authored markup: adding an item means composing an
`<article>`, duplicating the blurb into `data-search` in lower case, and
dropping it into the right genre block. Separating the catalogue into data with
a build step is the next pass.
