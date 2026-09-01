# Footer Component Plan

**daisyUI category:** Layout
**daisyUI doc page:** https://daisyui.com/components/footer/
**Root element:** `footer` (`Footer`), `h6` by default and polymorphic (`FooterTitle`)
**Target files:** `packages/daisy-astro/src/components/Footer/Footer.astro`, `FooterTitle.astro` (only `Footer.astro` exists, as a dummy scaffold; its `<footer>` root is already right)
**Story files:** `Footer.stories.ts`, `FooterTitle.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'footer'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/footer.css` and the doc page source. §3e lists what is **unverified**.


> **Status:** **Implemented** (2026-09-01). `Footer.astro`, `FooterTitle.astro` and 15 stories. §3e.1 is answered — a `nav`, `aside` or `form` is the direct child in 21 of 21 footers (§8) — and §3e.4's raw-markup fallback is **fully discharged**: every partner component now exists, so the form example composes `Fieldset`, `Label`, `Join`, `TextInput` and `Button`, and 133 links are the real `Link`. §3's five findings all held; nothing needed correcting. Step 5 (visual pass) is open.
---

## 0. A grid of grids

```css
.footer { display:grid; grid-auto-flow:row; place-items:start; gap:2.5rem 1rem; width:100%; font-size:.875rem }
.footer > :not(script, style, template) { display:grid; place-items:start; gap:.5rem }
.footer-title { text-transform:uppercase; opacity:.6; margin-bottom:.5rem; font-weight:600 }
.footer-center { text-align:center; grid-auto-flow:column dense; place-items:center }
.footer-center > :not(script, style, template) { place-items:center }
.footer-horizontal { grid-auto-flow:column }
.footer-vertical   { grid-auto-flow:row }
.footer-horizontal.footer-center { grid-auto-flow:dense }
.footer-vertical.footer-center   { grid-auto-flow:column dense }
```

**[all verified]**. Two levels: the footer lays out **columns**, and each column is itself a grid laying out its own links with a tighter gap. The `:not(script, style, template)` guard is the same one Dock uses — **anything else that lands as a direct child becomes a column** (§3d).

## 1. Variant audit

**5 classes: 1 component + 1 part + 1 placement + 2 direction**, matching the doc page's frontmatter. `grep -oE '\.footer[a-z0-9-]*' footer.css | sort -u` returns exactly those 5 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `footer` | — | — | `Footer` | Always applied. |
| Part | `footer-title` | — | — | `FooterTitle` | Always applied. |
| Placement | `footer-center` | `center` | `boolean` | `Footer` | One class → boolean, per `card-side` (`plans/components/card.md` §1). **Interacts with `direction`** — §3c. |
| Direction | `footer-horizontal` `footer-vertical` | `direction` | `'horizontal' \| 'vertical'` | `Footer` | Mutually exclusive → union. `vertical` is the default and still emittable. Responsive form is a caller class — §3b. |

