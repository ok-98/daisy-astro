import Button from './Button.astro';
import Loading from '../Loading/Loading.astro';

// No Meta/StoryObj annotations: Storybook 10 ships those types from framework
// packages (@storybook/react etc.) and @storybook-astro doesn't provide an
// equivalent, so stories are plain objects — the shape its own docs use.
// See plans/README.md §4.

const COLORS = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

// Most doc examples are "all N variants in a row", but a story renders one
// component instance. The framework's own slot values cover this: a story
// result may be a list mixing HTML strings with configured-component
// descriptors ({ component, props, slots }), so a sweep is a plain array — no
// DOM helpers, which is what plans/components/button.md §5 rules out.
type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const row = (...items: Item[]): Item[] => [
  '<div class="flex flex-wrap items-center gap-2">',
  ...items,
  '</div>',
];

const btn = (props: Record<string, unknown>, label: string): Item => ({
  component: Button,
  props,
  slots: { default: label },
});

// The heart icon daisyUI uses in its own icon and shape examples.
const HEART_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    as: { control: 'select', options: ['button', 'a', 'div'] },
    color: { control: 'select', options: [undefined, ...COLORS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
    variant: { control: 'select', options: [undefined, 'outline', 'dash', 'soft', 'ghost', 'link'] },
    shape: { control: 'select', options: [undefined, 'square', 'circle'] },
    width: { control: 'select', options: [undefined, 'wide', 'block'] },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

// Every prop wired to a control.
export const Playground = {
  args: {
    color: 'primary',
    slots: { default: 'Button' },
  },
};

// 1. Button
export const Default = {
  args: { slots: { default: 'Click me' } },
};

// 2. Button sizes
export const Sizes = {
  render: () =>
    row(
      btn({ size: 'xs' }, 'Xsmall'),
      btn({ size: 'sm' }, 'Small'),
      btn({ size: 'md' }, 'Medium'),
      btn({ size: 'lg' }, 'Large'),
      btn({ size: 'xl' }, 'Xlarge'),
    ),
};

// 3. Responsive button — breakpoint prefixes ride the class passthrough, not a
// prop; one `size` union cannot express five sizes at once (plan §4).
export const Responsive = {
  args: {
    size: 'xs',
    class: 'sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl',
    slots: { default: 'Responsive' },
  },
};

// 4. Buttons colors
export const Colors = {
  render: () => row(btn({}, 'Default'), ...COLORS.map((color) => btn({ color }, color))),
};

// 5. Soft buttons
export const Soft = {
  render: () =>
    row(
      btn({ variant: 'soft' }, 'Default'),
      ...COLORS.map((color) => btn({ variant: 'soft', color }, color)),
    ),
};

// 6. Outline buttons. 8. daisyUI's note about the neutral outline/dash button
// is a background-contrast caveat, not distinct markup — it stays a note here
// rather than becoming its own story.
export const Outline = {
  render: () =>
    row(
      btn({ variant: 'outline' }, 'Default'),
      ...COLORS.map((color) => btn({ variant: 'outline', color }, color)),
    ),
};

// 7. Dash buttons (same neutral caveat as Outline).
export const Dash = {
  render: () =>
    row(
      btn({ variant: 'dash' }, 'Default'),
      ...COLORS.map((color) => btn({ variant: 'dash', color }, color)),
    ),
};

// 9. Active buttons
export const Active = {
  render: () =>
    row(
      btn({ active: true }, 'Default'),
      ...COLORS.map((color) => btn({ active: true, color }, color)),
    ),
};

// 10. Buttons ghost and button link
export const GhostAndLink = {
  render: () => row(btn({ variant: 'ghost' }, 'Ghost'), btn({ variant: 'link' }, 'Link')),
};

// 11. Wide button
export const Wide = {
  args: { width: 'wide', slots: { default: 'Wide' } },
};

// 16. Button block
export const Block = {
  args: { width: 'block', slots: { default: 'Block' } },
};

// 12. Buttons with any HTML tags. `role="button"` is passed explicitly here,
// mirroring the doc example — the component never adds it to `as="a"` by
// itself, because that mis-announces a real navigating link (plan §4).
export const AnyHtmlTag = {
  render: () =>
    row(
      { component: Button, props: { as: 'a', role: 'button' }, slots: { default: 'Link' } },
      btn({ type: 'submit' }, 'Button'),
      { component: Button, props: { as: 'input', type: 'button', value: 'Input' } },
      { component: Button, props: { as: 'input', type: 'submit', value: 'Submit' } },
      '<form style="display:contents" autocomplete="off">',
      { component: Button, props: { as: 'input', type: 'radio', 'aria-label': 'Radio' } },
      { component: Button, props: { as: 'input', type: 'checkbox', 'aria-label': 'Checkbox' } },
      { component: Button, props: { as: 'input', type: 'reset', value: 'Reset' } },
      '</form>',
    ),
};

// 13. Disabled buttons — both forms. `<button>` takes the native attribute;
// `<a>` cannot, so it gets btn-disabled plus the a11y attributes (plan §3b).
export const Disabled = {
  render: () =>
    row(
      btn({ disabled: true }, 'Disabled using attribute'),
      {
        component: Button,
        props: { as: 'a', href: '#', disabled: true },
        slots: { default: 'Disabled using class name' },
      },
    ),
};

// The `<a>` branch of §3b on its own, as a focused regression story.
export const DisabledLink = {
  args: {
    as: 'a',
    href: '#',
    disabled: true,
    slots: { default: 'Disabled link' },
  },
};

// 14. Square button and circle button
export const Shapes = {
  render: () =>
    row(
      { component: Button, props: { shape: 'square' }, slots: { default: HEART_ICON } },
      { component: Button, props: { shape: 'circle' }, slots: { default: HEART_ICON } },
    ),
};

// 15. Button with Icon — icon and label both ride the default slot; no icon
// slot and no label prop (plan §2).
export const WithIcon = {
  render: () =>
    row(
      { component: Button, slots: { default: [HEART_ICON, 'Like'] } },
      { component: Button, slots: { default: ['Like', HEART_ICON] } },
    ),
};

// 17. Button with loading spinner — the real <Loading>, not a hardcoded
// `loading loading-spinner` span. The spinner takes no colour class: it is a
// mask over currentColor, so it inherits the button's foreground.
export const WithLoadingSpinner = {
  render: () =>
    row(
      {
        component: Button,
        props: { shape: 'square' },
        slots: { default: { component: Loading, props: { variant: 'spinner' } } },
      },
      {
        component: Button,
        slots: { default: [{ component: Loading, props: { variant: 'spinner' } }, 'loading'] },
      },
    ),
};

// 18. Login buttons. The doc page shows 18+ providers, each an inline brand SVG
// with hardcoded brand colours — a composition showcase that exercises no prop
// the other stories miss. Three representative providers; the rest are on
// https://daisyui.com/components/button/ (plan §5, Step 4).
const GITHUB_ICON =
  '<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"></path></svg>';

const GOOGLE_ICON =
  '<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>';

const APPLE_ICON =
  '<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1195 1195"><path fill="white" d="M1006.933 812.8c-32 153.6-115.2 211.2-147.2 249.6-32 25.6-121.6 25.6-153.6 6.4-38.4-25.6-134.4-25.6-166.4 0-44.8 32-115.2 19.2-128 12.8-256-179.2-352-716.8 12.8-774.4 64-12.8 134.4 32 134.4 32 51.2 25.6 70.4 12.8 115.2-6.4 96-44.8 243.2-44.8 313.6 76.8-147.2 96-153.6 294.4 19.2 403.2zM802.133 64c12.8 70.4-64 224-204.8 230.4-12.8-38.4 32-217.6 204.8-230.4z"></path></svg>';

export const LoginButtons = {
  render: () =>
    row(
      {
        component: Button,
        props: { class: 'bg-black text-white border-black' },
        slots: { default: [GITHUB_ICON, 'Login with GitHub'] },
      },
      {
        component: Button,
        props: { class: 'bg-white text-black border-[#e5e5e5]' },
        slots: { default: [GOOGLE_ICON, 'Login with Google'] },
      },
      {
        component: Button,
        props: { class: 'bg-black text-white border-black' },
        slots: { default: [APPLE_ICON, 'Login with Apple'] },
      },
    ),
};

// Beyond the doc page: one story combining the variant axes.
export const Variants = {
  args: {
    color: 'primary',
    size: 'lg',
    variant: 'outline',
    slots: { default: 'Primary large outline' },
  },
};

// Regression guard: the style axis is named `variant`, so a native `style`
// attribute must survive (§3a), and caller `class` must merge, not replace.
export const Passthrough = {
  args: {
    id: 'go',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: { default: 'Passthrough' },
  },
};
