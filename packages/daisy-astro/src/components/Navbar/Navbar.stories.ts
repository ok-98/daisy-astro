import Navbar from './Navbar.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/navbar/
export default {
  title: 'Components/Navbar',
  component: Navbar,
};

export const Default = {
  args: { slots: { default: 'Navbar' } },
};