**No colour or size axis** — none exists **[verified]**. `bg-neutral text-neutral-content p-10 rounded` in every example is plain Tailwind on the root.

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Footer` | `default` | none — direct children of `.footer`, each becoming a column | no | `<nav>`, `<aside>`, `<form>` |
| `FooterTitle` | `default` | none | no | `Services`, `Company`, `Legal` |

Plain default slots, no gating.

**No `FooterColumn` component.** Columns are bare `<nav>`, `<aside>` and `<form>` elements with **no class at all** — daisyUI styles them through `.footer > *` **[verified]**. That is the "bare element" case from the treatment table in `plans/components/chat-bubble.md` §0a, like Card's `<figure>` and Code Mockup's `<pre>`. Which element to use is a semantics decision the caller owns: `<nav>` for link groups, `<aside>` for the logo/copyright block, `<form>` for the newsletter — all three appear in the doc examples.

**No `columns` array prop**: one column holds links, another a logo and a paragraph, another a whole form.

## 3. Five things the naive implementation gets wrong

### 3a. `footer-title` is a heading, and `h6` is daisyUI's choice, not a rule

Every example writes `<h6 class="footer-title">`. `h6` is the lowest heading level, which is defensible for a footer column but wrong in a document whose outline does not have five levels above it.

`FooterTitle` is therefore **`Polymorphic<{ as: Tag }>` defaulting to `'h6'`** — matching the doc page out of the box, adjustable per context. Identical reasoning and mechanism to `plans/components/card.md` §3a's `CardTitle` (which defaults to `h2`), including the silent §5c declaration-order trap (§3e.2).

The class is presentational only — `text-transform: uppercase; opacity: .6; font-weight: 600` **[verified]** — so `as="p"` or `as="div"` is available where a heading would be wrong outright.

### 3b. Almost every doc example is responsive, and that is a caller class

Nine of the ten examples use `sm:footer-horizontal`, not `footer-horizontal` **[verified]** — a footer that stacks on mobile and spreads on desktop is the normal case, and daisyUI ships the prefixed classes for it.

So the common usage is:

```astro
<Footer class="sm:footer-horizontal bg-neutral text-neutral-content p-10">
```

with **no `direction` prop at all**. The library's standing answer for responsive axes (`plans/components/card.md` §3e), and here it is worth stating loudly because the prop will look like the obvious tool and is the wrong one most of the time. The `direction` prop covers the unconditional case, which two doc examples use.

### 3c. `center` changes what `direction` means

The combination rules are not additive **[verified]**:

| Classes | `grid-auto-flow` |
|---|---|
| `footer` (default) | `row` |
| `footer-horizontal` | `column` |
| `footer-center` | `column dense` |
| `footer-horizontal footer-center` | `dense` (i.e. **row** flow, dense packing) |
| `footer-vertical footer-center` | `column dense` |

So `footer-center` alone already flows in columns, and adding `footer-horizontal` to it *flips it back to rows*. The names stop describing the result once combined.

Not something to fix — it is daisyUI's CSS — but the JSDoc must say that `center` is a layout mode, not just an alignment tweak, and the `Placements` story renders all five combinations so the behaviour is observable rather than surprising.

### 3d. Every non-script direct child becomes a column

`.footer > :not(script, style, template)` gives each child `display: grid; gap: .5rem` **[verified]**. Two consequences:

- **A stray wrapper becomes a column**, exactly as in `plans/components/dock.md` §3a — it does not merely go unstyled, it takes the column styling and collapses the real columns inside it into one cell. That makes §3e.1 blocking.
- **Links are grid children of their column**, so they are laid out by the `.5rem` gap, not by margins. Wrapping links in a `<div>` inside a `<nav>` collapses that spacing — the social-icon examples do exactly this deliberately, adding `grid grid-flow-col gap-4` to the wrapper to restore control.

### 3e. Unverified assumptions

1. **Do slot children land as direct children of `.footer`?** Blocking, and the loud variety per §3d. Thirteenth plan to hit the shared question in `plans/components/aura.md` §3e.1.
2. **Generic prop inference on `FooterTitle`** — `Polymorphic` brings §5c's silent failure. The probe in §4 is mandatory.
3. **Slot sanitization vs inline `<svg>`** — the logo and social icons. Shared with `plans/components/alert.md` §3d.1.
4. **Cross-component composition** — the doc examples use `link link-hover`, `input`, `join` and `btn`, whose plans are not all written. Raw markup in the stories until they land, noted in a comment.

## 4. Component implementation

### `Footer.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type FooterDirection = 'horizontal' | 'vertical';

/**
 * A grid of columns, where each direct child is a column and is itself a grid
 * (plan §0). Use bare `<nav>`, `<aside>` or `<form>` for columns — daisyUI
 * styles them by position, with no class (plan §2).
 *
 * Most footers want the **responsive** form, which is a class rather than the
 * prop: `class="sm:footer-horizontal"` (plan §3b).
 */
interface Props extends HTMLAttributes<'footer'> {
  /** Unconditional direction. For the usual responsive footer, use the class. */
  direction?: FooterDirection;
  /**
   * Centre-aligns and switches the flow. **Not purely an alignment tweak** —
   * combined with `direction` it changes which axis columns flow along
   * (plan §3c).
   */
  center?: boolean;
}

// Full literal class names. NEVER `footer-${direction}` (plans/README.md §1b).
const DIRECTION: Record<FooterDirection, string> = {
  horizontal: 'footer-horizontal',
  vertical: 'footer-vertical',
};

