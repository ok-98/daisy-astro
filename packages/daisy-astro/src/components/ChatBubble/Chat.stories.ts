import Chat from './Chat.astro';
import ChatBubble from './ChatBubble.astro';
import ChatHeader from './ChatHeader.astro';
import ChatFooter from './ChatFooter.astro';
import Avatar from '../Avatar/Avatar.astro';

// One `Chat` per message — daisyUI has no chat-log class, and `.chat`'s own
// vertical padding is what separates them (plan §3e). The author image is an
// `Avatar` carrying `class="chat-image"`, not a component of its own (plan §0a).
//
// `placement` is required on every one of them (plan §3a).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const KENOBI = 'https://img.daisyui.com/images/profile/demo/kenobee@192.webp';
const ANAKIN = 'https://img.daisyui.com/images/profile/demo/anakeen@192.webp';

// `class` lands on `.avatar` where `chat-image` belongs; `innerClass` on the
// inner div where the sizing belongs — the split Avatar already makes (§3d).
const image = (src: string): Item => ({
  component: Avatar,
  props: { class: 'chat-image', innerClass: 'w-10 rounded-full' },
  slots: {
    default: `<img alt="Tailwind CSS chat bubble component" src="${src}" />`,
  },
});

const bubble = (text: string, props: Record<string, unknown> = {}): Item => ({
  component: ChatBubble,
  props,
  slots: { default: text },
});

const header = (name: string, time: string): Item => ({
  component: ChatHeader,
  slots: { default: `${name} <time class="text-xs opacity-50">${time}</time>` },
});

const footer = (text: string): Item => ({
  component: ChatFooter,
  props: { class: 'opacity-50' },
  slots: { default: text },
});

const message = (placement: 'start' | 'end', children: Item[]): Item => ({
  component: Chat,
  props: { placement },
  slots: { default: children },
});

export default {
  title: 'Components/Chat',
  component: Chat,
  argTypes: {
    placement: { control: 'radio', options: ['start', 'end'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: {
    placement: 'start',
    slots: {
      default: [
        image(KENOBI),
        header('Obi-Wan Kenobi', '12:45'),
        bubble('You were the Chosen One!'),
        footer('Delivered'),
      ],
    },
  },
};

// 1. chat-start and chat-end — the placement class is what builds the grid, so
// these two differ in every column assignment, not just in alignment (§3a).
export const StartAndEnd = {
  render: () => [
    message('start', [bubble("It's over Anakin, <br/>I have the high ground.")]),
    message('end', [bubble('You underestimate my power!')]),
  ],
};

// 2. With image — three messages from the same author. The avatar is
// `align-self: flex-end`, so it sits level with the bubble rather than the top
// of the message (§3d).
export const WithImage = {
  render: () =>
    [
      'It was said that you would, destroy the Sith, not join them.',
      'It was you who would bring balance to the Force',
      'Not leave it in Darkness',
    ].map((text) => message('start', [image(KENOBI), bubble(text)])),
};

// 3. With image, header and footer — all four parts, on both sides. This is the
// grid check: header and footer belong in the **text** column, not under the
// avatar, and that is exactly what silently breaks without a placement (§3a).
export const WithImageHeaderAndFooter = {
  render: () => [
    message('start', [
      image(KENOBI),
      header('Obi-Wan Kenobi', '12:45'),
      bubble('You were the Chosen One!'),
      footer('Delivered'),
    ]),
    message('end', [
      image(ANAKIN),
      header('Anakin', '12:46'),
      bubble('I hate you!'),
      footer('Seen at 12:46'),
    ]),
  ],
};

// 4. With header and footer, no image — with only one column in use, the second
// grid column is simply empty.
export const WithHeaderAndFooter = {
  render: () => [
    message('start', [
      header('Obi-Wan Kenobi', '2 hours ago'),
      bubble('You were my brother, Anakin.'),
      footer('Seen'),
    ]),
    message('start', [
      header('Obi-Wan Kenobi', '2 hour ago'),
      bubble('I loved you.'),
      footer('Delivered'),
    ]),
  ],
};

// Regression guard, at two levels: native attributes and caller `class` survive
// on the message and on the parts inside it.
export const Passthrough = {
  args: {
    placement: 'end',
    id: 'msg-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: {
      default: [
        {
          component: ChatHeader,
          props: { id: 'header-1', 'data-test': 'header', class: 'header-marker' },
          slots: { default: 'Passthrough' },
        },
        {
          component: ChatBubble,
          props: { color: 'primary', id: 'bubble-1', 'data-test': 'bubble', class: 'bubble-marker' },
          slots: { default: 'forwarded' },
        },
        {
          component: ChatFooter,
          props: { id: 'footer-1', 'data-test': 'footer', class: 'footer-marker opacity-50' },
          slots: { default: 'Delivered' },
        },
      ],
    },
  },
};
