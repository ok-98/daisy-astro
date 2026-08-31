# Chat Bubble Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/chat/ (docs path is `chat`; this repo's slug is `chat-bubble`)
**Root element:** `div` (all four components)
**Target files:** `packages/daisy-astro/src/components/ChatBubble/Chat.astro`, `ChatBubble.astro`, `ChatHeader.astro`, `ChatFooter.astro` — see §0b for the naming
**Story files:** `Chat.stories.ts` (+ short files per sub-component, §5)

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Chat uses `DaisyColor`, not `DaisySize`** (§1).
- Stories run on `@storybook-astro/framework`: import the `.astro` file as `component`, pass slot content via `args.slots`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** Planned. Nothing in §4 is implemented. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/chat.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/chat/+page.md` in `saadeghi/daisyui`). §3f lists what is **unverified**.


> **Status:** **Implemented** (2026-08-31). Four components, no `ChatImage`, and 10 stories in two files rather than §5's four (§3h). §3f.1 is answered — 22 of 22 messages hold their parts directly (§8) — and §3f.2 and §3f.4 with it. **§4's listings ship an HTML comment into every message and are corrected in §3g.** Step 5 (visual pass) is open, and it carries the tail, which is the whole component.
---

## 0. Structure

`.chat` is a **two-column, three-row CSS grid**, and every part is placed into it by explicit row/column rules **[verified]**:

```css
.chat        { display:grid; grid-auto-rows:min-content; column-gap:.75rem; padding-block:.25rem;
               --mask-chat: url("data:image/svg+xml,…") }
.chat-header { grid-row-start:1; display:flex; gap:.25rem; font-size:.6875rem }
.chat-bubble { grid-row-end:3; width:fit-content; min-width:2.5rem; max-width:90%; min-height:2rem;
               padding:.5rem 1rem; border-radius:var(--radius-field);
               background-color:var(--color-base-300); color:var(--color-base-content) }
.chat-footer { grid-row-start:3; display:flex; gap:.25rem; font-size:.6875rem }
.chat-image  { grid-row:span 2/span 2; align-self:flex-end }
.chat-bubble:before { content:""; width:.75rem; height:.75rem; position:absolute; bottom:0;
                      background-color:inherit; mask-image:var(--mask-chat); … }

.chat-start { grid-template-columns:auto 1fr; place-items:start }
.chat-start .chat-image  { grid-column-start:1 }
.chat-start .chat-header, .chat-start .chat-footer { grid-column-start:2 }
.chat-start .chat-bubble { grid-column-start:2; border-end-start-radius:0; &:before { inset-inline-start:-.75rem } }

.chat-end   { grid-template-columns:1fr auto; place-items:end }
.chat-end .chat-image  { grid-column-start:2 }
.chat-end .chat-header, .chat-end .chat-footer { grid-column-start:1 }
.chat-end .chat-bubble { grid-column-start:1; border-end-end-radius:0; &:before { inset-inline-start:100% } }
```

Everything interesting follows from that: the placement class is not decoration but the thing that defines the grid (§3a), and the bubble's tail is a masked pseudo-element whose mask lives on the **container** (§3b).

### 0a. Which parts become components

The library now has four ways of handling a daisyUI part, and this component uses three of them. Worth stating the rule once, since it has been decided ad hoc four times:

| Treatment | When | Precedent |
|---|---|---|
| Sub-component | the part has its own class and its own variants, or the caller nests arbitrary markup in it | `CardBody`, `AccordionItem` |
| Named slot on the parent | the part is an optional wrapper the parent always positions the same way | `BrowserMockup`'s `toolbar` |
| Bare element, no wrapper | daisyUI styles an element, not a class | Card's `<figure>` |
| Compose an existing component | the part class is only ever used **on** another daisyUI component | **`chat-image`**, below |

So:

| Part class | Treatment | File |
|---|---|---|
| `chat-bubble` | sub-component — owns all 8 colours | `ChatBubble.astro` |
| `chat-header` | sub-component | `ChatHeader.astro` |
| `chat-footer` | sub-component | `ChatFooter.astro` |
| `chat-image` | **compose `Avatar`** — no file | — |

`chat-image` appears in the doc page only ever as `class="chat-image avatar"` wrapping `<div class="w-10 rounded-full"><img></div>` **[verified in all three examples]**, which is exactly what `plans/components/avatar.md` already builds:

```astro
<Avatar class="chat-image" innerClass="w-10 rounded-full">
  <img src="…" alt="Obi-Wan Kenobi" />