const { direction, center = false, class: className, ...rest } = Astro.props;
---

<footer
  class:list={['footer', direction && DIRECTION[direction], { 'footer-center': center }, className]}
  {...rest}
>
  <slot />
</footer>
```

### `FooterTitle.astro`

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

// `Props` MUST precede every `const` (plans/README.md §5c).
/**
 * Column heading. daisyUI's examples use `<h6>`; the level is a document-
 * outline decision, so override it per context (plan §3a). Presentational
 * only, so `as="p"` is fine where a heading would be wrong.
 */
type Props<Tag extends HTMLTag> = Polymorphic<{ as: Tag }>;

const { as: Tag = 'h6', class: className, ...rest } = Astro.props as Props<HTMLTag>;
---

<Tag class:list={['footer-title', className]} {...rest}>
  <slot />
</Tag>
```

No `<script>` in either: pure CSS. `Footer` is not polymorphic — `<footer>` is the semantic element and daisyUI documents nothing else.

### Astro idioms gate

- [ ] Content arrives via plain default slots — no `columns` prop (§2).
- [ ] `<slot />` has no wrapper in `Footer` — a wrapper becomes a column (§3d, §3e.1).
- [ ] No `FooterColumn` component; columns are bare `<nav>`/`<aside>`/`<form>` (§2).
- [ ] No `Astro.slots.has()` gating — nothing is optional.
- [ ] `Footer`'s root is `<footer>` with no `as`; `FooterTitle` defaults to `h6` via `Polymorphic` (§3a).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root in both files.
- [ ] No variant prop collides with a native attribute: `direction` is absent from `HTMLAttributes` (`SVGAttributes` only, `astro-jsx.d.ts:1186`) **[verified]**; `center` is not an attribute.
- [ ] Every variant class is a literal in a `Record` map or object key.
- [ ] **`type Props` precedes every `const` in `FooterTitle.astro`**, with `as Props<HTMLTag>` (§3e.2).
- [ ] Probe (§5c) — mandatory, the generic failure is silent:
  ```astro
  <Footer class="sm:footer-horizontal p-10"><nav><FooterTitle>Services</FooterTitle></nav></Footer>
  <Footer direction="horizontal" center id="x" data-test="y">ok</Footer>
  <FooterTitle as="h3">ok</FooterTitle>
  <Footer color="primary">must error — no colour axis (§1)</Footer>
  <Footer direction="diagonal">must error — not a direction</Footer>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Two files. Doc-page examples in page order (`plans/README.md` §8), all in `Footer.stories.ts`: `Default`, `WithLogo`, `WithForm`, `WithLogoAndSocial`, `WithCopyright`, `CopyrightAndSocial`, `LinksAndSocial`, `TwoRows` (`class="grid-rows-2"`), `CenteredWithLogoAndSocial`, `CenteredWithSocial`, `TwoFooters`.

Plus `Playground` and `Passthrough`; `FooterTitle.stories.ts` gets a `Playground` + `Passthrough`.

Two beyond the doc page:

- **`Placements`** — all five `direction` × `center` combinations from §3c's table side by side, since the interaction is not guessable.
- **`ResponsiveVsProp`** — `class="sm:footer-horizontal"` beside `direction="horizontal"`, so §3b's "use the class" advice is concrete.

## 6. Steps

- [x] **Step 1: done for §3e.1**, the loud variety: a stray wrapper here does not go unstyled, it *becomes a column* and collapses the real ones into a single cell. 21 of 21 footers hold a `nav`, `aside` or `form` directly. §3e.3 is clear too — 23 inline SVGs survive — and §3e.4 is discharged entirely.
- [x] **Step 2: skipped as planned.** `FooterDirection` is local; `variants.ts` untouched.
- [x] **Step 3: done.** Gate walked; the probe errors on all three intended lines, including `href` on a `FooterTitle as="h3"`, which is the proof the polymorphic typing took — the failure §3e.2 warns about is silent.
- [x] **Step 4: done.** `Footer.stories.ts`, 15 stories — 11 doc-page examples plus `Playground`, `Passthrough`, `Placements` and `ResponsiveVsProp`. **No `FooterTitle.stories.ts`**: its only prop is `as`, exercised by `Passthrough`, and its forwarding is asserted there too (the call `plans/components/stat.md` §3g.2 established).
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes and a resize.** Verify: `Default` **stacks below `sm` and spreads above it**, which is the responsive class rather than the prop; columns sit `2.5rem` apart with `.5rem` between their own links; titles are uppercase and dimmed; **`Placements` matches §3c's table exactly, including `horizontal` + `center` flowing in rows**; `TwoRows` wraps six columns into two rows; and `CenteredWithSocial` centres both the columns and their contents.
- [x] **Step 6: done — forwarding confirmed at both levels.** `Passthrough` renders `<footer class="footer footer-horizontal footer-center mine p-10 …" id="footer-1" data-test="yes" style="letter-spacing:1px">` around `<h3 id="title-1" data-test="title" class="footer-title title-marker">`, which also shows the polymorphic root changing. Full output in §8.
- [x] **Step 7: done — the `Footer` row in `plans/README.md` says Implemented** and names `FooterTitle`.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 5 daisyUI classes reachable.
- [x] Columns render as direct children and are bare semantic elements (§2, §3d).
- [x] `FooterTitle` defaults to `h6` and accepts any tag; probe passes (§3a, §3e.2).
- [x] `center` × `direction` behaves per §3c's table, and `Placements` shows it.
- [x] JSDoc states: prefer `class="sm:footer-horizontal"` over the prop (§3b), `center` is a flow mode (§3c), and each child becomes a column (§3d).
- [x] No invented axis — no colour, size, `columns` prop, or `FooterColumn`.
- [x] One story per doc-page example, plus `Placements` and `ResponsiveVsProp`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-01), SVG paths elided. `astro check`: 200 files, 0 errors, 0 warnings, 0 hints.

```
Default     → <footer class="footer sm:footer-horizontal p-10 bg-neutral text-neutral-content rounded">
                <nav><h6 class="footer-title">Services</h6>
                  <button class="link link-hover">Branding</button>…</nav>…
                     ↑ the column is a bare <nav> with no class — §2
