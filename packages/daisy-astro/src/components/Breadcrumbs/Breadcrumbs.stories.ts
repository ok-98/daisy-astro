import Breadcrumbs from './Breadcrumbs.astro';

// NOTE: these stories render a `nav` root where the daisyUI doc page shows a
// `div` (plan §3b). The inner markup matches the page exactly; `AsDiv`
// reproduces the page's root too, for a byte-for-byte comparison.

const ITEMS = '<li><a>Home</a></li><li><a>Documents</a></li><li>Add Document</li>';

// The doc page's own icons, unchanged.
const FOLDER_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-4 w-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>';
const DOC_PLUS_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-4 w-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';

const ICON_ITEMS =
  `<li><a>${FOLDER_ICON}Home</a></li>` +
  `<li><a>${FOLDER_ICON}Documents</a></li>` +
  `<li><span class="inline-flex items-center gap-2">${DOC_PLUS_ICON}Add Document</span></li>`;

export default {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  argTypes: {
    as: { control: 'text' },
    listAs: { control: 'radio', options: ['ul', 'ol', 'menu'] },
    'aria-label': { control: 'text' },
  },
};

export const Playground = {
  args: { class: 'text-sm', slots: { default: ITEMS } },
};

// 1. Breadcrumbs
export const Default = {
  args: { class: 'text-sm', slots: { default: ITEMS } },
};

// 2. Breadcrumbs with icons — the `gap: .5rem` that spaces icon from text comes
// from daisyUI's `li > *` rule, so no wrapper class is needed on the links.
export const WithIcons = {
  args: { class: 'text-sm', slots: { default: ICON_ITEMS } },
};

// 3. Breadcrumbs with max-width — `.breadcrumbs` is `overflow-x: auto` with
// `white-space: nowrap`, so this scrolls sideways rather than wrapping.
export const MaxWidth = {
  args: {
    class: 'max-w-xs text-sm',
    slots: {
      default: [1, 2, 3, 4, 5].map((n) => `<li>Long text ${n}</li>`).join(''),
    },
  },
};

// Beyond the doc page: `aria-current` is the caller's job, and it lands on the
// item, not on this component. The first trail marks the last crumb properly
// and neutralises daisyUI's `cursor: pointer` on it; the second uses a bare
// `<span>`, which still looks clickable and is not (§3b, §3e).
export const CurrentPage = {
  args: {
    class: 'text-sm',
    slots: {
      default:
        '<li><a>Home</a></li><li><a>Documents</a></li>' +
        '<li><span aria-current="page" class="cursor-default no-underline hover:no-underline">Add Document</span></li>' +
        '<li><span>looks clickable, is not</span></li>',
    },
  },
};

// Beyond the doc page: identical to `Default` on purpose. daisyUI's selector
// names ul, ol and menu and styles them the same, so `ol` costs nothing and is
// the stronger markup for an ordered path (§3c).
export const OrderedList = {
  args: { listAs: 'ol', class: 'text-sm', slots: { default: ITEMS } },
};

// Beyond the doc page: daisyUI's literal root, for anyone diffing against the
// page. No landmark and no label — which is why `nav` is the default (§3b).
export const AsDiv = {
  args: { as: 'div', class: 'text-sm', slots: { default: ITEMS } },
};

// Regression guard: native attributes survive, caller `class` merges, and the
// `aria-label` default is overridable rather than hardcoded.
export const Passthrough = {
  args: {
    id: 'crumbs-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine text-sm',
    'aria-label': 'You are here',
    slots: { default: ITEMS },
  },
};
