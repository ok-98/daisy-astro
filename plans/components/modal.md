# Modal Component Plan

**daisyUI category:** Actions
**daisyUI doc page:** https://daisyui.com/components/modal/
**Root element:** `dialog` by default, polymorphic to `div` — see §3a
**Target files:** `packages/daisy-astro/src/components/Modal/Modal.astro`, `ModalBox.astro`, `ModalAction.astro` (only `Modal.astro` exists, as a dummy scaffold)
**Story files:** `Modal.stories.ts` (+ short files per sub-component)

**Global Constraints** (from `plans/README.md`, apply as-is): props forward every native attribute for the rendered element; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/modal.css` and the doc page source. §3f lists what is **unverified**.

---

## 0. Four methods, ranked by daisyUI itself

The doc page opens with a comparison table **[verified]**:

| # | Method | Opens/closes by | `Esc` closes | Locks background |
|---|---|---|---|---|
| 1 | **`<dialog>`** — *recommended* | JavaScript (`id.showModal()`) | ✅ | ✅ |
| 2 | Popover | HTML attributes | ✅ | ❌ |
| 3 | Checkbox — *legacy* | hidden checkbox | ❌ | ❌ |
| 4 | Anchor link — *legacy* | URL fragment | ❌ | ❌ |

All four share the same `.modal` / `.modal-box` markup and are selected by one rule **[verified]**:

```css
.modal.modal-open, .modal[open], .modal:popover-open, .modal:target, .modal-toggle:checked + .modal {
  visibility:visible; opacity:1; pointer-events:auto; background-color:oklch(0% 0 0/.4);
  & > .modal-box { opacity:1; translate:0; scale:1 }
  :root:has(&) { --page-scroll-lock: } }
```

Five selectors, one for each method plus `modal-open` for JS-driven state. So **one component covers all four**, and the only thing that varies is the root element and how the caller opens it (§3a).

## 1. Variant audit

**11 classes: 1 component + 4 part + 1 modifier + 5 placement**, matching the doc page's frontmatter. `grep -oE '\.modal[a-z0-9-]*' modal.css | sort -u` returns exactly those 11 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `modal` | — | — | `Modal` | Always applied. |
| Part | `modal-box` | — | — | `ModalBox` | The content panel. |
| Part | `modal-action` | — | — | `ModalAction` | The button row. |
| Part | `modal-backdrop` | — | — | — | Caller markup — §3c. |
| Part | `modal-toggle` | — | — | — | Caller markup, method 3 only — §3a. |
| Modifier | `modal-open` | `open` | `boolean` | `Modal` | Forces visible; the JS-driven escape hatch — §3b. |
| Placement | `modal-top` `modal-middle` `modal-bottom` | `position` | `'top' \| 'middle' \| 'bottom'` | `Modal` | Vertical. `middle` is the default. |
| Placement | `modal-start` `modal-end` | `align` | `'start' \| 'end'` | `Modal` | Horizontal, independent of `position` — §3d. |

**No colour or size axis** — none exists **[verified]**. Width is `w-*`/`max-w-*` on the box (§3e).

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Modal` | `default` | none — direct children of `.modal` | no | a `ModalBox`, optionally followed by a backdrop `<form>`/`<div>`/`<label>` |
| `ModalBox` | `default` | none | no | heading, copy, a `ModalAction` |
| `ModalAction` | `default` | none | no | a `<form method="dialog">` with a button, or a popover-hiding button |

Plain default slots, no gating.

**The backdrop is caller markup, not a component or a prop.** Its element differs per method **[all verified]**: `<form method="dialog" class="modal-backdrop"><button>close</button></form>` for `<dialog>`, `<div class="modal-backdrop"><button popovertarget=… popovertargetaction="hide">` for popover, and `<label class="modal-backdrop" for=…>` for the checkbox. A single component cannot render all three, and a `closeOnOutsideClick` boolean would have to pick one. Same treatment as `dropdown-content` (`plans/components/dropdown.md` §2) and `filter-reset`.

## 3. Six things the naive implementation gets wrong

### 3a. The root element is the method