</Avatar>
```

A `ChatImage.astro` would be a one-class wrapper that every call site immediately has to combine with `Avatar` anyway. The class stays reachable through `class`, and the composition is documented in `Chat`'s JSDoc and shown in every image story. Ponytail rung 2: reuse what already exists.

### 0b. Naming — the directory says "ChatBubble", the container class says "chat"

daisyUI calls the whole component "Chat bubble" (docs path `chat`, CSS file `chat.css`, container class `chat`) and *also* has a `chat-bubble` part inside it. This repo's checklist row and slug are `chat-bubble`, and the scaffold directory is `ChatBubble/`.

**Decision: keep the directory `ChatBubble/` and name the files after the classes.** So `ChatBubble/Chat.astro` is the container and `ChatBubble/ChatBubble.astro` is the bubble. The directory is named for the daisyUI component (`plans/README.md` §3b), the files for the classes they render — the same divergence `plans/components/browser-mockup.md` §0 already documents for `BrowserMockup`/`mockup-browser`, and renaming the directory would churn the checklist for no gain.

**The existing scaffold is mis-assigned**: `ChatBubble.astro` currently renders `.chat`, i.e. the container. In Step 3 it becomes `Chat.astro`, and a new `ChatBubble.astro` renders `.chat-bubble`.

## 1. Variant audit

**15 classes: 1 component + 4 part + 2 placement + 8 colour**, matching the doc page's `classnames` frontmatter exactly. `grep -oE '\.chat[a-z0-9-]*' chat.css | sort -u` returns exactly those 15 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `chat` | — | — | `Chat` | Always applied. |
| Part | `chat-bubble` | — | — | `ChatBubble` | Always applied. |
| Part | `chat-header` | — | — | `ChatHeader` | Always applied. |
| Part | `chat-footer` | — | — | `ChatFooter` | Always applied. |
| Part | `chat-image` | — | — | — | Composed via `Avatar` (§0a). |
| Placement | `chat-start` `chat-end` | `placement` | `'start' \| 'end'` — **required** | `Chat` | Mutually exclusive → union. daisyUI's own frontmatter marks both "(required)" — §3a. |
| Colour | `chat-bubble-neutral` `-primary` `-secondary` `-accent` `-info` `-success` `-warning` `-error` | `color` | `DaisyColor` | **`ChatBubble`** | The 8 values match `DaisyColor` exactly — import it. Goes on the **bubble**, not the container — §3c. |

**No size axis and no style axis** — none exists **[verified]**. Font sizes on header/footer are fixed at `.6875rem` by daisyUI; the doc page's `text-xs opacity-50` on `<time>` and `opacity-50` on the footer are plain Tailwind from the caller.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]** — caller-side responsive classes, the library's standing answer, see `plans/components/card.md` §3e.)

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Chat` | `default` | none — direct children of `.chat` | no | `Avatar class="chat-image"`, `ChatHeader`, `ChatBubble`, `ChatFooter`, in any subset |
| `ChatBubble` | `default` | none | no | the message text, `<br />` included |
| `ChatHeader` | `default` | none | no | a name plus `<time class="text-xs opacity-50">` |
| `ChatFooter` | `default` | none | no | `Delivered` / `Seen at 12:46` |

Plain default slots throughout, no named slots, no `Astro.slots.has()` gating.

**Why not named slots on `Chat`** (`image`/`header`/`bubble`/`footer`): they would work here — unlike `plans/components/card.md` §0a, the grid places parts by CSS rather than by DOM order, so a fixed render order is harmless. They are still not used, for two reasons: the parts are individually optional in four different combinations across the doc examples, so four gated slots is more machinery than four components; and `chat-image` is an `Avatar`, which a named slot would have to accept as raw markup anyway. Composition keeps `Chat` at zero conditional logic.

