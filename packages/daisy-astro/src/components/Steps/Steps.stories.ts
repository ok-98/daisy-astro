import Steps from './Steps.astro';
import Step from './Step.astro';
import StepIcon from './StepIcon.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const step = (label: string, props: Record<string, unknown> = {}, slot?: Item[]): Item => ({
  component: Step,
  props,
  slots: { default: slot ?? label },
});

const TRAIL: Item[] = [
  step('Register', { color: 'primary' }),
  step('Choose plan', { color: 'primary' }),
  step('Purchase'),
  step('Receive Product'),
];

export default {
  title: 'Components/Steps',
  component: Steps,
  argTypes: {
    direction: { control: 'radio', options: [undefined, 'vertical', 'horizontal'] },
  },
};

// Two trails at once, so the CSS counter's isolation is visible: the second
// list must start at 1, not at 5 (§3e.2).
export const Playground = {
  render: () => [
    { component: Steps, slots: { default: TRAIL } },
    '<div class="h-4"></div>',
    { component: Steps, slots: { default: TRAIL } },
  ],
};

// 1. Horizontal — the numbers come from a CSS counter, and the first step has
// no bar leading into it.
export const Horizontal = {
  args: { slots: { default: TRAIL } },
};

// 2. Vertical
export const Vertical = {
  args: { direction: 'vertical', slots: { default: TRAIL } },
};

// 3. Responsive — a caller class, since one `direction` union cannot express
// "vertical below lg, horizontal above" (§3d).
export const Responsive = {
  args: { direction: 'vertical', class: 'lg:steps-horizontal', slots: { default: TRAIL } },
};

// 4. With Custom Content in Step-Icon — the icon replaces the number rather
// than joining it, because daisyUI suppresses the generated content when a
// `.step-icon` child is present (§3c).
export const WithStepIcon = {
  args: {
    slots: {
      default: [
        step('', { color: 'neutral' }, [{ component: StepIcon, slots: { default: '😕' } }, 'Step 1']),
        step('', { color: 'neutral' }, [{ component: StepIcon, slots: { default: '😃' } }, 'Step 2']),
        step('', {}, [{ component: StepIcon, slots: { default: '😍' } }, 'Step 3']),
      ],
    },
  },
};

// 5. With Data-Content — a plain attribute, not a prop. Step 6 carries
// `data-content=""` deliberately: an empty string is a blank circle, which is
// why a prop that dropped falsy values would be wrong (§3c).
export const WithDataContent = {
  args: {
    slots: {
      default: ['?', '!', '✓', '✕', '★', '', '●'].map((content, i) =>
        step(`Step ${i + 1}`, { color: 'neutral', 'data-content': content }),
      ),
    },
  },
};

// 6. Custom Colors — the bar into the final error step stays grey, because
// colouring it needs the *previous* step to share the colour. Deliberate on
// daisyUI's part, and the reason there is no `progress` prop (§3b).
export const CustomColors = {
  args: {
    slots: {
      default: [
        step('Fly to moon', { color: 'info' }),
        step('Shrink the moon', { color: 'info' }),
        step('Grab the moon', { color: 'info' }),
        step('Sit on toilet', { color: 'error', 'data-content': '?' }),
      ],
    },
  },
};

// 7. With Scrollable Wrapper — the wrapper is caller markup: `.steps` is
// `inline-grid` and sizes to its content, so the scroll needs a constrained
// parent (§3d).
export const ScrollableWrapper = {
  render: () => [
    '<div class="overflow-x-auto">',
    {
      component: Steps,
      slots: {
        default: [
          step('start'),
          ...[2, 3, 4].map((n) => step(String(n), { color: 'secondary' })),
          step('5'),
          ...[6, 7].map((n) => step(String(n), { color: 'accent' })),
          step('8'),
          ...[9, 10].map((n) => step(String(n), { color: 'error' })),
          step('11'),
          step('12'),
          ...[13, 14].map((n) => step(String(n), { color: 'warning' })),
          step('15'),
          ...[16, 17, 18, 19, 20, 21, 22, 23].map((n) => step(String(n), { color: 'neutral' })),
          step('end', { color: 'neutral' }),
        ],
      },
    },
    '</div>',
  ],
};

// Beyond the doc page: the two halves of §3b in one picture. The bar between
// the two primary steps is coloured; the bar after them is not, because its
// step and the one before it no longer share a colour.
export const ColorRun = {
  args: {
    slots: {
      default: [
        step('coloured', { color: 'primary' }),
        step('bar before me is coloured', { color: 'primary' }),
        step('bar before me is grey'),
        step('also grey'),
      ],
    },
  },
};

// Beyond the doc page: the mistake the prop placement prevents. Raw markup,
// because the component API makes it unrepresentable — `step-primary` on the
// list matches nothing, so every step stays grey (§3a).
export const ColorOnContainer = {
  render: () => [
    '<div class="flex flex-col gap-2"><div>wrong — colour class on the ul, does nothing:</div>',
    '<ul class="steps step-primary"><li class="step">Register</li><li class="step">Purchase</li></ul>',
    '<div>right — colour on each step:</div>',
    { component: Steps, slots: { default: [step('Register', { color: 'primary' }), step('Purchase', { color: 'primary' })] } },
    '</div>',
  ],
};

// Beyond the doc page: the icon suppresses the counter rather than doubling
// it. If a number appears beside the emoji, `:has()` is unsupported in that
// browser (§3c, §3e.3).
export const IconAndCounter = {
  args: {
    slots: {
      default: [
        step('numbered'),
        step('', {}, [{ component: StepIcon, slots: { default: '★' } }, 'icon, no number']),
        step('numbered again'),
      ],
    },
  },
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  args: {
    direction: 'vertical',
    id: 'steps-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: { default: TRAIL },
  },
};
