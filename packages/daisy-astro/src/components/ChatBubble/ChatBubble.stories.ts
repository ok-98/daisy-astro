import Chat from './Chat.astro';
import ChatBubble from './ChatBubble.astro';

// The colour class is `chat-bubble-*` and lives on the bubble — on the `Chat`
// it would match no rule at all (plan §3c).
//
// Every bubble here is wrapped in a `Chat`, except in `BubbleOutsideChat`,
// which is the point of that story (plan §3b).

const inChat = (placement: 'start' | 'end', props: Record<string, unknown>, text: string) => ({
  component: Chat,
  props: { placement },
  slots: { default: { component: ChatBubble, props, slots: { default: text } } },
});

export default {
  title: 'Components/ChatBubble',
  component: ChatBubble,
  argTypes: {
    color: {
      control: 'select',
      options: [undefined, 'neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'],
    },
    class: { control: 'text' },
  },
};

// A bubble on its own has no tail and no placement, so the Playground wraps it
// the way every real call site has to.
export const Playground = {
  render: (args: Record<string, unknown>) => [inChat('start', args, 'What kind of nonsense is this')],
  args: { color: 'primary' },
};

// 5. Chat bubble with colors — the doc page's own split, four on each side.
export const Colors = {
  render: () => [
    inChat('start', { color: 'primary' }, 'What kind of nonsense is this'),
    inChat('start', { color: 'secondary' }, 'Put me on the Council and not make me a Master!??'),
    inChat('start', { color: 'accent' }, "That's never been done in the history of the Jedi."),
    inChat('start', { color: 'neutral' }, "It's insulting!"),
    inChat('end', { color: 'info' }, 'Calm down, Anakin.'),
    inChat('end', { color: 'success' }, 'You have been given a great honor.'),
    inChat('end', { color: 'warning' }, 'To be on the Council at your age.'),
    inChat('end', { color: 'error' }, "It's never happened before."),
  ],
};

// Beyond the doc page: a bubble with no `Chat` around it, beside a correct one.
// The tail is a pseudo-element masked with `--mask-chat`, which is declared on
// `.chat` — undefined here, so the mask is dropped and what is left is a small
// unmasked square of the bubble's own colour, sitting at the pseudo-element's
// static position. Expected, not a bug (plan §3b).
//
// There is no companion story for a missing `placement`: that one is a type
// error, which is the whole reason the prop is required (plan §3a).
export const BubbleOutsideChat = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>inside a Chat — masked tail at the bottom-left:</div>',
    inChat('start', { color: 'primary' }, 'Correct'),
    '<div>outside a Chat — stray square, no tail:</div>',
    { component: ChatBubble, props: { color: 'primary' }, slots: { default: 'Broken' } },
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges after
// the colour class.
export const Passthrough = {
  render: () => [
    inChat(
      'start',
      {
        color: 'success',
        id: 'bubble-1',
        'data-test': 'yes',
        style: 'letter-spacing:2px',
        class: 'mine',
      },
      'Passthrough',
    ),
  ],
};
