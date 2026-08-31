import CodeMockup from './CodeMockup.astro';

// Lines are bare `pre` elements — daisyUI styles the element itself, so there
// is no line sub-component and `data-prefix` passes through natively (plan §2).

const line = (code: string, prefix?: string, cls?: string) =>
  `<pre${prefix === undefined ? '' : ` data-prefix="${prefix}"`}${cls ? ` class="${cls}"` : ''}><code>${code}</code></pre>`;

export default {
  title: 'Components/CodeMockup',
  component: CodeMockup,
  // No variant argTypes — this component has none (plan §1).
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: { class: 'w-full', slots: { default: line('npm i daisyui', '$') } },
};

// 1. Code mockup
export const Default = {
  args: { class: 'w-full', slots: { default: line('npm i daisyui', '$') } },
};

// 2. Multi line — note every line is prefixed; daisyUI never mixes (§3c).
export const MultiLine = {
  args: {
    class: 'w-full',
    slots: {
      default:
        line('npm i daisyui', '$') +
        line('installing...', '>') +
        line('Done!', '>'),
    },
  },
};

// 3. Highlighted line — per-line styling is a class on the individual `pre`,
// which is why there is no `lines` array prop (§2).
export const HighlightedLine = {
  args: {
    class: 'w-full',
    slots: {
      default:
        line('npm i daisyui', '1') +
        line('installing...', '2') +
        line('Error!', '3', 'bg-warning text-warning-content'),
    },
  },
};

// 4. Without prefix — the empty `::before` is deliberate, keeping the code off
// the left edge (§3c).
export const WithoutPrefix = {
  args: { class: 'w-full', slots: { default: line('without prefix') } },
};

// 5. With line numbers as prefixes and coloured text.
export const WithColoredText = {
  args: {
    class: 'w-full',
    slots: {
      default:
        line('npm i daisyui', '1') +
        line('installing...', '2', 'text-warning') +
        line('Done!', '3', 'text-success'),
    },
  },
};

// 6. With background color — plain Tailwind overriding the neutral default;
// there is no `mockup-code-primary` class to make a prop out of (§3a).
export const WithBackgroundColor = {
  args: {
    class: 'w-full bg-primary text-primary-content',
    slots: { default: line('npm i daisyui', '$') },
  },
};

// Beyond the doc page: the behaviour §3c warns about. Prefixed lines indent by
// a 2rem right-aligned box plus 2ch; unprefixed ones by 2ch alone — so mixing
// them misaligns the code by about 2rem. daisyUI's examples are always all one
// or all the other.
export const MixedPrefixes = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>mixed — misaligned by ~2rem:</div>',
    { component: CodeMockup, props: { class: 'w-full' }, slots: { default: line('npm i daisyui', '$') + line('no prefix here') } },
    '<div>all prefixed — aligned:</div>',
    { component: CodeMockup, props: { class: 'w-full' }, slots: { default: line('npm i daisyui', '$') + line('now aligned', '$') } },
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  args: {
    id: 'code-1',
    'data-test': 'yes',
    style: 'max-width:40rem',
    class: 'mine w-full',
    slots: { default: line('npm i daisyui', '$') },
  },
};