No `message`/`author`/`time` content props: content comes in through slots (`plans/README.md` §5).

## 3. Six things the naive implementation gets wrong

### 3a. `placement` is required, not optional

daisyUI's own `classnames` frontmatter says "Aligns chat to start horizontally **(required)**" for both `chat-start` and `chat-end`, and the CSS explains why: **`grid-template-columns` and every `grid-column-start` live on those two classes** **[verified]**, not on `.chat`.

Omit it and `.chat` is a single-column grid with no column assignments. The header, bubble and footer still land on rows 1/2/3, but the image — `grid-row: span 2 / span 2` — is auto-placed into the same column and overlaps them. There is no error and the bubble still looks like a bubble, so it reads as a styling glitch rather than a missing prop.

**So `placement` is a required prop with no default**, the same call `plans/components/accordion.md` §0a made for `name`. Not defaulting to `'start'`: a chat log where every message silently defaults to the left is a plausible-looking wrong answer, and being forced to state the side is one keystroke at a call site that always knows which side it wants.

### 3b. The bubble's tail is masked by a variable defined on the container

`.chat-bubble:before` draws the tail with `mask-image: var(--mask-chat)`, and `--mask-chat` is declared on **`.chat`** **[verified]**. The horizontal position of that pseudo-element (`inset-inline-start: -.75rem` or `100%`) comes from `.chat-start .chat-bubble:before` / `.chat-end .chat-bubble:before` **[verified]** — also container-scoped.

A `<ChatBubble>` used **outside** a `<Chat>` therefore has an unresolved `--mask-chat`, so `mask-image` is invalid at computed-value time and the mask is dropped — leaving an unmasked 12×12px square of the bubble's own background, positioned at the pseudo-element's static position rather than beside the bubble. A stray coloured block next to the message, with no error.

Nothing to fix in the component. It goes in `ChatBubble`'s JSDoc — "must be inside a `Chat`" — and `BubbleOutsideChat` (§5) makes it visible once so nobody debugs it twice.

### 3c. Colour goes on the bubble, not on the chat

The class is `chat-bubble-primary`, applied to `.chat-bubble` **[verified]**, so `color` is a **`ChatBubble`** prop. Putting it on `Chat` would emit `chat-bubble-primary` on the container, where no rule targets it — a class with no matching CSS, `plans/README.md` §1b's failure mode arriving through a misplaced prop. The bubble would stay `base-300` and the prop would do nothing.

Exactly the same shape as `plans/components/carousel.md` §3a's `snap`-on-container rule, in the opposite direction. The general check: **the prop belongs on whichever component's root the class is written on in daisyUI's markup** — not on whichever component feels like the owner of the concept.

`Chat` therefore has one prop (`placement`) and `ChatBubble` has one (`color`); `ChatHeader` and `ChatFooter` have none.

### 3d. `chat-image` is an `Avatar`, and the sizing lives on the Avatar's inner div

Per §0a there is no `ChatImage`. The doc markup maps onto the existing component exactly:

```html
<div class="chat-image avatar"><div class="w-10 rounded-full"><img …></div></div>
```
```astro
<Avatar class="chat-image" innerClass="w-10 rounded-full"><img … /></Avatar>
```

`class` lands on `.avatar` (which is where `chat-image` belongs) and `innerClass` on the inner div (which is where `w-10 rounded-full` belongs) — the split `plans/components/avatar.md` §3a set up, working as intended. Note that `.chat-image` is `align-self: flex-end` **[verified]**, so the avatar sits at the **bottom** of the two rows it spans, level with the bubble rather than the header.

This is the library's first cross-component composition, so it gets a line in `Chat`'s JSDoc rather than living only in a story.

### 3e. Consecutive chats are separate `.chat` elements

Every doc example that shows a conversation is **N sibling `.chat` divs**, one per message, each with its own placement **[verified]**. `.chat` has `padding-block: .25rem` **[verified]**, which is what spaces them; there is no `chat-log` or `chat-container` class in daisyUI.

So there is no `ChatLog` component and no `messages` array prop — a conversation is a loop at the call site over `<Chat placement={…}>`. The `w-full` wrapper the doc page's live previews use is docs-site layout, not part of the component (its own copy-paste HTML omits it).

