import Footer from './Footer.astro';
import FooterTitle from './FooterTitle.astro';
import Link from '../Link/Link.astro';
import Button from '../Button/Button.astro';
import Fieldset from '../Fieldset/Fieldset.astro';
import Label from '../Label/Label.astro';
import Join from '../Join/Join.astro';
import TextInput from '../TextInput/TextInput.astro';

// Columns are bare `<nav>`, `<aside>` and `<form>` — daisyUI styles every
// direct child by position, with no class, so there is no `FooterColumn`
// (plan §2).
//
// Nine of the ten doc examples reach for `sm:footer-horizontal` rather than the
// `direction` prop, which is why the class comes first here too (plan §3b).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const LOGO = (size = 50) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" class="fill-current"><path d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.323 1.016-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.517-2.435.811c-1.135.377-2.361-.234-2.734-1.363-.372-1.13.246-2.355 1.38-2.732l2.434-.811-1.706-5.121-2.434.811C1.058 12.043-.168 11.432.204 10.303c.372-1.13 1.598-1.74 2.732-1.365l2.434.812.84-2.517c.33-1.02 1.437-1.554 2.464-1.227 1.02.327 1.56 1.438 1.23 2.457l-.84 2.517 5.013 1.677.84-2.517c.33-1.02 1.437-1.554 2.464-1.227 1.02.327 1.56 1.438 1.23 2.457l-.84 2.517 2.434.811c1.135.377 1.753 1.602 1.38 2.732-.372 1.13-1.598 1.74-2.733 1.365z"></path></svg>`;

const SOCIAL_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>';

const socials = (wrapperClass = 'grid grid-flow-col gap-4') =>
  `<div class="${wrapperClass}">${`<button>${SOCIAL_ICON}</button>`.repeat(3)}</div>`;

const title = (text: string): Item => ({ component: FooterTitle, slots: { default: text } });

const link = (text: string): Item => ({
  component: Link,
  props: { as: 'button', hover: true },
  slots: { default: text },
});

const column = (heading: string | null, links: string[]): Item[] => [
  '<nav>',
  ...(heading ? [title(heading)] : []),
  ...links.map(link),
  '</nav>',
];

const SERVICES = ['Branding', 'Design', 'Marketing', 'Advertisement'];
const COMPANY = ['About us', 'Contact', 'Jobs', 'Press kit'];
const LEGAL = ['Terms of use', 'Privacy policy', 'Cookie policy'];

const THREE_COLUMNS: Item[] = [
  ...column('Services', SERVICES),
  ...column('Company', COMPANY),
  ...column('Legal', LEGAL),
];

const RESPONSIVE = 'sm:footer-horizontal';

