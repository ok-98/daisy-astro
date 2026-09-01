import Table from './Table.astro';
import Checkbox from '../Checkbox/Checkbox.astro';
import Avatar from '../Avatar/Avatar.astro';
import Badge from '../Badge/Badge.astro';
import Button from '../Button/Button.astro';

// Every story supplies its own scroll container, because daisyUI's examples do
// and they differ — height, width, border and background all vary (plan §0e).
//
// The rows are plain `<thead>` / `<tbody>` markup: daisyUI gives the table's
// parts no classes, so there are no sub-components to compose (plan §0d).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const PEOPLE: Array<[string, string, string]> = [
  ['Cy Ganderton', 'Quality Control Specialist', 'Blue'],
  ['Hart Hagerty', 'Desktop Support Technician', 'Purple'],
  ['Brice Swyre', 'Tax Accountant', 'Red'],
];

const HEAD = '<thead><tr><th></th><th>Name</th><th>Job</th><th>Favorite Color</th></tr></thead>';

const body = (rowClass: (i: number) => string = () => '') =>
  `<tbody>${PEOPLE.map(
    ([name, job, colour], i) =>
      `<tr${rowClass(i) ? ` class="${rowClass(i)}"` : ''}><th>${i + 1}</th><td>${name}</td><td>${job}</td><td>${colour}</td></tr>`,
  ).join('')}</tbody>`;

const ROWS = [HEAD, body()];

// The wrapper is the caller's, so it is written out per story rather than
// hidden in a decorator — which is also what makes §0e visible.
const wrapped = (children: Item[], cls = 'overflow-x-auto'): Item[] => [`<div class="${cls}">`, ...children, '</div>'];

const table = (props: Record<string, unknown>, children: Item[] = ROWS): Item => ({
  component: Table,
  props,
  slots: { default: children },
});

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export default {
  title: 'Components/Table',
  component: Table,
  argTypes: {
    size: { control: 'select', options: [undefined, ...SIZES] },
    zebra: { control: 'boolean' },
    pinRows: { control: 'boolean' },
    pinCols: { control: 'boolean' },
  },
};

export const Playground = {
  render: (args: Record<string, unknown>) => wrapped([table(args)]),
  args: {},
};

// 1. Table.
export const Default = {
  render: () => wrapped([table({})]),
};

// 2. With border and background — on the **wrapper**, which is the only place
// the table's own border radius becomes visible (§0e).
export const WithBorderAndBackground = {
  render: () => wrapped([table({})], 'overflow-x-auto rounded-box border border-base-content/5 bg-base-100'),
};

// 3. An active row — a plain Tailwind class on the row.
export const ActiveRow = {
  render: () => wrapped([table({}, [HEAD, body((i) => (i === 0 ? 'bg-base-200' : ''))])]),
};

// 4. A row that highlights on hover — **`hover:bg-base-300`, not `row-hover`.**
// daisyUI still ships the `row-hover` CSS but has dropped it from the
// documented surface, and its own example uses the Tailwind utility (§0b).
export const RowHover = {
  render: () => wrapped([table({}, [HEAD, body((i) => (i === 1 ? 'hover:bg-base-300' : ''))])]),
};

// 5. Zebra — stripes `tbody` only; the head and foot are untouched.
export const Zebra = {
  render: () => wrapped([table({ zebra: true })]),
};

// 6. Visual elements — the integration story, composing the real `Checkbox`,
// `Avatar` (with a `mask`), `Badge` and `Button`.
export const VisualElements = {
  render: () =>
    wrapped([
      table({}, [
        '<thead><tr><th><label>',
        { component: Checkbox },
        '</label></th><th>Name</th><th>Job</th><th>Favorite Color</th><th></th></tr></thead><tbody>',
        ...[
          ['2@94', 'Hart Hagerty', 'United States', 'Zemlak, Daniel and Leannon', 'Desktop Support Technician', 'Purple'],
          ['3@94', 'Brice Swyre', 'China', 'Carroll Group', 'Tax Accountant', 'Red'],
          ['4@94', 'Marjy Ferencz', 'Russia', 'Rowe-Schoen', 'Office Assistant I', 'Crimson'],
          ['5@94', 'Yancy Tear', 'Brazil', 'Wyman-Ledner', 'Community Outreach Specialist', 'Indigo'],
        ].flatMap(([img, name, country, company, role, colour]) => [
          '<tr><th><label>',
          { component: Checkbox },
          '</label></th><td><div class="flex items-center gap-3">',
          {
            component: Avatar,
            props: { innerClass: 'w-12 h-12 mask mask-squircle' },
            slots: {
              default: `<img src="https://img.daisyui.com/images/profile/demo/${img}.webp" alt="Avatar Tailwind CSS Component" />`,
            },
          },
          `<div><div class="font-bold">${name}</div><div class="text-sm opacity-50">${country}</div></div></div></td><td>${company}<br/>`,
          { component: Badge, props: { variant: 'ghost', size: 'sm' }, slots: { default: role } },
          `</td><td>${colour}</td><th>`,
          { component: Button, props: { variant: 'ghost', size: 'xs' }, slots: { default: 'details' } },
          '</th></tr>',
        ]),
        '</tbody><tfoot><tr><th></th><th>Name</th><th>Job</th><th>Favorite Color</th><th></th></tr></tfoot>',
      ]),
    ]),
};

