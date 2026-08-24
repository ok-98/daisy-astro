/**
 * Shared daisyUI variant unions, reused across component Props interfaces.
 * Import the axes a component actually supports — don't force every
 * component onto every axis (check the component's own daisyUI doc page).
 * See plans/README.md and plans/TEMPLATE.md.
 */

export type DaisyColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type DaisySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
