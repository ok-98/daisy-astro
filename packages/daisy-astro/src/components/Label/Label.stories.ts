import Label from './Label.astro';

// Two usages of one class, and they look nothing alike (plan §3a, §3b):
// a bordered affix when it is a direct child of a field wrapper, dimmed inline
// text anywhere else.
//
// The wrapper around each field is daisyUI's own `<label class="input">`, which
// is why `Label` defaults to a `<span>` — a label inside a label is invalid.

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
    '<label class="input">',
    { component: Label, props: args, slots: { default: 'https://' } },
    // TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
    '<input type="text" placeholder="URL" /></label>',
  ],
};

// 1. Affix at the start — full height, with a dividing rule on its trailing
// edge and a negative margin pulling it to the field's edge.
export const ForInput = {
  render: () => [
    '<label class="input">',
    { component: Label, slots: { default: 'https://' } },
    // TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
    '<input type="text" placeholder="URL" /></label>',
  ],
};

// 2. Affix at the end — the border flips to the leading edge, from
// `:first-child` / `:last-child` alone.
export const ForInputAtEnd = {
  render: () => [
    // TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
    '<label class="input"><input type="text" placeholder="domain name" />',
    { component: Label, slots: { default: '.com' } },
    '</label>',
  ],
};

// 3. Affix in a select wrapper — the same rule set matches `.select > *`.
export const ForSelect = {
  render: () => [
    '<label class="select">',
    { component: Label, slots: { default: 'Type' } },
    // TODO(daisy-astro): compose <Select> here once it is implemented — see plans/components/label.md §5
    '<select><option>Personal</option><option>Business</option></select></label>',
  ],
};

// 4. Affix on a date input.
export const ForDateInput = {
  render: () => [
    '<label class="input">',
    { component: Label, slots: { default: 'Publish date' } },
    // TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
    '<input type="date" /></label>',
  ],
};

// Beyond the doc page: the other usage, beside the first. Outside a field
// wrapper the same class is just dimmed inline text — so here it takes
// `as="label"` with a `for`, which is the shape the Fieldset and Checkbox pages
// use and the reason the component is polymorphic (§3a, §3d).
export const Standalone = {
  render: () => [
    '<div class="flex flex-col gap-4 w-72"><div class="text-xs opacity-60">as="label" with for — a real form label</div>',
    { component: Label, props: { as: 'label', for: 'email-1' }, slots: { default: 'Email' } },
    // TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
    '<input id="email-1" type="email" class="input" placeholder="mail@site.com" />',
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
    '<label class="input">',
    { component: Label, slots: { default: 'https://' } },
    // TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
    '<input type="text" placeholder="URL" /></label>',
    '<div class="text-xs opacity-60">middle child — no border, no margin</div>',
    // TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/label.md §5
    '<label class="input"><input type="text" placeholder="URL" size="8" />',
    { component: Label, slots: { default: 'middle' } },
    '<input type="text" placeholder="more" size="8" /></label>',
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
