import TextRotate from './TextRotate.astro';

export default { title: 'Components/_TR', component: TextRotate };

// plain text lines — the case the new frontmatter branch is meant to handle
export const PlainLines = { args: { slots: { default: 'ONE\nTWO\nTHREE' } } };

// element items — the documented case
export const ElementItems = { args: { slots: { default: '<span>ONE</span><span>TWO</span>' } } };

// entity, to see whether the string round-trip escapes twice
export const Entity = { args: { slots: { default: 'A & B\nC < D' } } };

// blank slot — the only case the current predicate is actually true for
export const Blank = { args: { slots: { default: '   \n  ' } } };
