import ChatBubble from './ChatBubble.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/chat-bubble/
export default {
  title: 'Components/ChatBubble',
  component: ChatBubble,
};

export const Default = {
  args: { slots: { default: 'ChatBubble' } },
};
