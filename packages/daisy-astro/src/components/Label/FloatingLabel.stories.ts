import FloatingLabel from './FloatingLabel.astro';

// The span floats up on focus, or whenever the field stops showing its
// placeholder — so **the field needs a placeholder**, or the label starts
// floated and never comes down (plan §3c). `NoPlaceholder` shows that.
//
// The span may be written before or after the field; it is absolutely
// positioned either way, and the doc page does both.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

// TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
const input = (placeholder: string, cls: string, extra = '') =>
  `<input type="text" placeholder="${placeholder}" class="input ${cls}" ${extra}/>`;

const floating = (children: Item[], props: Record<string, unknown> = {}): Item => ({
  component: FloatingLabel,
  props,
  slots: { default: children },
});

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const SIZE_LABEL = { xs: 'Extra Small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra Large' } as const;

export default {
  title: 'Components/FloatingLabel',
  component: FloatingLabel,
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: {
    class: 'w-full max-w-xs',
    slots: {
      default: [
        '<span>Your Email</span>',
        // TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
        '<input type="email" placeholder="mail@site.com" class="input input-md" />',
      ],
    },
  },
};

// 1. Floating label — the span written **before** the field here.
export const Default = {
  args: {
    class: 'w-full max-w-xs',
    slots: {
      default: [
        '<span>Your Email</span>',
        // TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
        '<input type="email" placeholder="mail@site.com" class="input input-md" />',
      ],
    },
  },
};

// 2. Different sizes — and the span written **after** the field, which works
// just as well (§2). The resting position follows `--size-field` from the
// input's own size class, which is why there is no `size` prop (§3c).
export const Sizes = {
  render: () => [
    '<div class="grid gap-4 w-xs">',
    ...SIZES.map((size) =>
      floating([input(SIZE_LABEL[size], `input-${size}`), `<span>${SIZE_LABEL[size]}</span>`]),
    ),
    '</div>',
  ],
};

// 3. Responsive size — five breakpoint classes on the *field*. The select is
// the interesting one: `:placeholder-shown` does not exist on a `<select>`, so
// its label reacts to focus alone and drops back down on blur. daisyUI ships it
// that way (§3c).
export const ResponsiveSize = {
  render: () => [
    '<div class="grid gap-4 w-xs">',
    floating([
      input('Input', 'input-xs sm:input-sm md:input-md lg:input-lg xl:input-xl', 'value="Placeholder" '),
      '<span>Input</span>',
    ]),
    floating([
      // TODO(daisy-astro): compose <Textarea> here once it is implemented — see plans/components/label.md §5
      '<textarea placeholder="Textarea" class="textarea textarea-xs sm:textarea-sm md:textarea-md lg:textarea-lg xl:textarea-xl">Placeholder</textarea>',
      '<span>Textarea</span>',
    ]),
    floating([
      // TODO(daisy-astro): compose <Select> here once it is implemented — see plans/components/label.md §5
      '<select class="select select-xs sm:select-sm md:select-md lg:select-lg xl:select-xl"><option disabled selected>Placeholder</option><option>Option</option></select>',
      '<span>Select</span>',
    ]),
    '</div>',
  ],
};

// Beyond the doc page: **the trap.** The second field has no `placeholder`, so
// `:placeholder-shown` never matches, the `:not(:has(…))` guard is always true,
// and its label starts floated and stays there over an empty field (§3c).
//
// The third is disabled, which hides its label completely — also worth seeing
// once.
export const NoPlaceholder = {
  render: () => [
    '<div class="grid gap-4 w-xs"><div class="text-xs opacity-60">with a placeholder — label rests inside</div>',
    floating(['<span>Your Email</span>', input('mail@site.com', 'input-md')]),
    '<div class="text-xs opacity-60">no placeholder — label starts floated and never comes down</div>',
    // TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
    floating(['<span>Your Email</span>', '<input type="email" class="input input-md" />']),
    '<div class="text-xs opacity-60">disabled — label hidden entirely</div>',
    // TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
    floating(['<span>Your Email</span>', '<input type="email" placeholder="mail@site.com" class="input input-md" disabled />']),
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  args: {
    id: 'floating-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine w-full max-w-xs',
    slots: {
      default: [
        '<span>Passthrough</span>',
        // TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
        '<input type="text" placeholder="type here" class="input input-md" />',
      ],
    },
  },
};
