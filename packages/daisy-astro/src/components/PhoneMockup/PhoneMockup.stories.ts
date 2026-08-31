import PhoneMockup from './PhoneMockup.astro';
import PhoneMockupCamera from './PhoneMockupCamera.astro';
import PhoneMockupDisplay from './PhoneMockupDisplay.astro';

// The camera and the display share one grid cell — the camera sits over the
// display — so their order in the slot does not matter (plan §3a).

const camera = { component: PhoneMockupCamera };

const display = (inner: string, cls?: string) => ({
  component: PhoneMockupDisplay,
  ...(cls ? { props: { class: cls } } : {}),
  slots: { default: inner },
});

const WALLPAPER = 'https://img.daisyui.com/images/stock/453966.webp';

export default {
  title: 'Components/PhoneMockup',
  component: PhoneMockup,
  // No variant argTypes — this component has none.
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: {
    slots: {
      default: [camera, display('It\'s Glowtime.', 'text-white grid place-content-center')],
    },
  },
};

// 1. Phone mockup.
export const Default = {
  args: {
    slots: {
      default: [camera, display('It\'s Glowtime.', 'text-white grid place-content-center')],
    },
  },
};

// 2. With colored border — a literal arbitrary value, because the bezel is a
// hard-coded grey rather than a theme token (§3b).
export const ColoredBorder = {
  args: {
    class: 'border-[#ff8938]',
    slots: {
      default: [camera, display('It\'s Glowtime.', 'text-white grid place-content-center')],
    },
  },
};

// 3. With a wallpaper image — the image fills the screen through a
// direct-child rule, so it must not be wrapped (§3d).
export const WithImage = {
  args: {
    slots: {
      default: [camera, display(`<img alt="wallpaper" src="${WALLPAPER}" />`)],
    },
  },
};

// Beyond the doc page: the aspect ratio is fixed at 462/978, so only the width
// is yours — `w-*` or a narrower container, never `h-*` (§3c).
export const Widths = {
  render: () => [
    '<div class="flex flex-wrap items-start gap-4">',
    {
      component: PhoneMockup,
      props: { class: 'w-40' },
      slots: { default: [camera, display('w-40', 'text-white grid place-content-center')] },
    },
    {
      component: PhoneMockup,
      props: { class: 'w-64' },
      slots: { default: [camera, display('w-64', 'text-white grid place-content-center')] },
    },
    '</div>',
  ],
};

// Regression guard, at two levels: native attributes survive and caller
// `class` merges on the frame and on the display.
export const Passthrough = {
  args: {
    id: 'phone-1',
    'data-test': 'yes',
    style: 'opacity:.95',
    class: 'mine w-64',
    slots: {
      default: [
        camera,
        {
          component: PhoneMockupDisplay,
          props: {
            id: 'phone-display-1',
            'data-test': 'display',
            class: 'display-marker text-white grid place-content-center',
          },
          slots: { default: 'Passthrough' },
        },
      ],
    },
  },
};