### 3g. §4's explanatory comments are in the template, where they ship

**Found while implementing, 2026-08-31.** Both listings in §4 put their note
above the root element:

```astro
<!--
  Direct children only — every part is placed by `grid-row-start` …
-->
<div class:list={['chat', PLACEMENT[placement], className]} {...rest}>
```

An HTML comment in an Astro template is **output**, not source annotation — so
that paragraph would be emitted into the page once per message, and a
conversation of thirty messages would carry thirty copies of it. `Avatar` hit
this and says so in its own frontmatter (`plans/components/avatar.md` §3a); the
same fix applies here. Both notes moved into the component JSDoc, where they
also reach editors on hover.

Second, smaller: §4's gate lists
`<Chat placement="start" color="primary">` as a line that **must error**, and it
cannot — `color` is a native HTML attribute present on every component in this
library. That is the trap `plans/README.md` §5c already documents, and the
second plan in a row to walk into it after `plans/components/stat.md` §3g.1. The
other four probe lines all errored as intended, so §3a and §3c are still
proven; the misplaced-colour claim is proven by the CSS instead, since
`chat-bubble-primary` has no rule that matches a `.chat`.

### 3h. Two story files, not four

`ChatBubble` earns its own file: it owns the colour axis and the
outside-a-`Chat` hazard (§3b). `ChatHeader` and `ChatFooter` have **no props at
all** — a `Playground` with nothing to play with and a `Passthrough` that
duplicates what `Chat`'s own nested `Passthrough` already asserts through all
three parts at once (§8). Same call `plans/components/stat.md` §3g.2 made for
its six one-class parts, and the same one `Card.stories.ts` made against its
own §5.

### 3f. Unverified assumptions

1. **Does slot content land as direct children of `.chat`?** Blocking, for a third distinct reason. `.chat-start .chat-bubble` is a **descendant** selector so the classes would still match — but every part is positioned by `grid-row-start` / `grid-column-start` as a **direct grid child**. An injected wrapper becomes the sole grid item and all four parts stack inside it, losing every row and column assignment. Same shared question as `plans/components/aura.md` §3e.1 (child selector), `plans/components/carousel.md` §3g.1 (flex), `plans/components/breadcrumbs.md` §3f.1 (child selector) and `plans/components/alert.md` §3d.2 — five plans, one answer. Record it in all of them.
2. **Sub-components as slot content.** Every story composes `Chat` > `ChatHeader`/`ChatBubble`/`ChatFooter`/`Avatar`. Shared with `plans/components/card.md` §3f.4; raw HTML strings are the fallback.
3. **Do the doc page's `img.daisyui.com` URLs load in the Storybook sandbox?** Shared with `plans/components/avatar.md` §3e.2, `plans/components/card.md` §3f.3 and `plans/components/carousel.md` §3g.3.
4. **`<time>` inside `ChatHeader` through the sanitizer.** The header examples use `<time class="text-xs opacity-50">`, a less common element than the sanitizer's usual suspects (`plans/README.md` §4). If the timestamps lose their styling or their tag, that is why.

## 4. Component implementation

### `Chat.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type ChatPlacement = 'start' | 'end';

interface Props extends HTMLAttributes<'div'> {
  /**
   * **Required.** daisyUI puts `grid-template-columns` and every column
   * assignment on `chat-start` / `chat-end`; without one the grid collapses
   * and the avatar overlaps the message (plan §3a).
   */
  placement: ChatPlacement;
}

// Full literal class names. NEVER `chat-${placement}` — an interpolated class
// gets no CSS from daisyUI (plans/README.md §1b).
const PLACEMENT: Record<ChatPlacement, string> = {
  start: 'chat-start',
  end: 'chat-end',
};

const { placement, class: className, ...rest } = Astro.props;
---

<!--
  Direct children only — every part is placed by `grid-row-start` /
  `grid-column-start` as a grid item, so a wrapper would collapse the layout
  (plan §3f.1). The author image is an Avatar, not a component of its own:
  `<Avatar class="chat-image" innerClass="w-10 rounded-full">` (plan §3d).
  One `Chat` per message; there is no chat-log class (plan §3e).