// 7. Table xs — the doc page's densest example: seven columns, twenty rows and
// a repeated head in the foot.
export const SizeXs = {
  render: () => {
    const head =
      '<tr><th></th><th>Name</th><th>Job</th><th>company</th><th>location</th><th>Last Login</th><th>Favorite Color</th></tr>';
    const rows = Array.from({ length: 20 }, (_, i) =>
      `<tr><th>${i + 1}</th><td>${PEOPLE[i % 3][0]}</td><td>${PEOPLE[i % 3][1]}</td><td>Carroll Group</td><td>China</td><td>12/16/2020</td><td>${PEOPLE[i % 3][2]}</td></tr>`,
    ).join('');
    return wrapped([table({ size: 'xs' }, [`<thead>${head}</thead><tbody>${rows}</tbody><tfoot>${head}</tfoot>`])]);
  },
};

// 8. Pinned rows — **every** `thead` and `tfoot` becomes sticky, which is why
// the doc example interleaves many head/body pairs inside one table. Valid
// HTML, and the sticky behaviour depends on it (§0c).
export const PinnedRows = {
  render: () =>
    wrapped(
      [
        table({ pinRows: true, class: 'bg-base-200' }, [
          ['A', 'B', 'C']
            .map(
              (letter) =>
                `<thead><tr><th>${letter}</th></tr></thead><tbody>${PEOPLE.map(
                  ([name]) => `<tr><td>${letter}. ${name}</td></tr>`,
                ).join('')}</tbody>`,
            )
            .join(''),
        ]),
      ],
      'h-96 overflow-x-auto',
    ),
};

// 9. Pinned rows **and** columns — and note the header row: the first and last
// cells are `<th>` and everything between them is `<td>`. That inversion is not
// a typo, it is the whole mechanism: `table-pin-cols` pins every `th`, so the
// cells you want pinned are the ones written as `th` (§0c).
export const PinnedRowsAndCols = {
  render: () => {
    const head =
      '<tr><th></th><td>Name</td><td>Job</td><td>company</td><td>location</td><td>Last Login</td><td>Favorite Color</td><th></th></tr>';
    const rows = Array.from({ length: 12 }, (_, i) => {
      const [name, job, colour] = PEOPLE[i % 3];
      return `<tr><th>${name}</th><td>${name}</td><td>${job}</td><td>Carroll Group</td><td>China</td><td>12/16/2020</td><td>${colour}</td><th>${name}</th></tr>`;
    }).join('');
    return wrapped(
      [table({ pinRows: true, pinCols: true, size: 'xs' }, [`<thead>${head}</thead><tbody>${rows}</tbody><tfoot>${head}</tfoot>`])],
      'overflow-x-auto h-96 w-96',
    );
  },
};

// Beyond the doc page: all five sizes, which change cell padding and body font
// size together.
export const Sizes = {
  render: () =>
    SIZES.flatMap((size) => [
      `<div class="text-xs opacity-60 mt-4 mb-1">size="${size}"</div>`,
      ...wrapped([table({ size })]),
    ]),
};

// Beyond the doc page: the responsive escape hatch. daisyUI emits all nine of
// its classes at every breakpoint, so a size ladder is a caller class — there
// is no object-valued `size` prop, and there cannot be one, since it would have
// to interpolate class names (§0a).
export const ResponsiveSize = {
  render: () => wrapped([table({ class: 'table-xs lg:table-lg' })]),
};

// Regression guard: `summary` is a real `TableHTMLAttributes` member, so it
// proves the table's own attribute interface is inherited rather than just the
// base one.
export const Passthrough = {
  render: () =>
    wrapped([
      table({
        size: 'lg',
        zebra: true,
        pinRows: true,
        pinCols: true,
        id: 'table-1',
        'data-test': 'yes',
        style: 'letter-spacing:1px',
        class: 'mine',
        summary: 'Passthrough table',
      }),
    ]),
};
