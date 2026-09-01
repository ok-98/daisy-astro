import Label from './Label.astro';
import TextInput from '../TextInput/TextInput.astro';

// Two usages of one class, and they look nothing alike (plan §3a, §3b):
// a bordered affix when it is a direct child of a field wrapper, dimmed inline
// text anywhere else.
//
// The wrapper around each field is daisyUI's own `<label class="input">`, which
// is why `Label` defaults to a `<span>` — a label inside a label is invalid.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

// The field wrapper is `TextInput as="label"`, which is the shape daisyUI's own
// affix examples use: the class on a label, a bare input inside it. The inner
// input is the caller's, as it must be — daisyUI strips its border itself.
const field = (children: Item[], props: Record<string, unknown> = {}): Item => ({
  component: TextInput,
  props: { as: 'label', ...props },
  slots: { default: children },
});

const bare = (attrs: string) => `<input ${attrs}/>`;

export default {
  title: 'Components/Label',
  component: Label,
  argTypes: {
    as: { control: 'text' },
    class: { control: 'text' },
  },
};

export const Playground = {
  render: (args: Record<string, unknown>) => [
    field([{ component: Label, props: args, slots: { default: 'https://' } }, bare('type="text" placeholder="URL" ')]),
  ],
};

// 1. Affix at the start — full height, with a dividing rule on its trailing
// edge and a negative margin pulling it to the field's edge.
export const ForInput = {
  render: () => [
    field([{ component: Label, slots: { default: 'https://' } }, bare('type="text" placeholder="URL" ')]),
  ],
};

// 2. Affix at the end — the border flips to the leading edge, from
// `:first-child` / `:last-child` alone.
export const ForInputAtEnd = {
  render: () => [
    field([bare('type="text" placeholder="domain name" '), { component: Label, slots: { default: '.com' } }]),
  ],
};

// 3. Affix in a select wrapper — the same rule set matches `.select > *`.
export const ForSelect = {
  render: () => [
    // The select wrapper is a plain `label.select`: `Select` renders the field
    // itself and has no wrapper form, unlike `TextInput` (§3b).
    '<label class="select">',
    { component: Label, slots: { default: 'Type' } },
    '<select><option>Personal</option><option>Business</option></select></label>',
  ],
};

// 4. Affix on a date input.
export const ForDateInput = {
  render: () => [field([{ component: Label, slots: { default: 'Publish date' } }, bare('type="date" ')])],
};

// Beyond the doc page: the other usage, beside the first. Outside a field
// wrapper the same class is just dimmed inline text — so here it takes
// `as="label"` with a `for`, which is the shape the Fieldset and Checkbox pages
// use and the reason the component is polymorphic (§3a, §3d).
export const Standalone = {
  render: () => [
    '<div class="flex flex-col gap-4 w-72"><div class="text-xs opacity-60">as="label" with for — a real form label</div>',
    { component: Label, props: { as: 'label', for: 'email-1' }, slots: { default: 'Email' } },
    { component: TextInput, props: { id: 'email-1', type: 'email', placeholder: 'mail@site.com' } },
    '<div class="text-xs opacity-60">as="label" wrapping a control — cursor becomes a pointer</div>',
    {
      component: Label,
      props: { as: 'label' },
      slots: { default: '<input type="checkbox" class="checkbox" /> Remember me' },
    },
    '</div>',
  ],
};

// Beyond the doc page: an affix that is neither first nor last. The border and
// the negative margin come from `:first-child` / `:last-child`, so this one
// keeps only the base styling — ordinary dimmed text sitting in the middle of a
// field, with no error (§3b).
export const AffixInTheMiddle = {
  render: () => [
    '<div class="flex flex-col gap-4 w-72"><div class="text-xs opacity-60">first child — bordered affix</div>',
    field([{ component: Label, slots: { default: 'https://' } }, bare('type="text" placeholder="URL" ')]),
    '<div class="text-xs opacity-60">middle child — no border, no margin</div>',
    field([
      bare('type="text" placeholder="URL" size="8" '),
      { component: Label, slots: { default: 'middle' } },
      bare('type="text" placeholder="more" size="8" '),
    ]),
    '</div>',
  ],
};

// Regression guard: native attributes survive, caller `class` merges, and the
// polymorphic root really changes — `for` is only valid because this one is a
// `<label>`.
export const Passthrough = {
  render: () => [
    {
      component: Label,
      props: {
        as: 'label',
        for: 'passthrough-input',
        id: 'label-1',
        'data-test': 'yes',
        style: 'letter-spacing:1px',
        class: 'mine',
      },
      slots: { default: 'Passthrough' },
    },
  ],
};
