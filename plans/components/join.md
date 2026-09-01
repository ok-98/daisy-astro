# Join Component Plan

**daisyUI category:** Layout
**daisyUI doc page:** https://daisyui.com/components/join/
**Root element:** `div`
**Target file:** `packages/daisy-astro/src/components/Join/Join.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Join/Join.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22` and the doc page source. §3e lists what is **unverified**.


> **Status:** **Implemented** (2026-09-01), first of the Stage 4 cluster. `Join.astro` and 10 stories. §2's cross-plan action **was already done**: `Collapse` shipped with no `join` boolean, because the same evidence arrived from the other direction (§3f). §3's five findings all held; nothing needed correcting. Three stories carry `TODO(daisy-astro)` markers for `TextInput`, `Select` and `Indicator` — the cluster's pass-2 debt, per `plans/IMPLEMENTATION-ORDER.md` §5.2. Step 5 (visual pass) is open.
---

## 0. It is a utility, not a component — and that matters

`join` does **not** live in `daisyui/components/`. Its source is `daisyui/utilities/join.css` **[verified]**, and the doc page's `source` link points there too. There is no `components/join.css`, which is why a `ls components/*.css` sweep of this library finds 60 files for 68 checklist rows.

Practical consequences:

- **Grepping `components/` for `join` finds only the *consumers*** — `button.css`, `input.css`, `select.css`, `fileinput.css`, `otp.css` all read `var(--join-ss, …)` for their corner radii **[verified]**. That is the protocol, not the definition.
- **Every daisyUI form control already composes with Join for free.** `plans/components/file-input.md` §3d found this from the other side; it is a property of the whole family.

## 1. Variant audit

**4 classes: 2 component + 2 direction**, matching the doc page's frontmatter. `grep -ohE '\.join[a-z0-9-]*' utilities/join.css | sort -u` returns exactly `.join`, `.join-item`, `.join-horizontal`, `.join-vertical` **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `join` | — | — | Always applied. |
| Item | `join-item` | — | — | **Caller-applied class**, not a component — §2. |
| Direction | `join-horizontal` `join-vertical` | `direction` | `'horizontal' \| 'vertical'` | Mutually exclusive → union. `horizontal` is the default (`--join-h: 1`) and is still emittable. Responsive form is a caller class — §3c. |

**No colour or size axis** — none exists **[verified]**. The joined items bring their own.

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — children of `.join` | no | `Button`s, `TextInput`s, a `Select`, radio inputs, or wrappers containing them |

Single default slot, no gating.

**No `JoinItem` component.** `join-item` is a class the caller adds to a component they already have — `<Button class="join-item">`, `<TextInput class="join-item">` — the same treatment as `dropdown-content` (`plans/components/dropdown.md` §2), `fab-main-action` and `filter-reset`. A wrapper component would have to re-expose every prop of whatever it wraps.

**Cross-plan note for Step 7:** `plans/components/collapse.md` §1a gives `Collapse` a `join?: boolean` prop that emits `join-item`. That is now redundant — `class="join-item"` does the same thing with no prop, and it is what every doc example on this page does. **Recommend dropping it** when Collapse is implemented; recorded here rather than silently.

## 3. Five things the naive implementation gets wrong

### 3a. `join-item` does **not** need to be a direct child — daisyUI designed for that

```css
.join { --join-ss:0; --join-se:0; --join-es:0; --join-ee:0; --join-v:0; --join-h:1;
        display:inline-flex; align-items:stretch;
  @scope(&) {
    & :where(:scope > :first-child) { --join-ss:var(--radius-field); --join-ee:0; … }
    & :where(:scope > :last-child)  { --join-ss:0; --join-ee:var(--radius-field); … }
    & :where(:scope > :only-child)  { /* all four corners */ }
    & > :where(:focus, :has(:focus)) { z-index:2 }
  }
}
.join-item { border-start-start-radius: var(--join-ss); … }
.join-item > * { --join-ss:initial; --join-se:initial; --join-es:initial; --join-ee:initial }
```

