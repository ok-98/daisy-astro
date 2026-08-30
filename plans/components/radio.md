# Radio Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/radio/
**Root element:** `input` (void — no slot)
**Target file:** `packages/daisy-astro/src/components/Radio/Radio.astro` (currently a scaffold with the missing-`type` bug — §0)
**Story file:** `packages/daisy-astro/src/components/Radio/Radio.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'input'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisyColor` and `DaisySize` unchanged** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** **Implemented** (2026-08-30). `Radio.astro` and 15 stories are in the repo per §4/§5, with the missing-`type` scaffold bug fixed and asserted: **45 of 45** rendered radios carry `type="radio"` (§8). Step 5 (visual pass) is open. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/radio.css` and the doc page source. §3d lists what is **unverified**.

---

## 0. Checkbox's shape, and Checkbox's scaffold bug

Radio is Checkbox with a round mask: identical axes (8 colours, 5 sizes, no style), identical `--input-color` mechanism, identical native-`disabled` handling. **`plans/components/checkbox.md` is the reference; this plan does not restate it.**

```astro
<input class:list={['radio', className]} {...rest} />
```

**No `type`.** The third scaffold in this family to ship it, after `plans/components/checkbox.md` §0 and `plans/components/file-input.md` §0 — exactly as `plans/components/file-input.md` §0's audit predicted. An `<input>` with no `type` is `type="text"`, so the scaffold renders a **text field wearing radio styling**: circular, unselectable, and silent.

Fix is the same destructured default (§3a). **Range is the fourth and last of the predicted four** (OTP turned out to have a different bug — `plans/components/otp.md` §3e); confirm it while implementing this one.

## 1. Variant audit

**14 classes: 1 base + 8 colour + 5 size**, matching the doc page's frontmatter. `grep -oE '\.radio[a-z0-9-]*' radio.css | sort -u` returns exactly those 14 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `radio` | — | — | Always applied. |
| Colour | `radio-neutral` `-primary` `-secondary` `-accent` `-success` `-warning` `-info` `-error` | `color` | `DaisyColor` | Matches exactly — import it. Sets `--input-color`, the shared seam from `plans/components/checkbox.md` §3e. |
| Size | `radio-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | Matches exactly — import it. **Collides with the native attribute** — §3b. |

**No style axis and no disabled class** — `.radio:disabled` styles the native attribute directly **[verified]**, so no branching, per `plans/components/checkbox.md` §3d.

## 2. Slots

**None.** `<input>` is void — eighth component in the library with no slot.

The label is a sibling inside a `<label class="label">`, exactly as in `plans/components/checkbox.md` §2. No `label` prop, no wrapping `<label>`.

## 3. Four things the naive implementation gets wrong

### 3a. `type="radio"` must be emitted

`type` is on `InputHTMLAttributes` **[verified]**, so it arrives inside `...rest`. Destructure with a default — `plans/components/alert.md` §3b's mechanism:

```ts
const { type = 'radio', … , ...rest } = Astro.props;
```

Overridable, for the same reason as Checkbox: silently ignoring a caller's `type` is worse than letting them be deliberately wrong.

### 3b. `name` is not optional in practice, and daisyUI says so

The doc page opens with an info box **[verified]**:

> Each set of radio inputs should have unique `name` attributes to avoid conflicts with other sets of radio inputs on the same page.

That is not a styling note — it is how radio groups work at all. Two radios without a `name` are not a group; two *different* groups sharing one `name` become one group, and selecting in one clears the other.

**`name` is not made a required prop**, because a single radio outside a form is legal HTML and daisyUI's own sizes example renders five radios with five *different* names purely to keep them independent **[verified]**. But it is the first line of the JSDoc, and every story sets it — with a per-story prefix, the same hazard as `plans/components/drawer.md` §5's `toggleId` and `plans/components/filter.md` §5's group names.

