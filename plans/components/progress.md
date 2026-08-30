# Progress Component Plan

**daisyUI category:** Feedback
**daisyUI doc page:** https://daisyui.com/components/progress/
**Root element:** `progress`
**Target file:** `packages/daisy-astro/src/components/Progress/Progress.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Progress/Progress.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'progress'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisyColor`, not `DaisySize`** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** **Implemented** (2026-08-30). `Progress.astro` and 15 stories are in the repo per §4/§5. §3a's indeterminate case is asserted in the build output — no `value=""` is emitted anywhere, and the indeterminate bar carries no `value` attribute at all (§8). Step 5 (visual pass) is open. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/progress.css` and the doc page source. §3e lists what is **unverified**.

---

## 0. A styled native `<progress>`, and the colour is `currentColor`

```css
.progress { appearance:none; width:100%; height:.5rem; overflow:hidden; position:relative;
            border-radius:var(--radius-box);
            color:var(--color-base-content);
            background-color:color-mix(in oklab, currentcolor 20%, transparent) }
@supports (-webkit-appearance:none) {
  .progress::-webkit-progress-bar   { background-color:#0000; border-radius:var(--radius-box) }
  .progress::-webkit-progress-value { background-color:currentColor; border-radius:var(--radius-box);
                                      @media (prefers-reduced-motion:no-preference) { transition:inline-size .3s } } }
@supports (-moz-appearance:none) {
  .progress::-moz-progress-bar { background-color:currentColor; … } }
.progress-primary { color:var(--color-primary) }   /* …one per colour */
```

**[all verified]**. Every colour class sets **`color`**, and both the filled bar and the 20 %-opacity track derive from it. That is why the colour axis is eight one-line rules and why there is no separate track colour (§3b).

## 1. Variant audit

**9 classes: 1 base + 8 colour**, matching the doc page's frontmatter. `grep -oE '\.progress[a-z0-9-]*' progress.css | sort -u` returns exactly those 9 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `progress` | — | — | Always applied. |
| Colour | `progress-neutral` `-primary` `-secondary` `-accent` `-info` `-success` `-warning` `-error` | `color` | `DaisyColor` | Matches `DaisyColor` exactly — import it. Each sets `color`, not `background-color` — §3b. |

**No size axis, no style axis** — there is no `progress-lg`, no `progress-striped` **[verified]**. Height is a fixed `.5rem`; a thicker bar is `class="h-4"` (§3c).

## 2. Slots

**None.** `<progress>` may technically contain fallback text, but every doc example is self-closing **[verified]** and daisyUI's `appearance: none` styling assumes an empty element.

Seventh component in the library with no slot, after Checkbox, `CountdownValue`, File Input, `HeroOverlay`, Loading and `PhoneMockupCamera`.

**No `value`/`max` props.** Both are native attributes on `<progress>` and arrive through `...rest` — declaring them would shadow the real thing for no gain. The one thing worth documenting is what happens when `value` is **absent** (§3a).

## 3. Five things the naive implementation gets wrong

### 3a. Omitting `value` is a documented feature, not a missing prop

`<progress class="progress w-56"></progress>` — the page's last example — renders an **indeterminate** bar **[verified]**:

```css
.progress:indeterminate {
  background-image: repeating-linear-gradient(90deg, currentColor -1% 10%, #0000 10% 90%);
  background-size: 200%; background-position-x: 15%;
  @media (prefers-reduced-motion: no-preference) { animation: 5s ease-in-out infinite progress } }
```

So `value={undefined}` is meaningful and must reach the DOM as **no attribute at all**, not `value=""` or `value="0"` — `value="0"` renders a determinate empty bar, which looks similar and behaves differently for assistive technology.

Astro omits attributes whose value is `undefined`, so passing nothing works — but a `value?: number` prop that defaults to `0` would silently destroy the indeterminate state. **No default.** The JSDoc says so and `Indeterminate` (§5) covers it.

Note the animation is gated on `prefers-reduced-motion: no-preference` **[verified]**, so a reduced-motion user sees a **static striped bar**. That is daisyUI's choice — unlike `plans/components/aura.md` §3d and `plans/components/loading.md` §3c, which slow down rather than stop. Third component, third reduced-motion policy; the JSDoc records this one.

### 3b. The colour classes set `color`, which is why the track follows the bar

`background-color: color-mix(in oklab, currentcolor 20%, transparent)` on the element, `background-color: currentColor` on the value pseudo-element **[verified]**.

Consequences:

