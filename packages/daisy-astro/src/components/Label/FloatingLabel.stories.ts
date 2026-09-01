import FloatingLabel from './FloatingLabel.astro';
import TextInput from '../TextInput/TextInput.astro';
import Textarea from '../Textarea/Textarea.astro';
import Select from '../Select/Select.astro';

// The span floats up on focus, or whenever the field stops showing its
// placeholder — so **the field needs a placeholder**, or the label starts
// floated and never comes down (plan §3c). `NoPlaceholder` shows that.
//
// The span may be written before or after the field; it is absolutely
// positioned either way, and the doc page does both.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const input = (placeholder: string, cls: string, extra: Record<string, unknown> = {}): Item => ({
  component: TextInput,
  props: { type: 'text', placeholder, class: cls, ...extra },
});

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
        { component: TextInput, props: { type: 'email', placeholder: 'mail@site.com', size: 'md' } },
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
        { component: TextInput, props: { type: 'email', placeholder: 'mail@site.com', size: 'md' } },
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
      floating([
        { component: TextInput, props: { placeholder: SIZE_LABEL[size], size } },
        `<span>${SIZE_LABEL[size]}</span>`,
      ]),
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
      input('Input', 'sm:input-sm md:input-md lg:input-lg xl:input-xl', { size: 'xs', value: 'Placeholder' }),
      '<span>Input</span>',
    ]),
    floating([
      {
        component: Textarea,
        props: {
          placeholder: 'Textarea',
          size: 'xs',
          class: 'sm:textarea-sm md:textarea-md lg:textarea-lg xl:textarea-xl',
        },
        slots: { default: 'Placeholder' },
      },
      '<span>Textarea</span>',
    ]),
    floating([
      {
        component: Select,
        props: { size: 'xs', class: 'sm:select-sm md:select-md lg:select-lg xl:select-xl' },
        slots: { default: ['<option disabled selected>Placeholder</option>', '<option>Option</option>'] },
      },
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
    floating(['<span>Your Email</span>', input('mail@site.com', '', { size: 'md' })]),
    '<div class="text-xs opacity-60">no placeholder — label starts floated and never comes down</div>',
    floating(['<span>Your Email</span>', { component: TextInput, props: { type: 'email', size: 'md' } }]),
    '<div class="text-xs opacity-60">disabled — label hidden entirely</div>',
    floating([
      '<span>Your Email</span>',
      { component: TextInput, props: { type: 'email', placeholder: 'mail@site.com', size: 'md', disabled: true } },
    ]),
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
        { component: TextInput, props: { placeholder: 'type here', size: 'md' } },
      ],
    },
  },
};
