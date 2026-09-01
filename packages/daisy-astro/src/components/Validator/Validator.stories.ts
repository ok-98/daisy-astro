import ValidatorHint from './ValidatorHint.astro';
import TextInput from '../TextInput/TextInput.astro';
import Select from '../Select/Select.astro';
import Checkbox from '../Checkbox/Checkbox.astro';
import Toggle from '../Toggle/Toggle.astro';
import Button from '../Button/Button.astro';
import Fieldset from '../Fieldset/Fieldset.astro';
import Label from '../Label/Label.astro';

// **There is no `Validator` component.** `validator` sets one custom property —
// `--input-color` — that the form controls already read, so it is a caller
// class on the control itself (plan §0a, §0b). This file is the widest
// integration check in the library for that reason.
//
// **Almost nothing here shows its state on load.** daisyUI matches
// `:user-invalid`, which only applies *after the user interacts* — that is what
// stops every required field on a fresh form rendering red. So each story says
// what to do; `AriaInvalid` is the only one that is red without interaction
// (plan §0c, §0d).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const hint = (text: string, props: Record<string, unknown> = {}): Item => ({
  component: ValidatorHint,
  props,
  slots: { default: text },
});

const form = (children: Item[], cls = 'w-full max-w-xs'): Item[] => [
  `<form class="${cls}" autocomplete="off" onsubmit="return false">`,
  ...children,
  '</form>',
];

const field = (props: Record<string, unknown>): Item => ({
  component: TextInput,
  props: { class: 'validator', ...props },
});

export default {
  title: 'Components/Validator',
  component: ValidatorHint,
  argTypes: {
    as: { control: 'inline-radio', options: ['p', 'div', 'span'] },
    collapse: { control: 'boolean' },
  },
};

// The playground pairs the hint with a permanently-invalid field, so the
// controls have something to act on without typing.
export const Playground = {
  render: (args: Record<string, unknown>) =>
    form([
      field({ type: 'email', required: true, placeholder: 'mail@site.com', 'aria-invalid': 'true' }),
      { component: ValidatorHint, props: args, slots: { default: 'Enter valid email address' } },
    ]),
  args: { as: 'p', collapse: false },
};

// 1. Validator — **type an invalid address and click away.** On load it is
// neutral, which is `:user-invalid` doing its job (§0c).
export const Default = {
  render: () => form([field({ type: 'email', required: true, placeholder: 'mail@site.com' })]),
};

// 2. With a hint — the hint **reserves its space while hidden**, so the layout
// does not shift when it appears (§0e).
export const WithHint = {
  render: () =>
    form([
      field({ type: 'email', required: true, placeholder: 'mail@site.com' }),
      hint('Enter valid email address', { as: 'div' }),
    ]),
};

// 3. Password — type something short, then click away.
export const Password = {
  render: () =>
    form([
      field({
        type: 'password',
        required: true,
        placeholder: 'Password',
        minlength: 8,
        pattern: '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}',
        title: 'Must be more than 8 characters, including number, lowercase letter, uppercase letter',
      }),
      hint(
        'Must be more than 8 characters, including<br/>At least one number<br/>At least one lowercase letter<br/>At least one uppercase letter',
      ),
    ]),
};

// 4. Username — the hint is multi-line markup, which is why the slot has to
// accept more than text (§2).
export const Username = {
  render: () =>
    form([
      field({
        type: 'text',
        required: true,
        placeholder: 'Username',
        pattern: '[A-Za-z][A-Za-z0-9\\-]*',
        minlength: 3,
        maxlength: 30,
        title: 'Only letters, numbers or dash',
      }),
      hint('Must be 3 to 30 characters<br/>containing only letters, numbers or dash'),
    ]),
};

// 5. Phone — `validator` sits beside a plain Tailwind class on the same
// control, since both are caller classes.
export const Phone = {
  render: () =>
    form([
      field({
        type: 'tel',
        class: 'validator tabular-nums',
        required: true,
        placeholder: 'Phone',
        pattern: '[0-9]*',
        minlength: 10,
        maxlength: 10,
        title: 'Must be 10 digits',
      }),
      hint('Must be 10 digits'),
    ]),
};

// 6. URL — starts with a valid value, so **delete it** to see the error.
export const Url = {
  render: () =>
    form([
      field({
        type: 'url',
        required: true,
        placeholder: 'https://',
        value: 'https://',
        pattern: '^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\\-].*[a-zA-Z0-9])?\\.)+[a-zA-Z].*$',
        title: 'Must be valid URL',
      }),
      hint('Must be valid URL'),
    ]),
};

// 7. Date range — pick a date outside 2025.
export const DateRange = {
  render: () =>
    form([
      field({
        type: 'date',
        required: true,
        placeholder: 'Pick a date in 2025',
        min: '2025-01-01',
        max: '2025-12-31',
        title: 'Must be 2025',
      }),
      hint('Must be 2025'),
    ]),
};

// 8. Number range — type 11.
export const NumberRange = {
  render: () =>
    form([
      field({
        type: 'number',
        required: true,
        placeholder: 'Type a number between 1 to 10',
        min: '1',
        max: '10',
        title: 'Must be between be 1 to 10',
      }),
      hint('Must be between be 1 to 10'),
    ]),
};

// 9. Checkbox — check it and uncheck it. This is the story that proves
// `--input-color` reaches components other than `.input` (§0a).
export const CheckboxRequired = {
  render: () =>
    form([{ component: Checkbox, props: { class: 'validator', required: true, title: 'Required' } }, hint('Required')], ''),
};

