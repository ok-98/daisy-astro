# daisy-astro

Astro components wrapping daisyUI. WIP.

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
