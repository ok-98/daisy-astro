# Avatar Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/avatar/
**Root element:** `div` (both `Avatar` and `AvatarGroup`)
**Target files:** `packages/daisy-astro/src/components/Avatar/Avatar.astro`, `packages/daisy-astro/src/components/Avatar/AvatarGroup.astro` (`Avatar.astro` is currently a dummy scaffold; `AvatarGroup.astro` does not exist yet)
**Story files:** `packages/daisy-astro/src/components/Avatar/Avatar.stories.ts`, `packages/daisy-astro/src/components/Avatar/AvatarGroup.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — import, don't redeclare. **Avatar uses none of them** (see §1).
- Stories run on `@storybook-astro/framework`: import the `.astro` file as `component`, pass slot content via `args.slots`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** Planned. Nothing in §4 is implemented. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/avatar.css`), the doc page source (`packages/docs/src/routes/(routes)/components/avatar/+page.md` in `saadeghi/daisyui`), and `astro@7.2.4`'s `astro-jsx.d.ts`. §3e lists what is **unverified**.

---

## 0. Why this component is two files, and why it has an inner `div`

Two things about `avatar.css` shape everything below **[verified — the whole unprefixed rule set is only these six rules]**:

```css
.avatar              { display:inline-flex; position:relative; vertical-align:middle; align-self:center }
.avatar > div        { aspect-ratio:1; display:block; overflow:hidden }
.avatar img          { object-fit:cover; width:100%; height:100% }
.avatar-placeholder > div { display:flex; align-items:center; justify-content:center }
.avatar-group        { display:flex; overflow:hidden }
.avatar-group .avatar{ border:4px solid var(--color-base-100); border-radius:3.40282e38px; overflow:hidden }
```

1. **The inner `div` is mandatory, unnamed, and is where all the styling goes.** `.avatar > div` is a child selector, and every doc example puts the width, the rounding, the mask and the ring on that div (`w-24 rounded-full`, `mask mask-heart`, `ring-2 ring-primary`). The root `.avatar` carries only positioning and the three modifier classes. A component that renders just `div.avatar` and makes the caller supply the inner div would push required boilerplate to every call site; a component that renders it must then give the caller a way to class it — see §3a.
2. **`avatar-group` is a container class with a descendant rule.** It belongs to the same doc page, so per `plans/README.md` §3b it is a sub-component living in `src/components/Avatar/`, not its own directory and not its own checklist row.

| File | Renders | Owns |
|---|---|---|
| `Avatar.astro` | `div.avatar > div > <slot />` | all three modifiers from §1, plus the inner div |
| `AvatarGroup.astro` | `div.avatar-group` | the group container only |

## 1. Variant audit

Every class in `avatar.css`, cross-checked against the doc page's `classnames` frontmatter. **5 classes: 2 component + 3 modifier.** `grep -oE '\.avatar[a-z-]*' avatar.css | sort -u` returns exactly `.avatar .avatar-group .avatar-offline .avatar-online .avatar-placeholder` **[verified]**. All 5 are covered. (`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies also ship **[verified]** — caller-side responsive classes, not props; same reasoning as `plans/components/alert.md` §3c.)

### `Avatar`

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `avatar` | — | — | Always applied to the root. |
| Presence | `avatar-online` `avatar-offline` | `presence` | `'online' \| 'offline'` | Mutually exclusive (identical `:before` rules, different colour) → union, not two booleans. Component-specific, stays local. Accessibility caveat in §3c. |
| Placeholder | `avatar-placeholder` | `placeholder` | `boolean` | Centres the inner content, for letter avatars. Orthogonal to `presence` — the doc page combines `avatar-online avatar-placeholder` on one element. Prop name is safe: `placeholder` is declared only on `InputHTMLAttributes` (`astro-jsx.d.ts:843`) and `TextareaHTMLAttributes` (`:1053`), **not** on base `HTMLAttributes` **[verified]**, so nothing is stolen from `...rest` on a `div` root. |

### `AvatarGroup`

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `avatar-group` | — | — | Always applied. No modifiers exist for it. |