// 10. Toggle — same, on the track.
export const ToggleRequired = {
  render: () =>
    form([{ component: Toggle, props: { class: 'validator', required: true, title: 'Required' } }, hint('Required')], ''),
};

// 11. Select — **click Submit before choosing**, which is daisyUI's own
// caption. The placeholder option has an empty `value`, which is what makes
// `required` fail.
export const SelectRequired = {
  render: () =>
    form([
      {
        component: Select,
        props: { class: 'validator', required: true },
        slots: {
          default: [
            '<option disabled selected value="">Choose:</option>',
            '<option>Tabs</option>',
            '<option>Spaces</option>',
          ],
        },
      },
      hint('Required'),
      { component: Button, props: { type: 'submit' }, slots: { default: 'Submit form' } },
    ]),
};

// 12. Full form — **submit it empty.** Each field is wrapped in its own
// `Fieldset` or `Label`, which is how daisyUI scopes the general-sibling
// reveal (§0e, and see `HintScopeTrap`). Both hints use `collapse`, so they
// reserve no space until they appear.
export const FormValidation = {
  render: () => [
    '<form autocomplete="off" onsubmit="return false" class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">',
    {
      component: Fieldset,
      slots: {
        default: [
          { component: Label, props: { as: 'label' }, slots: { default: 'Email' } },
          field({ type: 'email', placeholder: 'Email', required: true }),
          hint('Required', { collapse: true }),
        ],
      },
    },
    {
      component: Label,
      props: { as: 'label', class: 'fieldset' },
      slots: {
        default: [
          { component: Label, props: { as: 'span' }, slots: { default: 'Password' } },
          field({ type: 'password', placeholder: 'Password', required: true }),
          hint('Required', { as: 'span', collapse: true }),
        ],
      },
    },
    { component: Button, props: { color: 'neutral', class: 'mt-4', type: 'submit' }, slots: { default: 'Login' } },
    { component: Button, props: { variant: 'ghost', class: 'mt-1', type: 'reset' }, slots: { default: 'Reset' } },
    '</form>',
  ],
};

// Beyond the doc page: the only story that shows the error state **on load**.
// `aria-invalid` is an equal first-class trigger in daisyUI's CSS — undocumented
// in the frontmatter, but there — which is how a framework driving validation
// in JavaScript gets the styling with no dependency on native constraint
// validation (§0d).
export const AriaInvalid = {
  render: () =>
    form([
      field({ type: 'email', placeholder: 'mail@site.com', 'aria-invalid': 'true' }),
      hint('Enter valid email address'),
    ]),
};

// Beyond the doc page, and the highest-value story here: **the scoping trap**.
//
// The reveal is a *general* sibling combinator, so in the left form one invalid
// field reveals **both** hints — including the one belonging to the field
// beside it. The right form wraps each control in its own `Fieldset`, which is
// what daisyUI's own form example does and the only fix (§0e).
//
// Both fields are `aria-invalid` on the first control only, so the leak is
// visible without typing.
export const HintScopeTrap = {
  render: () => [
    '<div class="flex gap-8 items-start">',
    '<div><div class="text-xs opacity-60 mb-2">one parent — both hints appear</div>',
    ...form([
      field({ type: 'email', placeholder: 'first', 'aria-invalid': 'true' }),
      hint('hint for the first field'),
      field({ type: 'email', placeholder: 'second (valid)' }),
      hint('hint for the second field — should not be showing'),
    ]),
    '</div>',
    '<div><div class="text-xs opacity-60 mb-2">wrapped per field — scoped correctly</div>',
    ...form([
      {
        component: Fieldset,
        slots: {
          default: [
            field({ type: 'email', placeholder: 'first', 'aria-invalid': 'true' }),
            hint('hint for the first field'),
          ],
        },
      },
      {
        component: Fieldset,
        slots: {
          default: [field({ type: 'email', placeholder: 'second (valid)' }), hint('hint for the second field')],
        },
      },
    ]),
    '</div></div>',
  ],
};

// Beyond the doc page: `collapse` needs a pair to show anything, because the
// point is the **layout shift**. Both fields are invalid on load; the left
// hint reserved its space beforehand, the right one did not (§0e).
export const CollapseComparison = {
  render: () => [
    '<div class="flex gap-8 items-start">',
    '<div><div class="text-xs opacity-60 mb-2">default — space reserved</div>',
    ...form([field({ type: 'email', placeholder: 'mail@site.com', 'aria-invalid': 'true' }), hint('Required')]),
    '<div class="text-xs opacity-60">text after the hint</div></div>',
    '<div><div class="text-xs opacity-60 mb-2">collapse — no space until shown</div>',
    ...form([
      field({ type: 'email', placeholder: 'mail@site.com', 'aria-invalid': 'true' }),
      hint('Required', { collapse: true }),
    ]),
    '<div class="text-xs opacity-60">text after the hint</div></div>',
    '</div>',
  ],
};

// Regression guard: the polymorphic root really changes, native attributes
// survive, and `class` merges after `hidden`. `role="alert"` is worth showing —
// an error message is a reasonable live region, and daisyUI ships no semantics
// of its own here.
export const Passthrough = {
  render: () =>
    form([
      field({ type: 'email', placeholder: 'mail@site.com', 'aria-invalid': 'true' }),
      hint('Passthrough', {
        as: 'div',
        collapse: true,
        role: 'alert',
        id: 'hint-1',
        'data-test': 'yes',
        style: 'letter-spacing:1px',
        class: 'mine',
      }),
    ]),
};
