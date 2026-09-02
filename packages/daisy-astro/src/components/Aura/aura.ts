import type { HTMLAttributes } from 'astro/types';
import type { DaisySize } from '../../lib/variants';

/**
 * Aura's props and its class generation, extracted from `Aura.astro` so the
 * same mapping can be used without rendering the component — a caller putting
 * `aura` on their own element, another component composing it, or a test.
 *
 * The component's own behaviour is documented on `Aura.astro`; this file is
 * only the props-to-classes half of it.
 */
export type AuraVariant = 'dual' | 'rainbow' | 'holo' | 'gold' | 'silver' | 'glow';

export interface AuraProps extends HTMLAttributes<'div'> {
  /**
   * Named `variant`, never `style` — `style` is a native attribute
   * (plans/components/button.md §3a).
   *
   * **Only some of these follow `currentColor`.** The default, `dual` and
   * `glow` draw from it, so a `text-*` class tints them. `rainbow`, `holo`,
   * `gold` and `silver` use fixed palettes and ignore `text-*` entirely — so
   * `<Aura variant="gold" class="text-primary">` looks like it should work and
   * does nothing (plan §3a).
   */
  variant?: AuraVariant;
  /**
   * Thickness of the light ring only. It does **not** resize the wrapped
   * element — the sizes set a padding variable and nothing else.
   */
  size?: DaisySize;
}

// Full literal class names. NEVER `aura-${variant}` (plans/README.md §1b).
// They stay literals here for the same reason they were literals in the
// component: Tailwind scans source text, and this file is source text.
export const AURA_VARIANT: Record<AuraVariant, string> = {
  dual: 'aura-dual',
  rainbow: 'aura-rainbow',
  holo: 'aura-holo',
  gold: 'aura-gold',
  silver: 'aura-silver',
  glow: 'aura-glow',
};

export const AURA_SIZE: Record<DaisySize, string> = {
  xs: 'aura-xs',
  sm: 'aura-sm',
  md: 'aura-md',
  lg: 'aura-lg',
  xl: 'aura-xl',
};

/**
 * The classes an `<Aura>` root carries, in `class:list` shape — entries may be
 * `undefined`, which `class:list` drops. Outside an Astro template, join the
 * truthy entries yourself:
 *
 *     auraClass({ variant: 'gold' }).filter(Boolean).join(' ')   // "aura aura-gold"
 */
export function auraClass({ variant, size }: Pick<AuraProps, 'variant' | 'size'> = {}) {
  return ['aura', variant && AURA_VARIANT[variant], size && AURA_SIZE[size]];
}