**No colour axis, no size axis, no shape axis.** There is no `avatar-lg`, no `avatar-primary`, no `avatar-circle` **[verified]**. Size, rounding, mask and ring are all plain Tailwind/daisyUI utilities the caller puts on the inner div — see §3a and §3b. Do not invent a `size` prop.

## 2. Slots

### `Avatar`

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | `div` (the mandatory inner div, §0) | no | `<img src=… alt=…>`, or `<span>D</span>` for a placeholder |

Single default slot, no `Astro.slots.has()` gating — the inner div is required by the CSS in every example, not an optional styled wrapper.

No `src`/`alt`/`initials` content props. The default slot takes the `<img>` (or the `<span>` of letters) exactly as daisyUI's examples show, per `plans/README.md` §5. This also keeps `loading="lazy"`, `srcset`, `decoding` and friends in the caller's hands without this component re-declaring any of them.

### `AvatarGroup`

Single default slot holding the `Avatar`s. No gating.

## 3. Five things the naive implementation gets wrong

### 3a. `class` lands on the root, but everything worth styling is on the inner div

This is the design decision of the component. In every doc example the root `.avatar` gets nothing but modifier classes, while the inner div gets `w-24`, `rounded-full`, `mask mask-heart`, `ring-2 ring-primary ring-offset-2`. Since the component renders that div, the caller needs a way to reach it.

Rejected alternatives, both worse:

- **Make `class` target the inner div.** Then `class` and `...rest` (`id`, `data-*`, `style`) land on *different* elements, which is surprising, inconsistent with every other component in this library, and quietly breaks the parent-scoped-styles behaviour `plans/README.md` §6 relies on.
- **Drop the inner div and let the caller pass it in the slot.** Restores daisyUI's exact markup but makes every single call site repeat `<div class="w-24 rounded-full">`, which is the boilerplate this library exists to remove.

**So: `class` keeps merging onto the root (library convention, `...rest` goes there too), and a second `innerClass` prop targets the inner div.** Two class props is unusual and needs the JSDoc to say plainly which is which; it is the honest shape for a component whose CSS mandates two elements.

**`innerClass` is effectively required.** daisyUI gives the inner div `aspect-ratio:1` and no width **[verified]**, so an `<Avatar>` with no `innerClass` has no sizing at all — see §3e.1 for what that actually renders and the decision it feeds.

### 3b. There is no rounding by default — except inside a group, where rounding is forced

`.avatar > div` sets `overflow:hidden` but **no `border-radius`** **[verified]**. The circular avatar everyone pictures comes from the caller's `rounded-full`. An `<Avatar innerClass="w-24">` is a square. That is daisyUI's behaviour and the component must not "helpfully" default to `rounded-full` — the doc page's second example is deliberately `rounded-xl`, and the mask examples need no radius at all.

Inside a group the opposite applies: `.avatar-group .avatar { border-radius: 3.40282e38px; border: 4px solid var(--color-base-100); overflow:hidden }` **[verified]** forces every member to a bordered circle regardless of its own `innerClass`. So `innerClass="rounded-xl"` silently does nothing inside an `AvatarGroup`. Document it on `AvatarGroup`; it is otherwise a confusing non-effect.

### 3c. The presence dot is decoration with no accessible name

`avatar-online` / `avatar-offline` render a coloured `:before` pseudo-element **[verified]** — no text, no ARIA, and green-vs-grey is the only difference between the two states. A screen reader user gets nothing, and a colour-blind user gets very little.

The component does **not** invent a fix (no injected `<span class="sr-only">`, no `aria-label` default) — that is content this library would be making up, and `plans/README.md` §5 keeps content in the caller's hands. What it does do is say so in `presence`'s JSDoc and show the remedy in the story:

```astro
<Avatar presence="online" aria-label="Gordon, online">…</Avatar>
```

Flagged rather than fixed, deliberately. If a later decision is to inject an `sr-only` span, it belongs in a plan revision, not in a silent implementation choice.

### 3d. `-space-x-6` is not part of `avatar-group`

`.avatar-group` is only `display:flex; overflow:hidden` **[verified]**. The overlap in every doc example comes from `-space-x-6`, a plain Tailwind utility on the same element. Without it the group renders as a plain non-overlapping row with 4px borders — which looks like a broken group rather than an unstyled one.

