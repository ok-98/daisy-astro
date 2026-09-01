/// <reference types="astro/client" />
/// <reference types="@storybook-astro/framework/shim" />

// Cally's web components, used by src/components/Calendar/Calendar.astro.
//
// These are the library's FIRST non-standard elements, so this declaration is
// shared infrastructure rather than a per-component detail: `calendar-date` is
// not in Astro's IntrinsicElements, so without it both the element usage and
// any `HTMLAttributes<'calendar-date'>` are type errors
// (plans/components/calendar.md §3c).
//
// Cally itself is an OPTIONAL peer dependency — this package never imports it,
// and a consumer who forgets `import "cally"` gets an empty element with no
// error (plan §3a). Attribute names below are Cally 0.9.2's own props in their
// kebab-cased attribute form, read from its `dist/cally.d.ts`.
declare namespace astroHTML.JSX {
  interface CallyCalendarAttributes extends astroHTML.JSX.HTMLAttributes {
    value?: string;
    min?: string;
    max?: string;
    today?: string;
    locale?: string;
    months?: number | string;
    'first-day-of-week'?: number | string;
    'focused-date'?: string;
    'format-weekday'?: 'short' | 'narrow';
    'show-outside-days'?: boolean | string;
    'show-week-numbers'?: boolean | string;
    'page-by'?: string;
  }

  interface IntrinsicElements {
    'calendar-date': CallyCalendarAttributes;
    'calendar-range': CallyCalendarAttributes;
    'calendar-month': astroHTML.JSX.HTMLAttributes & {
      offset?: number | string;
    };
  }
}