| Method | Root | How it opens |
|---|---|---|
| dialog | `<dialog id="x" class="modal">` | `x.showModal()` / `x.close()` |
| popover | `<div id="x" class="modal" popover>` | `<button popovertarget="x">` |
| checkbox | `<div class="modal" role="dialog">` preceded by `<input class="modal-toggle" id="x">` | a `<label for="x">` |
| anchor | `<div id="x" class="modal" role="dialog">` | `<a href="#x">` |

**[all verified]**. So `Modal` is `Polymorphic<{ as: Tag }>` defaulting to `'dialog'` — daisyUI's recommendation, and the only method that both closes on `Esc` and traps background interaction.

Two things the component must add for the non-dialog roots, since a `<div class="modal">` has no implicit semantics: **`role="dialog"`** appears on every `div`-rooted example **[verified]**, and it is defaulted (destructured, overridable — the mechanism from `plans/components/alert.md` §3b) rather than hardcoded. The `<dialog>` root needs none.

`popover` is likewise a caller attribute passed through `...rest`, not a prop: adding it is what selects method 2, and it pairs with the caller's own `popovertarget` button.

Being polymorphic brings `plans/README.md` §5c's silent generic-inference failure — the probe in §4 is mandatory.

### 3b. `open` is not "the modal is open"

`modal-open` forces the modal visible **from CSS**, for frameworks that drive state themselves. It is *not* how a `<dialog>` opens — that is `showModal()`, which sets the native `[open]` attribute and puts the dialog in the top layer.

The difference matters: a `<dialog class="modal modal-open">` that was never `showModal()`ed is **visible but not modal** — no top layer, no focus trap, no inert background. daisyUI's own table is explicit that method 1's background-locking comes from the dialog element, not from the class.

So the JSDoc says: **use `open` only with a `div` root, or for a `<dialog>` whose state your framework already manages**. For a real dialog, call `showModal()`. This library adds no script to do it (`plans/README.md` §6), and the trigger button is caller markup in every example **[verified]**.

### 3c. Closing is the caller's markup, and `<form method="dialog">` is the trick

Every `<dialog>` example closes via `<form method="dialog"><button>` **[verified]** — submitting a dialog-method form closes the dialog with no JavaScript. daisyUI relies on it for the close button, the corner ✕, and the click-outside backdrop.

That is worth a JSDoc line, because it looks like a mistake: a `<form>` wrapping a single button, with no action and no handler.

The popover method's equivalent is `popovertargetaction="hide"` **[verified]**, and the checkbox method's is another `<label for>`.

`.modal-backdrop` itself is `z-index: -1` with `place-self: stretch stretch` **[verified]** — it fills the grid cell *behind* the box, which is why it must be a **sibling of `.modal-box`**, not a wrapper.

### 3d. Placement is two independent axes

`modal-top` / `modal-middle` / `modal-bottom` set `place-items` and reshape the box (full width, one pair of corners squared, `translate` from that edge) **[verified]**; `modal-start` / `modal-end` are the horizontal pair.

They compose, so two props — `position` and `align` — not one five-value union. Same reasoning as `plans/components/dropdown.md` §3c and `plans/components/indicator.md` §3b, and by now the third component where the docs' single "placement" grouping hides two axes.

The doc page's responsive example is `modal-bottom sm:modal-middle` **[verified]** — a caller class, the library's standing answer.

### 3e. The box owns the width, and it is not full-width by default

`.modal-box` is `width: 91.6667%; max-width: 32rem; max-height: 100vh; padding: 1.5rem; overflow-y: auto` **[verified]**. The "custom width" example overrides with `w-11/12 max-w-5xl` on the **box**, not the modal **[verified]**.

So there is no `size` prop and no width prop: `ModalBox` takes `class`. One JSDoc line, since a caller will reach for the wrapper first.

Note `.modal` itself is `z-index: 999` **[verified]** — higher than Dropdown's content and far above Dock's `1`, which is the right ordering.

The `--page-scroll-lock` / `scrollbar-gutter` behaviour is identical to Drawer's, including the Firefox caveat and the `rootscrollgutter` opt-out **[verified — the doc page carries the same info box]**. Cross-referenced from `plans/components/drawer.md` §3g; it belongs in the package README once, not twice.

### 3f. Unverified assumptions