-->
<div class:list={['chat', PLACEMENT[placement], className]} {...rest}>
  <slot />
</div>
```

### `ChatBubble.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor } from '../../lib/variants';

interface Props extends HTMLAttributes<'div'> {
  /** The colour class lives on the bubble, not on `Chat` (plan §3c). */
  color?: DaisyColor;
}

// Full literal class names. NEVER `chat-bubble-${color}` (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'chat-bubble-primary',
  secondary: 'chat-bubble-secondary',
  accent: 'chat-bubble-accent',
  neutral: 'chat-bubble-neutral',
  info: 'chat-bubble-info',
  success: 'chat-bubble-success',
  warning: 'chat-bubble-warning',
  error: 'chat-bubble-error',
};

const { color, class: className, ...rest } = Astro.props;
---

<!--
  Must be inside a `Chat`: the tail's mask (`--mask-chat`) and its position are
  defined on `.chat` / `.chat-start` / `.chat-end`. Outside one, the tail
  renders as an unmasked square (plan §3b).
-->
<div class:list={['chat-bubble', color && COLOR[color], className]} {...rest}>
  <slot />
</div>
```

### `ChatHeader.astro` / `ChatFooter.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['chat-header', className]} {...rest}>
  <slot />
</div>
```

…and the same with `chat-footer`. No props by design — they are a grid row assignment and a font size. The doc page's `opacity-50` on the footer is a caller class, not a prop.

No `<script>` anywhere: pure CSS, RTL included (`[dir=rtl] .chat-bubble:before { transform: rotateY(…) }` **[verified]**).

None of the four is polymorphic: daisyUI documents every one of these classes on a `div`.

### Astro idioms gate

- [ ] Content arrives via plain default slots in all four components — no `message`/`author`/`time` props (§2).
- [ ] `<slot />` has **no wrapper element** in any of them — `Chat`'s children are grid items (§3f.1).
- [ ] No `Astro.slots.has()` gating — nothing is optional (§2).
- [ ] Root is `div` in all four, matching every doc example.
- [ ] No `<script>` added — RTL is daisyUI's.
- [ ] `...rest` spread onto the root element in all four files.
- [ ] No `as` prop anywhere.
- [ ] `placement` is **required** on `Chat` with no default (§3a); `color` is on `ChatBubble`, not `Chat` (§3c).
- [ ] **No `ChatImage.astro`** — the JSDoc documents the `Avatar` composition instead (§0a, §3d).
- [ ] No variant prop collides with a native attribute: `placement` is not an HTML attribute; `color` shadows only the obsolete non-standard `color` attribute (`astro-jsx.d.ts:602`) **[verified]**, the tradeoff Button already accepted.
- [ ] Every variant class is a full literal in a `Record` map — no `` `chat-bubble-${color}` `` anywhere.
- [ ] None is generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the components correctly *and* incorrectly (§5c):
  ```astro
  <Chat placement="start"><ChatBubble>ok</ChatBubble></Chat>
  <Chat placement="end" id="m1" data-test="y"><ChatBubble color="primary">ok</ChatBubble></Chat>
  <Chat>must error — placement is required (§3a)</Chat>
  <Chat placement="left">must error — not a placement value</Chat>
  <Chat placement="start" color="primary">must error — colour is a ChatBubble prop (§3c)</Chat>
  <ChatBubble color="banana">must error — not a DaisyColor</ChatBubble>
  <ChatBubble size="lg">must error — no size axis (§1)</ChatBubble>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

`Chat.stories.ts` carries the doc examples (all of them are conversations). `ChatBubble.stories.ts` covers the colour axis and the outside-a-Chat hazard; `ChatHeader`/`ChatFooter` get a `Playground` + `Passthrough` each.

Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | File | Props / slots |
|---|---|---|---|
| chat-start and chat-end | `StartAndEnd` | `Chat` | two chats, `placement: 'start'` then `'end'`, bubble text only (the first has a `<br />`) |
| Chat with image | `WithImage` | `Chat` | three `start` chats, each `Avatar class="chat-image" innerClass="w-10 rounded-full"` + bubble |
| Chat with image, header and footer | `WithImageHeaderAndFooter` | `Chat` | a `start` and an `end` chat, each with all four parts; footers `class="opacity-50"` |
| Chat with header and footer | `WithHeaderAndFooter` | `Chat` | two `start` chats, no image |
| Chat Bubble with colors | `Colors` | `ChatBubble` | eight chats: four `start` (primary/secondary/accent/neutral) and four `end` (info/success/warning/error), matching the page's split |