Not defaulted into the component: it is caller styling daisyUI keeps outside the class, and hardcoding a specific negative margin would make the sensible variations (`-space-x-3` for small avatars) fight the component. Same call as `join` in `plans/components/accordion.md` §3c — the doc examples are reproduced faithfully in the stories, and `AvatarGroup`'s JSDoc names the class.

### 3e. Unverified assumptions

1. **What an `<Avatar>` with no width class actually renders.** `.avatar` is `inline-flex` (shrink-to-fit) and `.avatar > div` is `display:block` with `aspect-ratio:1` and `width:auto`, while `.avatar img` is `width:100%; height:100%` **[all verified]** — the resolved size is a genuine question, not something to reason out from the cascade. Render it in Step 3 and decide from the result:
   - collapses to zero / invisible → make `innerClass` **required** (`innerClass: string`), since an invisible component with no error is exactly the failure these plans exist to prevent;
   - falls back to the image's intrinsic size → keep it optional and document.
   This is the only decision in this plan left open on purpose.
2. **Slot sanitization vs `<img>`.** Every non-placeholder example is an `<img>` with a remote `src`; the framework sanitizes slot HTML with conservative defaults (`plans/README.md` §4). A stripped `<img>` leaves an empty sized box, which reads as a broken image rather than a stripped element. Also confirm the doc page's `img.daisyui.com` URLs load in the Storybook sandbox at all — if they don't, use a local placeholder and say why in a comment.

**Not a risk here, unlike its neighbours:** an extra wrapper element around the slot content would be harmless. `.avatar img` and `.avatar-group .avatar` are **descendant** selectors **[verified]**, and the two child selectors (`.avatar > div`, `.avatar-placeholder > div`) target the div this component renders itself. So the blocking unknown in `plans/components/aura.md` §3e.1 and `plans/components/alert.md` §3d.2 does not apply to Avatar — do not copy that language into this component's checks.

## 4. Component implementation

### `Avatar.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type AvatarPresence = 'online' | 'offline';

interface Props extends HTMLAttributes<'div'> {
  /**
   * Shows a coloured presence dot. Decoration only: it has no accessible
   * name, so pass your own `aria-label` when the state carries meaning
   * (plan §3c).
   */
  presence?: AvatarPresence;
  /** Centres the inner content, for letter avatars (`<span>AI</span>`). */
  placeholder?: boolean;
  /**
   * Classes for the **inner** div — where daisyUI's own examples put the
   * size, rounding, mask and ring (`"w-24 rounded-full"`). `class` goes to
   * the root instead, alongside every other native attribute (plan §3a).
   * daisyUI supplies no width and no border-radius of its own (plan §3b).
   */
  innerClass?: string;
}

// Full literal class names. NEVER `avatar-${presence}` — an interpolated
// class gets no CSS from daisyUI (plans/README.md §1b).
const PRESENCE: Record<AvatarPresence, string> = {
  online: 'avatar-online',
  offline: 'avatar-offline',
};

const { presence, placeholder = false, innerClass, class: className, ...rest } = Astro.props;
---

<div
  class:list={[
    'avatar',
    presence && PRESENCE[presence],
    { 'avatar-placeholder': placeholder },
    className,
  ]}
  {...rest}
>
  <!-- Required by `.avatar > div` and `.avatar-placeholder > div` (plan §0). -->
  <div class:list={[innerClass]}>
    <slot />
  </div>
</div>
```

No `<script>`: pure CSS.

Not polymorphic: daisyUI documents `avatar` on a wrapper `div` only, so no `as` prop.

### `AvatarGroup.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<!--
  daisyUI's own examples pair this with `-space-x-6` for the overlap; that is
  caller styling, not part of `avatar-group` (plan §3d). Members are forced to
  a bordered circle by `.avatar-group .avatar`, so a member's own rounding in
  `innerClass` has no effect here (plan §3b).
-->
<div class:list={['avatar-group', className]} {...rest}>
  <slot />