- **One prop controls both** the fill and the 20 % track. There is no track-colour class and no way to decouple them through daisyUI.
- **`class="text-primary"` works exactly like `color="primary"`** — the same `currentColor` seam `plans/components/loading.md` §3a documented. The prop exists because daisyUI ships the eight classes; the utility is the escape hatch for anything else.
- The default is `color: var(--color-base-content)` **[verified]**, so an uncoloured progress bar is theme-neutral rather than invisible.

### 3c. Full width, fixed height, and no size axis

`width: 100%; height: .5rem` **[verified]**. Every doc example adds `w-56` **[verified]** — not because it is needed for the bar to appear, but because a 100 %-wide bar in a centred demo column looks wrong.

So sizing is entirely caller classes: `w-*` for length, `h-*` for thickness. The JSDoc says both, since a caller looking for `size="lg"` will find nothing and daisyUI genuinely has nothing.

### 3d. Three vendor pseudo-elements, and only one of them exists per browser

daisyUI styles `::-webkit-progress-bar`, `::-webkit-progress-value` and `::-moz-progress-bar`, each inside its own `@supports` block **[verified]**, plus a fourth rule that re-applies the indeterminate stripes to `::-moz-progress-bar` because Firefox paints the bar rather than the element.

Nothing to implement — but two things follow for review:

- **A caller cannot restyle the fill** without writing the same vendor pseudo-elements themselves; `class="bg-*"` hits the track only.
- The `transition: inline-size .3s` on the value **[verified]** means changing `value` animates. That is the reason to update the attribute rather than swapping the whole element when driving it from JS.

### 3e. Unverified assumptions

1. **Nothing structural.** There are no child selectors, no parts, no `:nth-child` **[verified]** — the shared slot-wrapping question that gates twenty-three sibling plans does not apply, and there is no slot anyway. Same conclusion as `plans/components/kbd.md` §3d and `plans/components/loading.md` §3e.
2. **`value` through the story `args` pipeline.** Storybook controls will set and clear it; confirm that clearing it produces **no attribute** rather than `value=""`, since that is the difference between indeterminate and zero (§3a). Related to `plans/components/checkbox.md` §3f.1.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * A styled native `<progress>`. `value` and `max` are plain attributes — pass
 * them through, and **omit `value` entirely for an indeterminate bar**
 * (plan §3a). `value={0}` is a determinate empty bar, which is different.
 *
 * Colour sets `currentColor`, so it drives both the fill and the 20% track;
 * `class="text-primary"` is equivalent (plan §3b).
 *
 * Fixed `.5rem` height and 100% width — size it with `class="w-56 h-4"`
 * (plan §3c).
 */
interface Props extends HTMLAttributes<'progress'> {
  color?: DaisyColor;
}

// Full literal class names. NEVER `progress-${color}` (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'progress-primary', secondary: 'progress-secondary',
  accent: 'progress-accent', neutral: 'progress-neutral',
  info: 'progress-info', success: 'progress-success',
  warning: 'progress-warning', error: 'progress-error',
};

const { color, class: className, ...rest } = Astro.props;
---

<!-- No slot: every doc example is self-closing (plan §2). `value` is NOT
     defaulted — a missing attribute is what makes it indeterminate (§3a). -->
<progress class:list={['progress', color && COLOR[color], className]} {...rest}></progress>
```

No `<script>`: the indeterminate animation and the value transition are CSS (§3a, §3d). Not polymorphic — `<progress>` is the element, and its semantics are the whole point.

### Astro idioms gate

- [ ] **No `<slot />`** (§2).
- [ ] No `Astro.slots.has()` gating — there are no slots.
- [ ] Root is `<progress>`; no `as` prop.
- [ ] **`value` has no default**, so omitting it yields no attribute (§3a).
- [ ] No `value`/`max` props declared — they pass through `...rest` (§2).
- [ ] No `<script>` added, and no reduced-motion override (§3a).
- [ ] `...rest` spread onto the root — carries `value`, `max`, `id`, `aria-label`.
- [ ] `color` uses `DaisyColor`, imported, not redeclared; it shadows only the obsolete non-standard `color` attribute (`astro-jsx.d.ts:602`) **[verified]**, the tradeoff Button already accepted.
- [ ] Every variant class is a literal in a `Record` map — no `` `progress-${color}` ``.
- [ ] Probe (§5c):
  ```astro
  <Progress class="w-56" value={40} max={100} />
  <Progress class="w-56" />
  <Progress color="primary" class="w-56 h-4" aria-label="Upload" value={70} max={100} />
  <Progress color="banana">must error — not a DaisyColor</Progress>
  <Progress size="lg">must error — no size axis (§1)</Progress>
  <Progress>must error — no slot (§2)</Progress>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8) — each is a column of five bars at 0/10/40/70/100: `Default`, `Primary`, `Secondary`, `Accent`, `Neutral`, `Info`, `Success`, `Warning`, `Error`, then `Indeterminate`.