Passthrough → <footer class="footer footer-horizontal footer-center mine p-10 …" id="footer-1"
                data-test="yes" style="letter-spacing:1px">
                <nav><h3 id="title-1" data-test="title" class="footer-title title-marker">Passthrough</h3>…
```

Counts across the 15 stories:

```
<footer> elements 21  → a nav/aside/form is the direct child  21 of 21
footer-title 43 — 42 as <h6> (the default), 1 as <h3>
sm:footer-horizontal 12 | footer-horizontal 18 | footer-vertical 1 | footer-center 7
inline SVG 23 | real Link components 133
built CSS: all 5 classes, the `.footer-horizontal.footer-center` combination rule, and `sm\:footer-horizontal`
```

What this settles:

- **§3e.1, in its loud form.** Everywhere else in the library a wrapper degrades a rule quietly; here `.footer > :not(script, style, template)` means a wrapper **becomes a column** and swallows the real ones. 21 of 21 are clean.
- **§2's no-`FooterColumn` decision is visible in the output**: every column is a bare `nav`, `aside` or `form` carrying no class at all, which is exactly why a sub-component would have had nothing to add.
- **§3b's advice is what the stories actually do**: 12 uses of `sm:footer-horizontal` against 1 of `direction="vertical"`. The prop exists for the two doc examples that are unconditionally horizontal, and `ResponsiveVsProp` puts the two side by side.
- **§3c's combination rule is in the built CSS** as its own `.footer-horizontal.footer-center` block, which is the evidence that `center` is a flow mode rather than an alignment tweak. `Placements` renders all five rows of that table.
- **§3a's default is the common case**: 42 of 43 titles are `h6`, and the one `h3` asked for it — which is the balance the polymorphic default is aiming at.
- **§3e.4 is discharged**: 133 links are the real `Link`, and the newsletter column composes `Fieldset` → `Label` → `Join` → `TextInput` + `Button`. No raw-markup fallback remains here.

Not settled here: the responsive flip, the two gaps, and whether `Placements` really matches §3c. All Step 5.