Note the doc page's rendered sizes example uses `radio-2`, `radio-2.1`, `radio-2.2`… while its copy-paste HTML reuses `radio-2` for all five **[verified]** — so the published snippet makes them one group and only one can be checked, which is not what the screenshot shows. The story follows the **rendered** markup and notes the discrepancy.

### 3c. `size` collides with the native attribute — third instance, same answer

`size?: number | string` is on `InputHTMLAttributes` **[verified]**, and per the HTML spec it applies only to `text`, `search`, `tel`, `url`, `email` and `password` inputs — so browsers ignore it on `type="radio"` and nothing real is lost.

Keep the name, per `plans/components/checkbox.md` §3b and `plans/components/file-input.md` §3b. **The forward note still stands for Text Input**, which is the one place the collision costs something.

### 3d. Unverified assumptions

1. **Boolean attributes through the story `args` pipeline** — shared with `plans/components/checkbox.md` §3f.1; `checked` and `disabled` drive every story here.
2. **Radio group isolation across stories on one docs page** (§3b) — confirm the per-story name prefix works before writing eleven colour stories that would otherwise fight each other.

**Not a risk here:** no child selectors, no parts, no slot **[verified]** — the shared slot-wrapping question does not apply.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * A radio input. **Give every group a unique `name`** — that is what makes a
 * set of radios mutually exclusive, and two groups sharing a name become one
 * (plan §3b).
 *
 * The label is a sibling inside `<label class="label">`, not a child — this is
 * a void element with no slot (plan §2).
 */
interface Props extends HTMLAttributes<'input'> {
  color?: DaisyColor;
  /** Shadows the native `size` attribute, which browsers ignore on radios
   *  (plan §3c). Sets daisyUI's control size. */
  size?: DaisySize;
}

// Full literal class names. NEVER `radio-${color}` (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'radio-primary', secondary: 'radio-secondary', accent: 'radio-accent',
  neutral: 'radio-neutral', info: 'radio-info', success: 'radio-success',
  warning: 'radio-warning', error: 'radio-error',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'radio-xs', sm: 'radio-sm', md: 'radio-md', lg: 'radio-lg', xl: 'radio-xl',
};

// `type` is on InputHTMLAttributes and would otherwise stay in `...rest`,
// leaving an untyped input styled as a radio (plan §0, §3a).
const { type = 'radio', color, size, class: className, ...rest } = Astro.props;
---

<input
  type={type}
  class:list={['radio', color && COLOR[color], size && SIZE[size], className]}
  {...rest}
/>
```

No `<script>`: pure CSS, including the disabled state. Not polymorphic.

### Astro idioms gate

- [ ] **`type="radio"` is emitted** via a destructured default (§0, §3a).
- [ ] **No `<slot />`** — `<input>` is void (§2).
- [ ] No wrapping `<label>` and no `label` prop (§2).
- [ ] No `<script>` added; no `disabled` branching (§1).
- [ ] `...rest` spread onto the root, so `name`, `checked`, `value`, `required` and `disabled` work with no declarations.
- [ ] `size`'s collision with the native attribute is a documented decision (§3c).
- [ ] Every variant class is a literal in a `Record` map — no `` `radio-${color}` ``.
- [ ] Probe (§5c):
  ```astro
  <Radio name="plan" value="free" checked />
  <Radio name="plan" color="primary" size="lg" disabled />
  <Radio color="banana">must error — not a DaisyColor</Radio>
  <Radio size={40}>must error — size is DaisySize (§3c)</Radio>
  <Radio variant="outline">must error — no style axis (§1)</Radio>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `Default` (a pair), `Sizes` (five, **five distinct names** per §3b), `Neutral`, `Primary`, `Secondary`, `Accent`, `Success`, `Warning`, `Info`, `Error`, `Disabled`, `CustomColors`.

Plus `Playground` and `Passthrough`. Two beyond the doc page:

- **`Colors`** — all eight as one row, since the page shows them in eight separate sections.
- **`SharedNameCollision`** — two "groups" that share a `name`, showing §3b's cross-group interference. This is the doc page's own info box made visible.