Plus `Playground` and `Passthrough` in each file. The placement axis is covered by `StartAndEnd` and the colour axis by `Colors`, so no extra axis stories are needed.

Two stories beyond the doc page, each pinning a §3 hazard:

- **`BubbleOutsideChat`** (in `ChatBubble.stories.ts`) — a bare `ChatBubble` with no `Chat` around it, beside a correct one. Makes §3b's unmasked-square tail visible once.
- **`NoPlacement`** — **not** written, because §3a makes it a type error. Noted here so its absence reads as the point rather than an omission.

```ts
import Chat from './Chat.astro';

// One `Chat` per message — daisyUI has no chat-log class (plan §3e). The
// author image is an `Avatar` with `class="chat-image"`, not a component of
// its own (plan §0a).

const AVATAR = (src: string) =>
  `<div class="chat-image avatar"><div class="w-10 rounded-full"><img alt="Tailwind CSS chat bubble component" src="${src}" /></div></div>`;

const KENOBI = 'https://img.daisyui.com/images/profile/demo/kenobee@192.webp';
const ANAKIN = 'https://img.daisyui.com/images/profile/demo/anakeen@192.webp';

export default {
  title: 'Components/Chat',
  component: Chat,
  argTypes: {
    placement: { control: 'radio', options: ['start', 'end'] },
  },
};

export const Playground = {
  args: {
    placement: 'start',
    slots: {
      default: `${AVATAR(KENOBI)}
        <div class="chat-header">Obi-Wan Kenobi <time class="text-xs opacity-50">12:45</time></div>
        <div class="chat-bubble">You were the Chosen One!</div>
        <div class="chat-footer opacity-50">Delivered</div>`,
    },
  },
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  args: {
    placement: 'end',
    id: 'msg-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: { default: `<div class="chat-bubble">Passthrough</div>` },
  },
};
```

Whether the stories can use the sub-components and `Avatar` as components rather than raw HTML strings depends on §3f.2 — resolve once, apply to Card and Chat together.

## 6. Steps

- [x] **Step 1: done for §3f.1**, the shared question's fifth and strictest instance — here a wrapper would have become the sole grid item and stacked all four parts inside it. The build shows a `chat-*` or `avatar` part as the immediate first child in **22 of 22** messages. §3f.2 is discharged (every story composes the real components, `Avatar` included), §3f.4 too: `<time class="text-xs opacity-50">` survives intact, sanitization being off library-wide. §3f.3 stays with the other plans.
- [x] **Step 2: skipped as planned.** `color` reuses `DaisyColor`; `ChatPlacement` stays local; `variants.ts` untouched.
- [x] **Step 3: done, with §3g's correction.** The scaffold rendered `.chat` under the name `ChatBubble.astro` and became `Chat.astro`; `ChatBubble.astro`, `ChatHeader.astro`, `ChatFooter.astro` are new; **no `ChatImage.astro`** (§0a). Gate walked — four of five probe lines errored, the fifth being the one that cannot (§3g).
- [x] **Step 4: done, in two files rather than four** (§3h). `Chat.stories.ts` (6) and `ChatBubble.stories.ts` (4).
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and the tail is the component.** Verify: `StartAndEnd`'s first bubble is left-aligned with its **tail at the bottom-left**, the second right-aligned with its tail at the bottom-right; `WithImage`'s avatar sits **level with the bubble**, not the top of the message (§3d); `WithImageHeaderAndFooter` keeps header and footer in the **text** column rather than under the avatar — the §3a grid check; all eight `Colors` differ with readable foreground text; **`BubbleOutsideChat`'s bare bubble shows a stray square instead of a tail** (§3b); and an RTL canvas mirrors the tails with no code change.
- [x] **Step 6: done — forwarding confirmed at two levels.** `Chat`'s `Passthrough` renders `<div class="chat chat-end mine" id="msg-1" data-test="yes" style="letter-spacing:2px">` around a marked header, a marked coloured bubble and a marked footer. Full output in §8.
- [x] **Step 7: done — the `Chat bubble` row in `plans/README.md` says Implemented**, naming all four components and `Avatar` for `chat-image`.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 15 daisyUI classes from §1 are reachable: `chat` + placement on `Chat`, `chat-bubble` + 8 colours on `ChatBubble`, `chat-header`/`chat-footer` on their components, `chat-image` via `Avatar class="chat-image"` (§0a).
- [x] `placement` is **required** and has no default (§3a) — `<Chat>` with no placement is a type error.
- [x] `color` is a `ChatBubble` prop, not a `Chat` prop (§3c).
- [x] No invented axis — no `size`, no `messages` array, no `ChatLog` (§3e), no `ChatImage` (§0a).
- [x] Slot content renders as **direct children** of `.chat` — checked in the build output, not by eye (§3f.1).
- [x] `class` merges through `class:list` in all four components.
- [x] JSDoc states: `placement` is required and why (§3a), `ChatBubble` must live inside a `Chat` (§3b), the author image is an `Avatar` (§3d), and one `Chat` is one message (§3e).
- [x] `Playground` exposes every prop as a control in each file.
- [x] One story per doc-page example, reproducing that example's markup and copy, plus `BubbleOutsideChat`.
- [x] Every box in §4's Astro idioms gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31). `astro check`: 191 files, 0 errors, 0 warnings, 0 hints.