</div>
```

Deliberately thin, for the same reason as `Accordion.astro` in `plans/components/accordion.md` §4: daisyUI defines one class and no modifiers, so anything more would be markup this library invented.

### Astro idioms gate

- [ ] Content arrives via the default slot — no `src`/`alt`/`initials` props (§2).
- [ ] The inner div is rendered by the component and the slot sits inside it (§0).
- [ ] No `Astro.slots.has()` gating needed (no optional styled wrapper).
- [ ] Root element is `div` for both files, matching every doc example.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root element in both files.
- [ ] No `as` prop.
- [ ] No variant prop collides with a native attribute: `placeholder` is absent from base `HTMLAttributes` **[verified]**; `presence` and `innerClass` are not HTML attributes at all.
- [ ] `innerClass` documented as targeting the inner div, and `class` as targeting the root (§3a).
- [ ] Every variant class is a full literal in a `Record` map or an object key — no `` `avatar-${presence}` `` anywhere.
- [ ] Not generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the component correctly *and* incorrectly (§5c):
  ```astro
  <Avatar innerClass="w-24 rounded-full"><img src="/a.webp" alt="A" /></Avatar>
  <Avatar presence="online" placeholder innerClass="w-16" aria-label="AI, online">ok</Avatar>
  <Avatar id="x" data-test="y" class="mx-2">ok</Avatar>
  <Avatar presence="away">must error — not a presence value</Avatar>
  <Avatar size="lg">must error — no size axis (§1)</Avatar>
  <Avatar color="primary">must error — no colour axis (§1)</Avatar>
  ```
  If §3e.1 resolves to "required", add `<Avatar>must error — innerClass required</Avatar>`.
- [ ] `astro check` passes.

## 5. Storybook stories

Two files, split the way `plans/components/accordion.md` §5 splits Accordion: `Avatar.stories.ts` is props-driven, `AvatarGroup.stories.ts` needs several members at once.

Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | File | Props / slots |
|---|---|---|---|
| Avatar | `Default` | `Avatar` | `innerClass: 'w-24 rounded'`, `<img>` |
| Avatar in custom sizes | `CustomSizes` | `Avatar` | four avatars, `w-32` / `w-20` / `w-16` / `w-8`, each `rounded` |
| Avatar rounded | `Rounded` | `Avatar` | two avatars, `rounded-xl` and `rounded-full` |
| Avatar with mask | `WithMask` | `Avatar` | three avatars, `mask mask-heart` / `mask mask-squircle` / `mask mask-hexagon-2`, all `w-24` |
| Avatar with ring | `WithRing` | `Avatar` | `innerClass: 'w-24 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2'` |
| Avatar with presence indicator | `PresenceIndicator` | `Avatar` | two avatars, `presence: 'online'` and `presence: 'offline'`, `w-24 rounded-full` |
| Avatar placeholder | `Placeholder` | `Avatar` | four avatars, `placeholder`, `bg-neutral text-neutral-content rounded-full` at `w-24`/`w-16`/`w-12`/`w-8`, `<span>` letters; the `w-16` one also `presence: 'online'` |
| Avatar group | `Default` | `AvatarGroup` | `class: '-space-x-6'`, four `Avatar`s at `w-12` |
| Avatar group with counter | `WithCounter` | `AvatarGroup` | as above, last member `placeholder` with `<span>+99</span>` |

Plus `Playground` and `Passthrough` (Step 6) in `Avatar.stories.ts`. The presence axis is covered by `PresenceIndicator` and the placeholder boolean by `Placeholder`, so no extra axis stories are needed.

One story beyond the doc page: **`PresenceAccessibleName`** — two `presence="online"` avatars, one bare and one with `aria-label="Gordon, online"`, so §3c's caveat is visible in the DOM rather than only in a comment.

Group members are raw HTML strings rather than nested `Avatar` components, per `plans/components/accordion.md` §3d.1 (component-with-props slot content is still unverified) — and copying the page's markup is what makes the story a direct visual diff (§8). Switch to components if that unknown resolves in favour.

```ts
import Avatar from './Avatar.astro';

const IMG = 'https://img.daisyui.com/images/profile/demo/batperson@192.webp';
const img = (src = IMG) => `<img src="${src}" alt="Tailwind-CSS-Avatar-component" />`;

export default {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {
    presence: { control: 'select', options: [undefined, 'online', 'offline'] },
    placeholder: { control: 'boolean' },
    innerClass: { control: 'text' },
  },
};

