# daisy-astro

Astro components wrapping daisyUI. WIP.

## Install

```bash
pnpm add daisy-astro daisyui tailwindcss
```

`astro`, `daisyui` and `tailwindcss` are peer dependencies — this package ships
`.astro` source and no CSS of its own, so your app's Tailwind build is what
turns the class names into styles.

```astro
---
import { Button, Card, CardBody } from 'daisy-astro';
---

<Card class="bg-base-100 w-96 shadow-sm">
  <CardBody>
    <Button color="primary">Buy now</Button>
  </CardBody>
</Card>
```

Everything is exported by its own name from the package root, sub-components
included (`CardBody`, `NavbarStart`, `MegamenuItem`, …). The shared variant
unions `DaisyColor` and `DaisySize` are exported as types, for wrapping these
components in your own.

Then do the four things below — the first one is not optional.

## Setup

Things your app needs that the components cannot add for themselves. They all
fail quietly — the library renders, it just looks wrong.

### 1. Point Tailwind at this package

Tailwind 4 auto-detects sources but ignores `node_modules`, so an app that
installs this library gets **no daisyUI CSS for it** by default: your own
`p-4` is picked up, the library's `btn-primary` is not. Add this to your app's
CSS:

```css
@source "../node_modules/daisy-astro/src";
```

Without it the library appears completely unstyled. See `plans/README.md` §1c.

**That line makes Tailwind scan the whole library, so you get all of daisyUI's
component CSS whether you use it or not.** Measured on a page using eight
components (2026-09-02):

| `@source` | CSS |
|---|---|
| the whole package — the line above | 287 KB |
| only the component directories actually imported | 48 KB |

If that matters, name them:

```css
@source "../../node_modules/daisy-astro/src/components/{Button,Card,Navbar,ThemeController}";
```

The cost of the narrow form is that it is a list to keep current — a component
you import but forget to add here renders **unstyled**, with no error. Start with
the whole package and narrow it if the CSS budget calls for it.

### 2. Add `viewport-fit=cover` for the Dock

```html
<meta name="viewport" content="viewport-fit=cover" />
```

`Dock` sizes and pads itself with `env(safe-area-inset-bottom)`, which resolves
to `0` unless the document opts in. Without this the dock sits under the
iPhone home indicator. Required only if you use `Dock`; harmless otherwise.
See `plans/components/dock.md` §3e.

### 3. Know that opening a `Drawer` touches `:root`

Not a line to add — a behaviour to expect. daisyUI locks page scroll through
`:root:has(.drawer-toggle:checked)` and adds a scrollbar gutter so the page
does not shift when the scrollbar disappears. **On Firefox** you have to detect
a vertical scrollbar and set `scrollbar-gutter: stable` (or `unset`) on `:root`
yourself. To switch the whole feature off, exclude it where you load the
plugin:

```css
@plugin "daisyui" { exclude: rootscrollgutter; }
```

A component cannot style `:root`, so this is the app's to own. If opening a
drawer shifts your layout, this paragraph is the answer.
See `plans/components/drawer.md` §3g.

### 4. Install `cally` only if you use `Calendar`

daisyUI's Calendar is **theme CSS for other people's calendar libraries** — it
ships no calendar of its own. `Calendar` here wraps
[Cally](https://github.com/WickyNilliams/cally), which is an **optional peer
dependency**: this package never imports it, so you install and register it
yourself.

```bash
pnpm add cally
```

```js
// once, in your layout
import 'cally';
```

**Forget it and nothing errors** — an unregistered custom element renders as an
empty gap. That is the whole reason this note exists.

**You may not need it.** daisyUI's own page leads with the native option, and so
does this library:

```astro
<TextInput type="date" />
```

No dependency, no custom element, no registration. See
`plans/components/calendar.md` §0a.