```
WithImageHeaderAndFooter → <div class="chat chat-start">
   <div class="avatar chat-image"><div class="w-10 rounded-full"><img alt="…" src="…kenobee@192.webp"/></div></div>
   <div class="chat-header">Obi-Wan Kenobi <time class="text-xs opacity-50">12:45</time></div>
   <div class="chat-bubble">You were the Chosen One!</div>
   <div class="chat-footer opacity-50">Delivered</div></div>
BubbleOutsideChat → …<div class="chat chat-start"><div class="chat-bubble chat-bubble-primary">Correct</div></div>
                     …<div class="chat-bubble chat-bubble-primary">Broken</div>
                        ↑ no .chat ancestor, so --mask-chat is undefined (§3b)
Passthrough → <div class="chat chat-end mine" id="msg-1" data-test="yes" style="letter-spacing:2px">
                <div class="chat-header header-marker" id="header-1" data-test="header">Passthrough</div>
                <div class="chat-bubble chat-bubble-primary bubble-marker" id="bubble-1" …>forwarded</div>
                <div class="chat-footer footer-marker opacity-50" id="footer-1" …>Delivered</div></div>
```

Counts across the 10 stories:

```
.chat messages   22  (15 start, 7 end)  → part as immediate first child  22
bubbles 23 (22 in a Chat + 1 deliberately outside) | headers 6 | footers 6
chat-image through Avatar 6
all 8 colours present: neutral secondary accent info warning error ×1, success ×2, primary ×5
```

What this settles:

- **§3f.1, the strictest of the five instances.** Every part is placed by its own `grid-row-start` / `grid-column-start` as a grid item, so one injected wrapper would have become the sole grid item and stacked header, bubble, footer and avatar inside it. 22 of 22 messages hold their first part directly.
- **§3f.4 is answered**: `<time class="text-xs opacity-50">` reaches the output with its tag and classes intact.
- **§0a's decision holds in the markup**: `<div class="avatar chat-image"><div class="w-10 rounded-full">` is daisyUI's own structure, produced by `Avatar` with `class` and `innerClass` doing exactly the split `plans/components/avatar.md` §3a set up. A `ChatImage.astro` would have wrapped nothing.
- **All 15 classes have rules in the built stylesheet**, and `--mask-chat` is declared on `.chat` there — which is what makes `BubbleOutsideChat` a real hazard rather than a hypothetical one.
- `StartAndEnd`'s first bubble keeps its `<br/>` as written.

Not settled here: the tail, its side, the avatar's baseline, and the RTL mirror. All Step 5 — CSS-only behaviour that the built HTML cannot show.
