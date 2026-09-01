import TextInput from './TextInput.astro';
import Kbd from '../Kbd/Kbd.astro';
import Badge from '../Badge/Badge.astro';
import Fieldset from '../Fieldset/Fieldset.astro';
import FieldsetLegend from '../Fieldset/FieldsetLegend.astro';
import Label from '../Label/Label.astro';
import Join from '../Join/Join.astro';
import Button from '../Button/Button.astro';

// Two shapes: the class on the field (`as="input"`), or on a wrapper holding an
// icon, a **bare** input and affixes (`as="label"`). Eight doc examples use the
// second (plan §0a).
//
// `validator` is a caller class on this component and `validator-hint` is a
// sibling outside it — six examples show that, and none of it needs a prop
// (plan §0f). The inner input's `required` / `pattern` / `minlength` go on the
// inner input, never on the label.
//
// Markup is copied from the doc page verbatim, **including its inconsistent
// `grow` on some inner inputs and not others** — normalising it would hide
// whether it is load-bearing (plan §0h).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const svg = (paths: string, viewBox = '0 0 24 24') =>
  `<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">${paths}</g></svg>`;

const ICON = {
  search: svg('<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>'),
  file: svg(
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path>',
  ),
  user: svg('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>'),
  mail: svg(
    '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>',
  ),
  key: svg(
    '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>',
  ),
  link: svg(
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>',
  ),
  phone:
    '<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g fill="none"><path d="M7.25 11.5C6.83579 11.5 6.5 11.8358 6.5 12.25C6.5 12.6642 6.83579 13 7.25 13H8.75C9.16421 13 9.5 12.6642 9.5 12.25C9.5 11.8358 9.16421 11.5 8.75 11.5H7.25Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6 1C4.61929 1 3.5 2.11929 3.5 3.5V12.5C3.5 13.8807 4.61929 15 6 15H10C11.3807 15 12.5 13.8807 12.5 12.5V3.5C12.5 2.11929 11.3807 1 10 1H6ZM10 2.5H9.5V3C9.5 3.27614 9.27614 3.5 9 3.5H7C6.72386 3.5 6.5 3.27614 6.5 3V2.5H6C5.44771 2.5 5 2.94772 5 3.5V12.5C5 13.0523 5.44772 13.5 6 13.5H10C10.5523 13.5 11 13.0523 11 12.5V3.5C11 2.94772 10.5523 2.5 10 2.5Z" fill="currentColor"></path></g></svg>',
} as const;

// The inner field of an `as="label"` input is a bare `<input>` the caller
// writes — daisyUI strips its border and background itself.
const inner = (attrs: string) => `<input ${attrs}/>`;

const wrapped = (children: Item[], props: Record<string, unknown> = {}): Item => ({
  component: TextInput,
  props: { as: 'label', ...props },
  slots: { default: children },
});

// A validated field: the wrapper, then the hint as a **sibling** outside it.
const validated = (icon: string, field: string, hint: string, hintClass = 'validator-hint') => [
  '<form class="w-full max-w-xs">',
  wrapped([icon, inner(field)], { class: 'validator' }),
  `<p class="${hintClass}">${hint}</p>`,
  '</form>',
];