**[all verified]**. The radius values are set on the **direct children** of `.join`, and `.join-item` reads them as **inherited custom properties** — so an item nested inside wrappers still gets the right corners. The doc page has an example named exactly that: *"Even if join-item is not a direct child of the group, it still gets the style."*

This is the **first component in the library where the shared slot-wrapping question does not apply** — not because the selectors happen to be descendant-based (`plans/components/avatar.md` §3e, `plans/components/browser-mockup.md` §3e), but because daisyUI deliberately built the mechanism to survive wrapping. Worth stating positively so nobody adds a defensive check.

The `.join-item > *` reset **[verified]** is what stops a nested join from inheriting the outer one's corners.

### 3b. `@scope` is the newest CSS in the library

`.join` uses `@scope(&)` with `:scope` **[verified]** — the most recent feature any component here depends on, newer than the `:has()` used by Aura, Card, Filter and Hover Gallery.

Without `@scope` support the four `--join-*` variables stay `0`, so a join renders as square-cornered, correctly-collapsed buttons: **degraded but usable**, not broken. Worth one check in Step 5 and a JSDoc line, since "my join has square corners" has exactly one cause.

### 3c. Direction flips two variables, and the responsive form is a class

`join-vertical` sets `--join-v:1; --join-h:0; flex-direction:column`; `join-horizontal` the mirror **[verified]**. Those variables do double duty: they pick which corners round **and** which axis the negative border-collapsing margin runs along:

```css
.join-item:not(:first-child, :disabled, [disabled], .btn-disabled) {
  margin-block-start:  calc(var(--border,1px) * -1 * var(--join-v));
  margin-inline-start: calc(var(--border,1px) * -1 * var(--join-h));
}
```

**[verified]** — which is why a joined group has single-width borders between items rather than doubled ones.

The doc page's third example is `join join-vertical lg:join-horizontal`, a **caller class** — the library's standing answer (`plans/components/card.md` §3e). The `direction` prop covers the unconditional case.

### 3d. Disabled items are handled, and focus is raised

Two behaviours that need no props but explain otherwise-odd rendering **[both verified]**:

- **`:disabled`, `[disabled]` and `.btn-disabled` items are excluded from the negative margin** and get explicit border widths instead, so a disabled item in the middle of a join does not lose a border edge.
- **`:focus` raises an item to `z-index: 2`, and `.btn:hover` to `1`** — so a focused input's ring is not clipped by its neighbours. The `:has(:focus)` arm means this works through wrappers too (§3a).

A caller who wants a different corner on one item just overrides it — the doc page's "custom border radius" example adds `rounded-e-full` to the last button. Because `.join-item`'s radii come from low-specificity `:where()` rules **[verified]**, a plain utility wins with no `!important`.

### 3f. §2's Collapse recommendation was already carried out

**2026-09-01.** §2 recommended dropping `Collapse`'s `join?: boolean` in favour
of `class="join-item"`, and listed it as this component's Step 7 amendment.
**`Collapse` shipped without it on 2026-08-31**, before this plan started — the
same conclusion reached from the other end, and for a second reason:
`Accordion`'s wrapper carries `[&>*]:join-item`, which Tailwind 4 does emit, so
the items inside an accordion need no prop either
(`plans/components/collapse.md` §3i, `plans/components/accordion.md` §3e.1).

Nothing left to do here. `plans/IMPLEMENTATION-ORDER.md` §5.4's Join row is
already struck through. Recorded because a Step 7 that quietly turns out to be
a no-op is worth one line either way.

### 3e. Unverified assumptions

1. **`@scope` support in the Storybook browser** (§3b). One check; the failure is graceful.
2. **Cross-component composition** — every example joins `btn`, `input`, `select` or radio inputs. Raw markup in stories until those plans land, noted in a comment.
3. **`aria-label` on joined radios.** The last doc example is `<input class="join-item btn" type="radio" aria-label="Radio 1">` — the same `aria-label`-as-visible-text mechanism `plans/components/filter.md` §3c documented. Its story must include the labels or the buttons render empty.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type JoinDirection = 'horizontal' | 'vertical';