export const Playground = {
  args: { innerClass: 'w-24 rounded-full', slots: { default: img() } },
};

export const Default = {
  args: { innerClass: 'w-24 rounded', slots: { default: img() } },
};

// Regression guard: native attributes survive on the ROOT, caller `class`
// merges there, and `innerClass` reaches the inner div — the §3a split,
// checked rather than assumed.
export const Passthrough = {
  args: {
    id: 'avatar-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    innerClass: 'w-24 rounded-full inner-marker',
    slots: { default: img() },
  },
};
```

Stories rendering several avatars at once (`CustomSizes`, `Rounded`, `WithMask`, `Placeholder`) compose multiples the way the framework's docs recommend — check that before inventing a helper.

## 6. Steps

- [ ] **Step 1:** Nothing to re-read — §1 and §2 are filled from the doc page and the shipped CSS. Confirm the doc page's `img.daisyui.com` URLs load in the Storybook sandbox (§3e.2); if not, pick a local placeholder image now, since every story uses one.
- [ ] **Step 2:** No new shared unions — `AvatarPresence` stays local, no colour or size axis (§1). `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the `Avatar.astro` dummy scaffold and create `AvatarGroup.astro` per §4, then walk the Astro idioms gate. **Resolve §3e.1 here** — render an `<Avatar>` with no `innerClass` and decide required-vs-optional from what it does; record the answer in this plan.
- [ ] **Step 4:** Replace `Avatar.stories.ts` and create `AvatarGroup.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Avatar` and `Components/AvatarGroup`, verify:
  - `Playground` renders and every control changes the markup, `innerClass` included.
  - `Default` is a **square with small rounding** — not a circle (§3b). If it comes out circular, something is defaulting rounding that shouldn't.
  - `CustomSizes` shows four distinct sizes, driven entirely by `innerClass`.
  - `WithMask` shows heart / squircle / hexagon silhouettes, proving the mask classes reach the inner div.
  - `PresenceIndicator`: green dot vs grey dot, both top-right.
  - `Placeholder`: letters are centred (that is the only thing `avatar-placeholder` does), and the `w-16` one also shows the online dot — the two modifiers combine.
  - `AvatarGroup/Default`: members overlap and each has a 4px base-100 border.
  - `AvatarGroup` forces circles: temporarily set a member's `innerClass` to `rounded-none` and confirm it stays round (§3b).
- [ ] **Step 6:** Confirm forwarding via `Passthrough` — `id`, `data-*`, `style` and `class` land on `div.avatar`, and `inner-marker` lands on the inner div, **not** the other way round. Headless check:
  ```bash
  pnpm build-storybook
  grep -rhoE '<div class="avatar[^"]*"[^>]*><div[^>]*>' storybook-static/astro-prerendered-stories.json | head
  ```
- [ ] **Step 7:** Update the `Avatar` row in `plans/README.md` to **Implemented**, noting `AvatarGroup` as part of it rather than a separate row (same convention as Accordion/AccordionItem).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 5 daisyUI classes from §1 are reachable: `avatar` always, `avatar-online`/`avatar-offline` via `presence`, `avatar-placeholder` via `placeholder`, `avatar-group` via `AvatarGroup`.
- [ ] No invented axis — no `size`, no `color`, no `shape`, no default rounding (§3b).
- [ ] `Props` extends `HTMLAttributes<'div'>` in both files; non-variant native attributes work without explicit declaration.
- [ ] `class` merges onto the root and `innerClass` onto the inner div — verified in rendered HTML, in that direction (§3a).
- [ ] The inner div is always rendered, so `.avatar > div` and `.avatar-placeholder > div` match.
- [ ] §3e.1 resolved, and `innerClass` is required or optional as that result dictates — with the reason recorded here.
- [ ] `presence`'s JSDoc names the missing accessible name, and `PresenceAccessibleName` demonstrates the remedy (§3c).
- [ ] `AvatarGroup`'s JSDoc names `-space-x-6` (§3d) and the forced-circle behaviour (§3b).
- [ ] `Playground` exposes every prop as a control.
- [ ] One story per doc-page example, reproducing that example's markup and copy.
- [ ] Every box in §4's Astro idioms gate ticked.