const COLORS = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const SIZE_LABEL = { xs: 'Xsmall', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Xlarge' } as const;

export default {
  title: 'Components/TextInput',
  component: TextInput,
  argTypes: {
    as: { control: 'inline-radio', options: ['input', 'label'] },
    color: { control: 'select', options: [undefined, ...COLORS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
    ghost: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'date', 'datetime-local', 'week', 'month', 'tel', 'url', 'search', 'time'],
    },
  },
};

export const Playground = {
  args: { type: 'text', placeholder: 'Type here' },
};

// 1. Text input.
export const Default = {
  args: { type: 'text', placeholder: 'Type here' },
};

// 2. Text label inside — three wrapper forms: an icon plus two `Kbd`s, an icon
// alone, and **leading text** with a trailing `Badge`. Note the inner inputs
// carry `grow` here and not in the later examples; that inconsistency is
// daisyUI's own and is kept (§0h).
export const LabelInside = {
  render: () => [
    '<div class="grid gap-4 w-xs">',
    wrapped([
      ICON.search,
      inner('type="search" class="grow" placeholder="Search" '),
      { component: Kbd, props: { size: 'sm' }, slots: { default: '⌘' } },
      { component: Kbd, props: { size: 'sm' }, slots: { default: 'K' } },
    ]),
    wrapped([ICON.file, inner('type="text" class="grow" placeholder="index.php" ')]),
    wrapped([
      'Path',
      inner('type="text" class="grow" placeholder="src/app/" '),
      { component: Badge, props: { color: 'neutral', size: 'xs' }, slots: { default: 'Optional' } },
    ]),
    '</div>',
  ],
};

// 3. Ghost — no background, border or shadow until focus.
export const Ghost = {
  args: { ghost: true, type: 'text', placeholder: 'Type here' },
};

// 4. With fieldset and legend — the helper text is a `Label` rendered as a
// `<p>`, and all three are flat grid siblings.
export const WithFieldsetLegend = {
  render: () => [
    {
      component: Fieldset,
      props: { class: 'w-xs' },
      slots: {
        default: [
          { component: FieldsetLegend, slots: { default: 'What is your name?' } },
          { component: TextInput, props: { type: 'text', placeholder: 'Type here' } },
          { component: Label, props: { as: 'p' }, slots: { default: 'Optional' } },
        ],
      },
    },
  ],
};

// 5. With fieldset and label — `for`/`id` pairing, which is the caller's job:
// `Label as="label"` carries the `for`, this component carries the `id`.
export const WithFieldsetLabel = {
  render: () => [
    {
      component: Fieldset,
      props: { class: 'w-xs' },
      slots: {
        default: [
          { component: Label, props: { as: 'label', for: 'name' }, slots: { default: 'Name' } },
          { component: TextInput, props: { type: 'text', id: 'name', placeholder: 'Name' } },
        ],
      },
    },
  ],
};

// 6. Colours — all eight.
export const Colors = {
  render: () => [
    '<div class="grid gap-4 w-xs">',
    ...COLORS.map((color) => ({
      component: TextInput,
      props: { color, type: 'text', placeholder: color[0].toUpperCase() + color.slice(1) },
    })),
    '</div>',
  ],
};

// 7. Sizes — all five. Unlike Textarea, the **box** changes here, not just the
// font (§0c).
export const Sizes = {
  render: () => [
    '<div class="grid gap-4 w-xs">',
    ...SIZES.map((size) => ({
      component: TextInput,
      props: { size, type: 'text', placeholder: SIZE_LABEL[size] },
    })),
    '</div>',
  ],
};

// 8. Disabled.
export const Disabled = {
  args: { type: 'text', placeholder: "You can't touch this", disabled: true },
};

// 9. With a datalist — `list` is a native attribute and the `<datalist>` is a
// sibling, so neither needs a prop.
export const WithDatalist = {
  render: () => [
    { component: TextInput, props: { type: 'text', placeholder: 'Which browser do you use', list: 'browsers' } },
    '<datalist id="browsers"><option value="Chrome"></option><option value="Firefox"></option><option value="Safari"></option><option value="Opera"></option><option value="Edge"></option></datalist>',
  ],
};

// 10–12. The date and time family.
export const TypeDate = { args: { type: 'date' } };
export const TypeTime = { args: { type: 'time' } };
export const TypeDatetimeLocal = { args: { type: 'datetime-local' } };

// 13. Username with icon and validator — the hint is **outside** the label, and
// the constraints are on the inner input.
export const UsernameValidator = {
  render: () =>
    validated(
      ICON.user,
      'type="text" required placeholder="Username" pattern="[A-Za-z][A-Za-z0-9\\-]*" minlength="3" maxlength="30" title="Only letters, numbers or dash" ',
      'Must be 3 to 30 characters<br/>containing only letters, numbers or dash',
    ),
};

// 14. Search with icon — the wrapper form with no validator.
export const SearchWithIcon = {
  render: () => [
    '<form class="w-full max-w-xs">',
    wrapped([ICON.search, inner('type="search" required placeholder="Search"')]),
    '</form>',
  ],
};

// 15. Email with icon and validator — the hint starts `hidden` and daisyUI
// reveals it on an invalid entry.
export const EmailValidator = {
  render: () => [
    '<form class="w-full max-w-xs">',
    wrapped([ICON.mail, inner('type="email" placeholder="mail@site.com" required')], { class: 'validator' }),
    '<div class="validator-hint hidden">Enter valid email address</div>',
    '</form>',
  ],
};

// 16. Email, validator, button and join — **no props are passed for the join**:
// the input reads `--join-ss` and friends off the wrapper, so its inner corners
// square themselves (§0f). Note the extra `<div>` around the label, which is
// what lets the hint sit under the field without breaking the row.
export const EmailValidatorJoin = {
  render: () => [
    '<form>',
    {
      component: Join,
      slots: {
        default: [
          '<div>',
          wrapped([ICON.mail, inner('type="email" placeholder="mail@site.com" required')], {
            class: 'validator join-item',
          }),
          '<div class="validator-hint hidden">Enter valid email address</div>',
          '</div>',
          { component: Button, props: { color: 'neutral', class: 'join-item' }, slots: { default: 'Join' } },
        ],
      },
    },
    '</form>',
  ],
};

// 17. Password with icon and validator.
export const PasswordValidator = {
  render: () =>
    validated(
      ICON.key,
      'type="password" required placeholder="Password" minlength="8" pattern="(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" title="Must be more than 8 characters, including number, lowercase letter, uppercase letter" ',
      'Must be more than 8 characters, including<br/>At least one number<br/>At least one lowercase letter<br/>At least one uppercase letter',
      'validator-hint hidden',
    ),
};

// 18. Number with validator — the only `as="input"` validator example, and the
// only place the per-size spinner offset is visible (§0c).
export const NumberValidator = {
  render: () => [
    '<form class="w-full max-w-xs">',
    {
      component: TextInput,
      props: {
        type: 'number',
        class: 'validator',
        required: true,
        placeholder: 'Type a number between 1 to 10',
        min: '1',
        max: '10',
        title: 'Must be between be 1 to 10',
      },
    },
    '<p class="validator-hint">Must be between be 1 to 10</p>',
    '</form>',
  ],
};

// 19. Telephone with icon and validator.
export const TelValidator = {
  render: () =>
    validated(
      ICON.phone,
      'type="tel" class="tabular-nums" required placeholder="Phone" pattern="[0-9]*" minlength="10" maxlength="10" title="Must be 10 digits" ',
      'Must be 10 digits',
    ),
};

// 20. URL with icon and validator.
export const UrlValidator = {
  render: () =>
    validated(
      ICON.link,
      'type="url" required placeholder="https://" value="https://" pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\\-].*[a-zA-Z0-9])?\\.)+[a-zA-Z].*$" title="Must be valid URL" ',
      'Must be valid URL',
    ),
};

// Regression guard, in both shapes: native input attributes survive on the
// field, and caller `class` merges after every variant class on the wrapper.
export const Passthrough = {
  render: () => [
    '<div class="grid gap-4 w-xs">',
    {
      component: TextInput,
      props: {
        color: 'primary',
        size: 'lg',
        ghost: true,
        type: 'email',
        id: 'input-1',
        'data-test': 'yes',
        style: 'letter-spacing:1px',
        class: 'mine',
        name: 'email',
        required: true,
        maxlength: 30,
        placeholder: 'Passthrough',
      },
    },
    wrapped([ICON.mail, inner('type="email" placeholder="wrapper form" ')], {
      color: 'accent',
      id: 'input-2',
      'data-test': 'yes',
      class: 'mine-label validator',
    }),
    '</div>',
  ],
};