1. **Do slot children land as direct children of `.modal`?** Blocking. `.modal > .modal-box` is a **child** selector in the open rule **[verified]**, so a wrapper would leave the box permanently at `opacity: 0; scale: .95`. Twentieth plan touching the shared question in `plans/components/aura.md` §3e.1 — and one of the loudest, since the modal would open to an empty dimmed screen.
2. **`<dialog>` inside the Storybook canvas.** `showModal()` puts the dialog in the top layer of its *document*, which is the story iframe. Expected to work, worth confirming before writing eleven stories that depend on it.
3. **`@starting-style` and `transition-behavior: allow-discrete`** **[verified]** — recent CSS; without them the modal appears without its fade. Cosmetic.
4. **Cross-component composition** — every example uses `btn`. Raw markup until `plans/components/button.md` is implemented.

## 4. Component implementation

### `Modal.astro`

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

// `Props` MUST precede every `const` (plans/README.md §5c).
type ModalPosition = 'top' | 'middle' | 'bottom';
type ModalAlign = 'start' | 'end';

/**
 * Defaults to a native `<dialog>`, which daisyUI recommends: it is the only
 * method that closes on `Esc` **and** locks the background (plan §0).
 *
 * Open it with `id.showModal()` and close it with `id.close()` — or, with no
 * JavaScript at all, put a `<form method="dialog">` around your close button
 * (plan §3c). This library ships no script.
 *
 * Other methods use `as="div"`: add `popover` for the Popover method, or pair
 * with a `<input class="modal-toggle">` for the legacy checkbox one (plan §3a).
 *
 * The click-outside backdrop is your markup — a sibling of the `ModalBox`,
 * with the element depending on the method (plan §2, §3c).
 */
type Props<Tag extends HTMLTag> = Polymorphic<{
  as: Tag;
  /**
   * Forces the modal visible from CSS. **Not the same as being open**: a
   * `<dialog>` shown this way is visible but not modal — no top layer, no
   * focus trap (plan §3b).
   */
  open?: boolean;
  /** Vertical placement; composes with `align` (plan §3d). */
  position?: ModalPosition;
  /** Horizontal placement. */
  align?: ModalAlign;
}>;

// Full literal class names. NEVER `modal-${position}` (plans/README.md §1b).
const POSITION: Record<ModalPosition, string> = {
  top: 'modal-top', middle: 'modal-middle', bottom: 'modal-bottom',
};
const ALIGN: Record<ModalAlign, string> = { start: 'modal-start', end: 'modal-end' };

// `role="dialog"` appears on every non-dialog example; defaulted so it stays
// overridable, and unnecessary on a real <dialog> (plan §3a).
const {
  as: Tag = 'dialog',
  open = false,
  position,
  align,
  role = Tag === 'dialog' ? undefined : 'dialog',
  class: className,
  ...rest
} = Astro.props as Props<HTMLTag>;
---

<Tag
  class:list={[
    'modal',
    { 'modal-open': open },
    position && POSITION[position],
    align && ALIGN[align],
    className,
  ]}
  role={role}
  {...rest}
>
  <slot />
</Tag>
```

### `ModalBox.astro` / `ModalAction.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * The content panel. `width: 91.67%; max-width: 32rem` by default — override
 * with `class="w-11/12 max-w-5xl"` **here**, not on the `Modal` (plan §3e).
 */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['modal-box', className]} {...rest}>
  <slot />
</div>
```

…and the same with `modal-action` (a right-aligned flex row with a `1.5rem` top margin **[verified]**).

No `<script>` anywhere (§3b).

### Astro idioms gate

- [ ] Content arrives via plain default slots — no `title`/`actions` props (§2).
- [ ] `<slot />` has no wrapper in `Modal` — `.modal > .modal-box` is a child selector (§3f.1).
- [ ] No `Astro.slots.has()` gating; the backdrop is caller markup (§2).
- [ ] Default root is `dialog`, with `as` via `Polymorphic` (§3a).
- [ ] `role="dialog"` defaulted **only** for non-`dialog` roots, and overridable (§3a).
- [ ] No `<script>` added, and no `showModal()` helper (§3b).
- [ ] `...rest` spread onto the root — carries `id`, `popover`, `onclose`.
- [ ] `position` and `align` are separate props (§3d).
- [ ] Every variant class is a literal in a `Record` map or object key.
- [ ] **`type Props` precedes every `const`**, with `as Props<HTMLTag>` (§3a).
- [ ] Probe (§5c) — mandatory, the generic failure is silent:
  ```astro
  <Modal id="m1"><ModalBox>Hi</ModalBox></Modal>
  <Modal as="div" id="m2" popover><ModalBox>Hi</ModalBox></Modal>
  <Modal position="bottom" align="end" open class="sm:modal-middle">ok</Modal>
  <Modal size="lg">must error — width is a ModalBox class (§3e)</Modal>
  <Modal position="left">must error — that's the align axis (§3d)</Modal>
  <Modal color="primary">must error — no colour axis (§1)</Modal>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Three files. Doc-page examples in page order (`plans/README.md` §8), all in `Modal.stories.ts`: `Dialog`, `DialogCloseOutside`, `DialogCornerClose`, `DialogCustomWidth`, `DialogResponsive`, `Popover`, `PopoverCloseOutside`, `Checkbox`, `CheckboxCloseOutside`, `AnchorLink`.

