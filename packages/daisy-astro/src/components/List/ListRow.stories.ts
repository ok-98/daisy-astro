import ListRow from './ListRow.astro';
import List from './List.astro';

// A row is styled through its parent, and is an `<li>`, so it only means
// anything inside a `List` (plan §3d).

const thumb = '<div><img class="size-10 rounded-box" alt="row" src="https://img.daisyui.com/images/profile/demo/1@94.webp" /></div>';
const text = '<div><div>Dio Lupa</div><div class="text-xs uppercase font-semibold opacity-60">Remaining Reason</div></div>';

const inList = (props: Record<string, unknown>, children: unknown[]) => [
  {
    component: List,
    props: { class: 'bg-base-100 rounded-box shadow-md' },
    slots: {
      default: [
        { component: ListRow, props, slots: { default: children } },
        { component: ListRow, slots: { default: [thumb, text] } },
      ],
    },
  },
];

export default {
  title: 'Components/List/ListRow',
  component: ListRow,
  argTypes: { class: { control: 'text' } },
};

// The default layout: the second child grows (plan §3a).
export const Playground = {
  render: () => inList({}, [thumb, text, '<button class="btn btn-square btn-ghost">▶</button>']),
};

// `list-col-wrap` on a child drops it to a second row, keeping its column —
// so it starts under the text block rather than at the left edge (plan §3b).
export const WrappedChild = {
  render: () =>
    inList({}, [
      thumb,
      text,
      '<p class="list-col-wrap text-xs">A second row that keeps its column position.</p>',
    ]),
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  render: () =>
    inList(
      { id: 'list-row-1', 'data-test': 'yes', style: 'letter-spacing:2px', class: 'mine' },
      [thumb, text],
    ),
};
