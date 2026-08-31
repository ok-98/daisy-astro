import TextRotate from './TextRotate.astro';

// The component supplies the viewport and the animated track; these stories
// supply only the items (plan §0b). Speed, size and line height are caller
// classes on the root (plan §0e).

const items = (...words: string[]) => words.map((w) => `<span>${w}</span>`).join('');

export default {
  title: 'Components/TextRotate',
  component: TextRotate,
  argTypes: {
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { align: 'center', class: 'text-4xl', slots: { default: items('ONE', 'TWO', 'THREE') } },
};

// 1. Text rotate
export const Default = {
  args: { class: 'text-4xl', slots: { default: items('ONE', 'TWO', 'THREE') } },
};

// 2. Centred, which is what four of the five doc examples use. `align` is a
// prop rather than a class because it lands on the generated track, which a
// caller's `class` cannot reach (§1).
export const Centered = {
  args: { align: 'center', class: 'text-4xl', slots: { default: items('ONE', 'TWO', 'THREE') } },
};

// 3. In a sentence — items are bare elements carrying no daisyUI classes, so
// they take plain Tailwind decoration.
export const InSentence = {
  render: () => [
    '<p class="text-2xl">daisyUI is ',
    {
      component: TextRotate,
      props: { align: 'start' },
      slots: {
        default: ['fast', 'free', 'beautiful']
          .map((w) => `<span class="bg-teal-400 text-teal-800 px-2">${w}</span>`)
          .join(''),
      },
    },
    '</p>',
  ],
};

// 4. Custom speed — Tailwind's duration utility on the root, not a prop (§0e).
export const CustomSpeed = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>default speed:</div>',
    { component: TextRotate, props: { class: 'text-4xl' }, slots: { default: items('ONE', 'TWO', 'THREE') } },
    '<div>duration-2000 — faster:</div>',
    {
      component: TextRotate,
      props: { class: 'text-4xl duration-2000' },
      slots: { default: items('ONE', 'TWO', 'THREE') },
    },
    '</div>',
  ],
};

// 5. Alignment across all three values, since the axis exists only as a prop.
export const Alignments = {
  render: () =>
    (['start', 'center', 'end'] as const).flatMap((align) => [
      `<div>align="${align}":</div>`,
      {
        component: TextRotate,
        props: { align, class: 'text-4xl w-80 bg-base-200' },
        slots: { default: items('ONE', 'TWO', 'THREE') },
      },
    ]),
};

// Beyond the doc page: six items is the ceiling and the seventh breaks the
// loop silently — the track stays sized for six while holding seven rows, so
// items clip and the animation skips. Nothing enforces it at build time (§0d).
export const SevenItems = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>six — the documented maximum:</div>',
    {
      component: TextRotate,
      props: { align: 'center', class: 'text-4xl' },
      slots: { default: items('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX') },
    },
    '<div>seven — clipped, and the loop skips:</div>',
    {
      component: TextRotate,
      props: { align: 'center', class: 'text-4xl' },
      slots: { default: items('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN') },
    },
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges on the
// root — which is where speed, size and line height all arrive (§0e).
export const Passthrough = {
  args: {
    align: 'center',
    id: 'text-rotate-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine text-4xl duration-6000',
    slots: { default: items('ONE', 'TWO', 'THREE') },
  },
};
