---
description: A chat bubble lays out one message in a conversation, aligned left or right with an avatar, header and footer.
referenceUrl: https://daisyui.com/components/chat/
referenceLabel: View this component on daisyUI
---

`Chat` renders one message as a CSS grid, with up to four parts placed into it: an avatar, a header, a
bubble, and a footer. Each message is its own `Chat` — daisyUI has no "chat log" class, so a
conversation is just a loop over `Chat`s at the call site.

## Props

### `Chat`

| Prop | Type | Notes |
|---|---|---|
| `placement` | `'start' \| 'end'` — **required** | Which side the message aligns to. daisyUI puts the grid's column layout on this class, so there's no default — omitting it collapses the layout. |

### `ChatBubble`

| Prop | Type | Notes |
|---|---|---|
| `color` | `DaisyColor` | The colour class lives on the bubble, not on `Chat`. |

`ChatHeader` and `ChatFooter` take no variant props — just native attributes.

## Composing a message

```astro
<Chat placement="start">
  <Avatar class="chat-image" innerClass="w-10 rounded-full">
    <img src="/kenobi.webp" alt="Obi-Wan Kenobi" />
  </Avatar>
  <ChatHeader>Obi-Wan Kenobi <time class="text-xs opacity-50">12:45</time></ChatHeader>
  <ChatBubble color="primary">You were the Chosen One!</ChatBubble>
  <ChatFooter class="opacity-50">Delivered</ChatFooter>
</Chat>
```

## The avatar is an `Avatar`, not its own component

daisyUI's `chat-image` class only ever wraps the same markup `Avatar` already renders, so there's no
separate `ChatImage`. Reuse `Avatar` with `class="chat-image"` and size the picture through
`innerClass`, exactly as above.

## `ChatBubble` needs a `Chat` around it

The bubble's speech-tail is drawn with a mask defined on `Chat` itself (`--mask-chat`), and its position
comes from `Chat`'s `placement`. A `ChatBubble` rendered outside a `Chat` loses the mask entirely and
shows a small unmasked square instead of a tail — always nest it inside a `Chat`.