Plus `Playground` (with a `value` control) and `Passthrough`. Three beyond the doc page:

- **`Colors`** — all eight at 70 % side by side, since the page shows them one colour at a time across eight sections.
- **`ZeroVsIndeterminate`** — `value={0}` beside no `value`, making §3a's difference visible; the comment notes they also differ for assistive technology.
- **`Thickness`** — the default `.5rem` beside `class="h-4"`, covering §3c's missing size axis.

## 6. Steps

- [x] **Step 1: done.** §3e.2 is answered in the build output rather than in the controls UI: omitting `value` in a story's args produces **no attribute**, and `value=""` appears zero times across every story in the library. Whether Storybook's number control can *clear* the value back to nothing is a Step 5 question, and a lesser one — the component's own behaviour is what this plan was worried about.
- [x] **Step 2: skipped as planned.** `DaisyColor` reused unchanged; `variants.ts` untouched.
- [x] **Step 3: done.** Scaffold replaced per §4 and the gate walked. Two probe lines from §4's listing were dropped as unachievable: `color="primary"`-style colour errors are impossible on any component (`plans/components/avatar.md` §3e.3 — though `color="banana"` still errors here, since this component *does* declare `color`), and passing children to a slotless component is not a type error (`plans/components/status.md` §3e.4).
- [x] **Step 4: done.** `Progress.stories.ts`, 15 stories per §5.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: `Default` shows five distinct fills; `Colors` shows eight hues with the **track tinted to match** (§3b); `Indeterminate` animates a repeating stripe; `ZeroVsIndeterminate` differs visibly as well as in the DOM (§3a); `Thickness` shows two heights; changing `Playground`'s `value` **animates** rather than jumping (§3d); then enable reduced motion and confirm the indeterminate bar goes **static** rather than slowing (§3a).
- [x] **Step 6: done — forwarding confirmed and the `value` rule asserted.** `Passthrough` renders `<progress class="progress progress-accent w-56 mine" value="55" max="100" id="progress-1" data-test="yes" style="opacity:.9" aria-label="Upload"></progress>`; every rendered progress element is empty; `value=""` count is **0**. Full output in §8.
- [x] **Step 7: done — the `Progress` row in `plans/README.md` says Implemented.**
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 9 daisyUI classes reachable: base plus 8 colours.
- [x] `color` uses `DaisyColor`, imported, not redeclared.
- [x] Omitting `value` renders **no `value` attribute** and an indeterminate bar (§3a) — asserted in the build output.
- [x] No slot, and every rendered element is empty (§2).
- [x] No invented axis — no size, no `value`/`max` props, no striped style (§1, §2).
- [x] JSDoc states: omit `value` for indeterminate (§3a), colour drives fill **and** track (§3b), sizing is `w-*`/`h-*` (§3c), and reduced motion stops the animation (§3a).
- [x] One story per doc-page example, plus `Colors`, `ZeroVsIndeterminate` and `Thickness`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-30). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Default        → <progress class="progress w-56" value="0" max="100"></progress>
                 … 10, 40, 70, 100                                   (one column per colour example)
Indeterminate  → <progress class="progress w-56"></progress>          ← no value attribute at all
ZeroVs…        → <progress class="progress w-56" value="0" max="100"></progress>
                 <progress class="progress w-56"></progress>
Colors         → <progress class="progress progress-primary w-56" value="70" max="100"> ×8
Thickness      → … class="progress progress-primary w-56" / … "w-56 h-4"
Passthrough    → <progress class="progress progress-accent w-56 mine" value="55" max="100"
                   id="progress-1" data-test="yes" style="opacity:.9" aria-label="Upload"></progress>
```

What this settles:

- **The indeterminate case works as designed** (§3a): omitting `value` emits no attribute, and `value=""` — which would be neither indeterminate nor zero — appears **zero** times across the whole build.
- `value` and `max` reach the DOM as plain attributes without being declared as props (§2).
- Every rendered element is empty (§2), and all 9 classes have rules in the built stylesheet.

Not settled here: the fill animation, the tinted track, and the reduced-motion behaviour are all runtime. Step 5.