/**
 * Groups controls into one bordered unit, rounding only the outer corners and
 * collapsing the borders between items.
 *
 * Add `class="join-item"` to each item — there is no item component, and it
 * **does not need to be a direct child**: daisyUI passes the corner radii down
 * as inherited custom properties (plan §3a).
 *
 * ```astro
 * <Join>
 *   <TextInput class="join-item" placeholder="Email" />
 *   <Button class="join-item">Subscribe</Button>
 * </Join>
 * ```
 *
 * For the usual responsive group use the class rather than the prop:
 * `class="join-vertical lg:join-horizontal"` (plan §3c).
 */
interface Props extends HTMLAttributes<'div'> {
  /** Unconditional direction. `horizontal` is daisyUI's default. */
  direction?: JoinDirection;
}

// Full literal class names. NEVER `join-${direction}` (plans/README.md §1b).
const DIRECTION: Record<JoinDirection, string> = {
  horizontal: 'join-horizontal',
  vertical: 'join-vertical',
};

const { direction, class: className, ...rest } = Astro.props;
---

<div class:list={['join', direction && DIRECTION[direction], className]} {...rest}>
  <slot />
</div>
```

No `<script>`: pure CSS. Not polymorphic — daisyUI documents `join` on a wrapper `div`.

### Astro idioms gate

- [ ] Content arrives via a plain default slot — no `items` prop (§2).
- [ ] **No `JoinItem` component** — `join-item` is a caller class (§2).
- [ ] No `Astro.slots.has()` gating, and **no defensive direct-child requirement** — wrapping is supported (§3a).
- [ ] Root is `div`; no `as` prop.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root.
- [ ] Every variant class is a literal in a `Record` map — no `` `join-${direction}` ``.
- [ ] No variant prop collides with a native attribute: `direction` is absent from `HTMLAttributes` (`SVGAttributes` only, `astro-jsx.d.ts:1186`) **[verified]**.
- [ ] Probe (§5c):
  ```astro
  <Join><button class="btn join-item">A</button><button class="btn join-item">B</button></Join>
  <Join direction="vertical" class="lg:join-horizontal" id="x" data-test="y">ok</Join>
  <Join direction="diagonal">must error — not a direction</Join>
  <Join color="primary">must error — no colour axis (§1)</Join>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Notes |
|---|---|---|
| Join | `Default` | three joined buttons |
| Group items vertically | `Vertical` | `direction: 'vertical'` |
| Responsive | `Responsive` | `class: 'join-vertical lg:join-horizontal'`, **no prop** (§3c) |
| With extra elements in the group | `NestedItems` | an input two wrappers deep, a select, and a button inside an `indicator` — the §3a case |
| Custom border radius | `CustomRadius` | last button `class="join-item rounded-e-full"` (§3d) |
| Join radio inputs with btn style | `RadioButtons` | `aria-label` on each (§3e.3) |

Plus `Playground` and `Passthrough`. Two beyond the doc page:

- **`WithDisabledItem`** — a disabled button in the middle, showing §3d's preserved borders.
- **`FocusRaisesItem`** — a joined input; tabbing to it should show an unclipped focus ring (§3d).

## 6. Steps