Plus `Playground` and `Passthrough`; `ModalBox` and `ModalAction` get a `Playground` + `Passthrough` each.

Every story pairs the modal with its **own trigger button**, exactly as the doc page does, and needs a **globally unique `id`** — the same hazard as `plans/components/drawer.md` §5 and `plans/components/megamenu.md` §3f.3. A comment says so.

Three beyond the doc page:

- **`Placements`** — the six `position` × `align` combinations, since the doc page shows only the responsive pair.
- **`OpenIsNotModal`** — a `<dialog>` with `open` beside one opened via `showModal()`, showing §3b's difference: the first leaves the background focusable.
- **`WrappedBox`** — a `ModalBox` inside a wrapper, staying invisible when opened (§3f.1). Raw markup.

## 6. Steps

- [ ] **Step 1:** Resolve §3f.1 (box is a direct child) — blocking, and it makes the modal open to an empty dimmed screen. Confirm §3f.2 (`showModal()` in the canvas) before writing the stories.
- [ ] **Step 2:** No new shared unions; `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the `Modal.astro` scaffold and create `ModalBox.astro` and `ModalAction.astro` per §4, then walk the gate. **Run the probe**.
- [ ] **Step 4:** Replace `Modal.stories.ts` and add the two sub-component story files per §5, with unique ids.
- [ ] **Step 5:** `pnpm storybook`, verify: `Dialog` opens on click, dims the background, closes on `Esc` **and** on the form button (§3c); `DialogCloseOutside` closes on a backdrop click; `DialogCustomWidth` is wider — with the class on the **box** (§3e); `Placements` puts the box where each combination says (§3d); `Popover` opens but leaves the background focusable (§0); `Checkbox` and `AnchorLink` open without JS and do **not** close on `Esc`; `OpenIsNotModal` shows the §3b difference.
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<dialog[^>]*class="modal[^"]*"[^>]*><div class="modal-box' storybook-static/astro-prerendered-stories.json | head
  grep -rhoE '<div[^>]*class="modal[^"]*"[^>]*role="dialog"' storybook-static/astro-prerendered-stories.json | head
  ```
  The first proves the box is a direct child (§3f.1); the second that `role` is added only for `div` roots (§3a).
- [ ] **Step 7:** Update the `Modal` row in `plans/README.md` to **Implemented**, noting `ModalBox`/`ModalAction` as part of it. Confirm the `scrollbar-gutter` note is already in the package README from `plans/components/drawer.md` §3g rather than adding a second copy (§3e).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 11 daisyUI classes reachable; `modal-backdrop` and `modal-toggle` documented as caller markup (§2).
- [ ] Default root is `dialog`; `as="div"` works and gets `role="dialog"`; probe passes (§3a).
- [ ] `position` and `align` are independent and all six combinations render (§3d).
- [ ] `ModalBox` is a direct child of `.modal` — checked in the build output (§3f.1).
- [ ] JSDoc states: `open` is not "modal" (§3b), `<form method="dialog">` closes without JS (§3c), width goes on the box (§3e), and the backdrop is a sibling (§3c).
- [ ] No invented axis — no colour, no size, no `closeOnOutsideClick`, no `showModal` helper (§2, §3b).
- [ ] Stories use globally unique ids and their own trigger buttons (§5).
- [ ] One story per doc-page example, plus `Placements`, `OpenIsNotModal` and `WrappedBox`.
- [ ] Every box in §4's gate ticked.
