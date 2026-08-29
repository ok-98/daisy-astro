import Avatar from './Avatar.astro';
import AvatarGroup from './AvatarGroup.astro';

// Members are real <Avatar> components, not raw markup: nesting a component
// with its own props and slots through `args.slots` is settled — see
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3. (avatar.md §5 hedged on this.)

const IMGS = [
  'https://img.daisyui.com/images/profile/demo/batperson@192.webp',
  'https://img.daisyui.com/images/profile/demo/spiderperson@192.webp',
  'https://img.daisyui.com/images/profile/demo/averagebulk@192.webp',
  'https://img.daisyui.com/images/profile/demo/distracted1@192.webp',
];

const member = (src: string) => ({
  component: Avatar,
  props: { innerClass: 'w-12' },
  slots: { default: `<img src="${src}" alt="Tailwind-CSS-Avatar-component" />` },
});

export default {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
};

// 8. Avatar group. The overlap comes from `-space-x-6`, a plain Tailwind
// utility — `avatar-group` itself is only `display:flex; overflow:hidden`
// (avatar.md §3d). Members are forced to bordered circles by
// `.avatar-group .avatar`, whatever their own rounding says (§3b).
export const Default = {
  args: {
    class: '-space-x-6',
    slots: { default: IMGS.map(member) },
  },
};

// 9. Avatar group with counter — last member is a placeholder holding the
// overflow count instead of an image.
export const WithCounter = {
  args: {
    class: '-space-x-6',
    slots: {
      default: [
        ...IMGS.slice(0, 3).map(member),
        {
          component: Avatar,
          props: {
            placeholder: true,
            innerClass: 'bg-neutral text-neutral-content w-12',
          },
          slots: { default: '<span>+99</span>' },
        },
      ],
    },
  },
};
