import './preview.css';
// Registers Cally's custom elements for the Calendar stories. This is a
// devDependency of the package and an OPTIONAL peer for consumers, who do this
// import once in their own layout — the component never imports it
// (plans/components/calendar.md §3a).
import 'cally';

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
