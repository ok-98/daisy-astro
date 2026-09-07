/// <reference types="astro/client" />

// Cally's web components, used by the Calendar example. Duplicated from
// packages/daisy-astro/src/env.d.ts (not reachable via a subpath import — the
// package's `exports` map doesn't expose src/env.d.ts) — keep in sync if
// daisy-astro's cally version or attribute set changes.
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
