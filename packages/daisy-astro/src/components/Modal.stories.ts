import Modal from './Modal.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/modal/
export default {
  title: 'Components/Modal',
  component: Modal,
};

export const Default = {
  args: { slots: { default: 'Modal' } },
};