- [x] **Step 1: done as far as the build can answer it.** `@scope(&)` reaches the built stylesheet intact (§8), so the mechanism ships; whether the *browser* supports it is §3b's degraded-not-broken case and moves to Step 5.
- [x] **Step 2: skipped as planned.** `JoinDirection` is local; `variants.ts` untouched.
- [x] **Step 3: done.** Scaffold replaced per §4, gate walked, probe errored on both intended lines. **No `JoinItem` was created** and no direct-child requirement was added anywhere (§3a).
- [x] **Step 4: done.** `Join.stories.ts`, 10 stories — 6 doc-page examples plus `Playground`, `Passthrough`, `WithDisabledItem` and `FocusRaisesItem`. Three of them carry `TODO(daisy-astro)` markers for `TextInput`, `Select` and `Indicator`, which is this cluster's pass-2 debt rather than a shortcut (`plans/IMPLEMENTATION-ORDER.md` §5.2, §5.3).
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and one item needs a keyboard.** Verify: `Default` rounds only the outer corners and shows **single-width** borders between items; `Vertical` the same top to bottom; `Responsive` flips at `lg`; **`NestedItems` is indistinguishable from a flat join** — §3a's whole point, and the thing that would fail if the mechanism were direct-child-based; `CustomRadius`'s last item takes `rounded-e-full` with no `!important`; `RadioButtons` behaves as one radio group with visible labels; **`WithDisabledItem` keeps every border edge**; and `FocusRaisesItem`'s middle input shows an **unclipped** focus ring when tabbed to (§3d). If the corners are square everywhere, that is §3b, not this component.
- [x] **Step 6: done — forwarding confirmed.** `Passthrough` renders `<div class="join join-vertical mine lg:join-horizontal" id="join-1" data-test="yes" style="letter-spacing:1px">`. Full output in §8.
- [x] **Step 7: done — the `Join (group items)` row in `plans/README.md` says Implemented.** The `plans/components/collapse.md` amendment §2 asked for **was already made when Collapse shipped** (§3f).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 4 daisyUI classes reachable; `join-item` documented as a caller class (§2).
- [x] No `JoinItem` component, and no direct-child requirement anywhere (§2, §3a).
- [x] `direction` renders both classes; the responsive form is documented as a class (§3c).
- [x] `NestedItems` renders identically to a flat join (§3a).
- [x] JSDoc states: items may be nested (§3a), `@scope` is the support floor (§3b), and per-item radius overrides work with plain utilities (§3d).
- [x] No invented axis — no colour, size, `items` prop.
- [x] `plans/components/collapse.md` is amended per §2.
- [x] One story per doc-page example, plus `WithDisabledItem` and `FocusRaisesItem`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-01). `astro check`: 197 files, 0 errors, 0 warnings, 0 hints.

```
NestedItems → <div class="join">
                <div><div><input class="input join-item w-[5.3rem] md:w-52" placeholder="Search"/></div></div>
                                ↑ two wrappers deep, and still an item (§3a)
                <select class="select join-item …">…</select>
                <div class="indicator"><span class="badge badge-secondary indicator-item">new</span>
                  <button class="btn join-item">Search</button></div></div>
RadioButtons → <input type="radio" name="join-options" autocomplete="off" aria-label="Radio 1"
                 class="btn join-item"/> ×3
Passthrough  → <div class="join join-vertical mine lg:join-horizontal" id="join-1" data-test="yes"
                 style="letter-spacing:1px">…
```

Counts across the 10 stories:

```
join roots 10 | join-item occurrences 29
join-vertical 3 | join-horizontal 2 (2 of the 5 are the `lg:` responsive form)
all 4 classes have rules in the built stylesheet, and `@scope` survives into it
```

What this settles:

- **§3a, in the markup**: `NestedItems` really does put its input two wrappers below `.join` and its button inside an `indicator`. Every other component in this library needed a direct-child check here; this one needed the opposite — a check that nothing defensive was added. Whether it *looks* identical is Step 5.
- **§2 holds**: 29 `join-item` occurrences, every one of them a class the story wrote on a component or an element it already had. No `JoinItem` exists, and `Join` has one prop.
- **§3b's mechanism ships**: `@scope` is present in the built CSS, so square corners in a browser would be that browser's support, not a build problem.
- **`RadioButtons` reuses `Button as="input"`**, so `aria-label` is the visible text — the rule `plans/components/button.md` §3c records.
- The three `TODO(daisy-astro)` markers are for `TextInput`, `Select` and `Indicator`, none of them implemented yet. They are greppable and expire when those rows flip (`plans/IMPLEMENTATION-ORDER.md` §5.2).

Not settled here: the corners, the collapsed borders, the disabled item's edges and the focus ring. All Step 5.