**Every story uses a story-scoped `name` prefix** (§3b, §3d.2), with a comment.

## 6. Steps

- [x] **Step 1: done at the markup level.** Every story scopes its `name`, and the build output confirms the prefixes are distinct — whether two groups on one docs page truly stay independent is a runtime question and moves to Step 5, where `SharedNameCollision` demonstrates both halves.
- [x] **Step 2: skipped as planned.** `DaisyColor`/`DaisySize` reused unchanged; `variants.ts` untouched.
- [x] **Step 3: done — the scaffold bug is fixed.** `type` is destructured with a `'radio'` default, so the component can no longer render a text field wearing radio styling (§0, §3a). Gate walked; the probe errored on all five intended lines. **`Range/Range.astro` was checked in the same pass and had the same bug** — fixed there too, in the same commit.
- [x] **Step 4: done.** `Radio.stories.ts`, 15 stories per §5, each with a story-scoped `name` prefix.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: `Default` shows two circles where **selecting one clears the other**; `Sizes` shows five diameters, each independently checkable (§3b); `Colors` shows eight fills; `Disabled` is dimmed and inert; `CustomColors` recolours through `checked:` variants; and `SharedNameCollision` misbehaves exactly as documented — choosing in the left pair clears the right.
- [x] **Step 6: done — forwarding confirmed and §0 asserted.** `Passthrough` renders `<input type="radio" class="radio radio-accent radio-lg mine" name="pass-1" value="free" checked id="radio-1" data-test="yes" style="opacity:.9">`. Across every story, 45 of 45 inputs carry `type="radio"`. Full output in §8.
- [x] **Step 7: done — the `Radio` row in `plans/README.md` says Implemented**, and `plans/components/file-input.md` §0a's audit log records Radio as fixed.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 14 daisyUI classes reachable: base, 8 colours, 5 sizes.
- [x] **`type="radio"` present in every rendered story** (§0) — asserted in the build output.
- [x] `color` uses `DaisyColor` and `size` uses `DaisySize`, imported, neither redeclared.
- [x] No slot, no wrapping label (§2).
- [x] No invented axis — no style/variant prop, no `disabled` branching (§1).
- [x] JSDoc leads with the unique-`name` rule (§3b) and documents the `size` collision (§3c).
- [x] Stories use scoped `name` prefixes, and `Sizes` follows the doc page's **rendered** markup with the discrepancy noted (§3b).
- [x] `plans/components/file-input.md` §0's audit is updated for Radio (and Range checked).
- [x] One story per doc-page example, plus `Colors` and `SharedNameCollision`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-30). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Default       → <input type="radio" class="radio" name="default-1" checked>
                <input type="radio" class="radio" name="default-1">
Sizes         → <input type="radio" class="radio radio-xs" name="sizes-0" checked> … radio-xl / sizes-4
Primary       → <input type="radio" class="radio radio-primary" name="primary-1" checked> + unchecked pair
Disabled      → <input type="radio" class="radio" name="disabled-1" disabled checked> …
CustomColors  → <input type="radio" class="radio bg-red-100 border-red-300 checked:bg-red-200
                  checked:text-red-600 checked:border-red-600" name="custom-1" checked> …
SharedName…   → four radios all name="collide", then two independent pairs
Passthrough   → <input type="radio" class="radio radio-accent radio-lg mine" name="pass-1" value="free"
                  checked id="radio-1" data-test="yes" style="opacity:.9">
```

What this settles:

- **The scaffold bug is gone and cannot come back unnoticed**: 45 of 45 rendered inputs carry `type="radio"`. Without it every one of them would have been a text field with a circular border.
- Group names are scoped per story, so the eleven single-colour stories do not interfere on a shared docs page (§3b).
- `checked` and `disabled` survive the args pipeline as real boolean attributes (§3d.1), and the `checked:` Tailwind variants in `CustomColors` have rules in the built stylesheet.
- All 14 classes have rules in the built stylesheet.

Not settled here: whether selecting one radio clears its group-mates, which is the whole point of the component. Step 5.