export default {
  title: 'Components/Footer',
  component: Footer,
  argTypes: {
    direction: { control: 'inline-radio', options: [undefined, 'horizontal', 'vertical'] },
    center: { control: 'boolean' },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { class: `${RESPONSIVE} p-10 bg-neutral text-neutral-content rounded`, slots: { default: THREE_COLUMNS } },
};

// 1. Vertical by default, horizontal from `sm` — **the class, not the prop**
// (§3b).
export const Default = {
  args: { class: `${RESPONSIVE} p-10 bg-neutral text-neutral-content rounded`, slots: { default: THREE_COLUMNS } },
};

// 2. With a logo column — an `<aside>`, which is the semantics for a
// non-navigation block. No class on it; daisyUI styles it by position (§2).
export const WithLogo = {
  args: {
    class: `${RESPONSIVE} p-10 bg-base-200 text-base-content rounded`,
    slots: {
      default: [
        `<aside>${LOGO()}<p>ACME Industries Ltd.<br/>Providing reliable tech since 1992</p></aside>`,
        ...THREE_COLUMNS,
      ],
    },
  },
};

// 3. With a form column — composes the real `Fieldset`, `Label`, `Join`,
// `TextInput` and `Button`.
export const WithForm = {
  args: {
    class: `${RESPONSIVE} p-10 bg-base-200 text-base-content rounded`,
    slots: {
      default: [
        ...THREE_COLUMNS,
        '<form>',
        title('Newsletter'),
        {
          component: Fieldset,
          props: { class: 'w-80' },
          slots: {
            default: [
              { component: Label, props: { as: 'label', for: 'footer-email' }, slots: { default: 'Enter your email address' } },
              {
                component: Join,
                slots: {
                  default: [
                    { component: TextInput, props: { class: 'join-item', id: 'footer-email', placeholder: 'username@site.com' } },
                    { component: Button, props: { class: 'join-item', color: 'primary' }, slots: { default: 'Subscribe' } },
                  ],
                },
              },
            ],
          },
        },
        '</form>',
      ],
    },
  },
};

// 4. Logo and social icons — the icons are wrapped in a `div` **on purpose**:
// a column's own `.5rem` grid gap would otherwise space them, so the wrapper
// takes that back with `grid grid-flow-col gap-4` (§3d).
export const WithLogoAndSocial = {
  args: {
    class: `${RESPONSIVE} p-10 bg-neutral text-neutral-content rounded`,
    slots: {
      default: [
        `<aside>${LOGO()}<p>ACME Industries Ltd.<br/>Providing reliable tech since 1992</p></aside>`,
        '<nav>',
        title('Social'),
        socials(),
        '</nav>',
      ],
    },
  },
};

// 5. Copyright only — one `aside`, centred.
export const WithCopyright = {
  args: {
    center: true,
    class: `${RESPONSIVE} p-4 bg-base-300 text-base-content rounded`,
    slots: { default: '<aside><p>Copyright © 2026 - All right reserved by ACME Industries Ltd</p></aside>' },
  },
};

// 6. Copyright and social icons.
export const CopyrightAndSocial = {
  args: {
    class: `${RESPONSIVE} items-center p-4 bg-neutral text-neutral-content rounded`,
    slots: {
      default: [
        `<aside class="items-center grid-flow-col">${LOGO(36)}<p>Copyright © 2026 - All right reserved</p></aside>`,
        `<nav class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">${socials('contents')}</nav>`,
      ],
    },
  },
};

// 7. Links and social icons.
export const LinksAndSocial = {
  args: {
    class: `${RESPONSIVE} p-10 bg-base-300 text-base-content rounded`,
    slots: {
      default: [...column('Services', SERVICES), ...column('Company', COMPANY), '<nav>', title('Social'), socials(), '</nav>'],
    },
  },
};

// 8. Two rows — `grid-rows-2` is a caller class; six columns then wrap into
// two rows of three.
export const TwoRows = {
  args: {
    class: `${RESPONSIVE} grid-rows-2 p-10 bg-neutral text-neutral-content rounded`,
    slots: {
      default: [
        ...THREE_COLUMNS,
        ...column('Social', ['Twitter', 'Instagram', 'Facebook', 'GitHub']),
        ...column('Explore', ['Features', 'Enterprise', 'Security', 'Pricing']),
        ...column('Apps', ['Mac', 'Windows', 'iPhone', 'Android']),
      ],
    },
  },
};

// 9. Centred, with logo and social icons — note this one uses the **prop**
// (`footer-horizontal`) rather than the responsive class, and combines it with
// `center`, which per §3c flows in **rows**.
export const CenteredWithLogoAndSocial = {
  args: {
    direction: 'horizontal',
    center: true,
    class: 'p-10 bg-primary text-primary-content rounded',
    slots: {
      default: [
        `<aside>${LOGO()}<p class="font-bold">ACME Industries Ltd. <br/>Providing reliable tech since 1992</p><p>Copyright © 2026 - All right reserved</p></aside>`,
        '<nav>',
        socials(),
        '</nav>',
      ],
    },
  },
};

// 10. Centred, with links and social icons.
export const CenteredWithSocial = {
  args: {
    direction: 'horizontal',
    center: true,
    class: 'p-10 bg-base-200 text-base-content rounded',
    slots: {
      default: [
        '<nav class="grid grid-flow-col gap-4">',
        ...COMPANY.map(link),
        '</nav><nav>',
        socials(),
        '</nav>',
        '<aside><p>Copyright © 2026 - All right reserved by ACME Industries Ltd</p></aside>',
      ],
    },
  },
};

// 11. Two footers stacked — the second is a thin bar with its own border, and
// takes no direction at all.
export const TwoFooters = {
  render: () => [
    '<div class="w-full">',
    {
      component: Footer,
      props: { class: `${RESPONSIVE} p-10 bg-base-200 text-base-content` },
      slots: { default: THREE_COLUMNS },
    },
    {
      component: Footer,
      props: { class: 'px-10 py-4 border-t bg-base-200 text-base-content border-base-300' },
      slots: {
        default: [
          `<aside class="items-center grid-flow-col">${LOGO(24)}<p>ACME Industries Ltd. <br/>Providing reliable tech since 1992</p></aside>`,
          `<nav class="md:place-self-center md:justify-self-end">${socials()}</nav>`,
        ],
      },
    },
    '</div>',
  ],
};

// Beyond the doc page: all five combinations from §3c's table, because the
// interaction is not guessable from the names — **`horizontal` + `center`
// flows in rows**, which is the opposite of what either word suggests.
export const Placements = {
  render: () =>
    (
      [
        [{}, 'default — row'],
        [{ direction: 'horizontal' }, 'horizontal — column'],
        [{ center: true }, 'center — column dense'],
        [{ direction: 'horizontal', center: true }, 'horizontal + center — rows again'],
        [{ direction: 'vertical', center: true }, 'vertical + center — column dense'],
      ] as Array<[Record<string, unknown>, string]>
    ).flatMap(([props, label]) => [
      `<div class="text-xs opacity-60 mt-4 mb-1">${label}</div>`,
      {
        component: Footer,
        props: { ...props, class: 'p-6 bg-base-200 text-base-content rounded' },
        slots: { default: [...column('Services', SERVICES.slice(0, 2)), ...column('Company', COMPANY.slice(0, 2))] },
      },
    ]),
};

// Beyond the doc page: the advice in §3b made concrete. The first is what
// daisyUI's examples do — stacked below `sm`, spread above it. The second is
// the prop, which is horizontal at every width.
export const ResponsiveVsProp = {
  render: () => [
    '<div class="text-xs opacity-60 mb-1">class="sm:footer-horizontal" — responsive, and what you usually want</div>',
    {
      component: Footer,
      props: { class: `${RESPONSIVE} p-6 bg-base-200 text-base-content rounded` },
      slots: { default: THREE_COLUMNS },
    },
    '<div class="text-xs opacity-60 mt-4 mb-1">direction="horizontal" — horizontal at every width</div>',
    {
      component: Footer,
      props: { direction: 'horizontal', class: 'p-6 bg-base-200 text-base-content rounded' },
      slots: { default: THREE_COLUMNS },
    },
  ],
};

// Regression guard, at two levels: native attributes survive on the footer and
// on the title, `class` merges after both modifier classes, and the title's
// polymorphic root really changes.
export const Passthrough = {
  args: {
    direction: 'horizontal',
    center: true,
    id: 'footer-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine p-10 bg-base-200 text-base-content rounded',
    slots: {
      default: [
        '<nav>',
        {
          component: FooterTitle,
          props: { as: 'h3', id: 'title-1', 'data-test': 'title', class: 'title-marker' },
          slots: { default: 'Passthrough' },
        },
        link('Branding'),
        '</nav>',
      ],
    },
  },
};
