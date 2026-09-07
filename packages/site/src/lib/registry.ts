// Single source of truth for which components exist, their daisyUI category,
// sidebar order, and which named exports from `daisy-astro` belong to them.
// Sourced from plans/README.md's 68-component checklist (2026-09-07) — do not
// re-derive categories/order from anywhere else, and keep this in sync if the
// checklist changes.
//
// `slug` matches both the daisyUI doc-page slug and the filename of this
// component's content entry (src/content/components/<slug>.md) and example
// (src/examples/<Slug>.astro, PascalCase from `title`).

export type Category =
  | 'Actions'
  | 'Data Display'
  | 'Navigation'
  | 'Feedback'
  | 'Data Input'
  | 'Layout'
  | 'Mockup';

export interface ComponentEntry {
  slug: string;
  title: string;
  category: Category;
  /** Named exports from `daisy-astro` this doc page covers. */
  exports: string[];
}

export const CATEGORIES: Category[] = [
  'Actions',
  'Data Display',
  'Navigation',
  'Feedback',
  'Data Input',
  'Layout',
  'Mockup',
];

export const COMPONENTS: ComponentEntry[] = [
  // Actions
  { slug: 'button', title: 'Button', category: 'Actions', exports: ['Button'] },
  { slug: 'dropdown', title: 'Dropdown', category: 'Actions', exports: ['Dropdown'] },
  { slug: 'fab', title: 'FAB / Speed Dial', category: 'Actions', exports: ['Fab'] },
  { slug: 'modal', title: 'Modal', category: 'Actions', exports: ['Modal', 'ModalBox', 'ModalAction'] },
  { slug: 'swap', title: 'Swap', category: 'Actions', exports: ['Swap', 'SwapOn', 'SwapOff', 'SwapIndeterminate'] },
  { slug: 'theme-controller', title: 'Theme Controller', category: 'Actions', exports: ['ThemeController'] },

  // Data Display
  { slug: 'accordion', title: 'Accordion', category: 'Data Display', exports: ['Accordion'] },
  { slug: 'avatar', title: 'Avatar', category: 'Data Display', exports: ['Avatar', 'AvatarGroup'] },
  { slug: 'aura', title: 'Aura', category: 'Data Display', exports: ['Aura'] },
  { slug: 'badge', title: 'Badge', category: 'Data Display', exports: ['Badge'] },
  { slug: 'card', title: 'Card', category: 'Data Display', exports: ['Card', 'CardBody', 'CardTitle', 'CardActions'] },
  { slug: 'carousel', title: 'Carousel', category: 'Data Display', exports: ['Carousel', 'CarouselItem'] },
  { slug: 'chat-bubble', title: 'Chat bubble', category: 'Data Display', exports: ['Chat', 'ChatBubble', 'ChatHeader', 'ChatFooter'] },
  { slug: 'collapse', title: 'Collapse', category: 'Data Display', exports: ['Collapse'] },
  { slug: 'countdown', title: 'Countdown', category: 'Data Display', exports: ['Countdown', 'CountdownValue'] },
  { slug: 'diff', title: 'Diff', category: 'Data Display', exports: ['Diff'] },
  { slug: 'hover-3d-card', title: 'Hover 3D card', category: 'Data Display', exports: ['Hover3dCard'] },
  { slug: 'hover-gallery', title: 'Hover Gallery', category: 'Data Display', exports: ['HoverGallery'] },
  { slug: 'kbd', title: 'Kbd', category: 'Data Display', exports: ['Kbd'] },
  { slug: 'list', title: 'List', category: 'Data Display', exports: ['List', 'ListRow'] },
  { slug: 'stat', title: 'Stat', category: 'Data Display', exports: ['Stats', 'Stat', 'StatTitle', 'StatValue', 'StatDesc', 'StatFigure', 'StatActions'] },
  { slug: 'status', title: 'Status', category: 'Data Display', exports: ['Status'] },
  { slug: 'table', title: 'Table', category: 'Data Display', exports: ['Table'] },
  { slug: 'text-rotate', title: 'Text Rotate', category: 'Data Display', exports: ['TextRotate'] },
  { slug: 'timeline', title: 'Timeline', category: 'Data Display', exports: ['Timeline', 'TimelineItem', 'TimelineStart', 'TimelineMiddle', 'TimelineEnd'] },

  // Navigation
  { slug: 'breadcrumbs', title: 'Breadcrumbs', category: 'Navigation', exports: ['Breadcrumbs'] },
  { slug: 'dock', title: 'Dock', category: 'Navigation', exports: ['Dock', 'DockItem', 'DockLabel'] },
  { slug: 'link', title: 'Link', category: 'Navigation', exports: ['Link'] },
  { slug: 'megamenu', title: 'Megamenu', category: 'Navigation', exports: ['Megamenu', 'MegamenuItem'] },
  { slug: 'menu', title: 'Menu', category: 'Navigation', exports: ['Menu', 'MenuTitle'] },
  { slug: 'navbar', title: 'Navbar', category: 'Navigation', exports: ['Navbar', 'NavbarStart', 'NavbarCenter', 'NavbarEnd'] },
  { slug: 'pagination', title: 'Pagination', category: 'Navigation', exports: ['Join', 'Button'] },
  { slug: 'steps', title: 'Steps', category: 'Navigation', exports: ['Steps', 'Step', 'StepIcon'] },
  { slug: 'tab', title: 'Tab', category: 'Navigation', exports: ['Tabs', 'Tab', 'TabContent'] },

  // Feedback
  { slug: 'alert', title: 'Alert', category: 'Feedback', exports: ['Alert'] },
  { slug: 'loading', title: 'Loading', category: 'Feedback', exports: ['Loading'] },
  { slug: 'progress', title: 'Progress', category: 'Feedback', exports: ['Progress'] },
  { slug: 'radial-progress', title: 'Radial progress', category: 'Feedback', exports: ['RadialProgress'] },
  { slug: 'skeleton', title: 'Skeleton', category: 'Feedback', exports: ['Skeleton'] },
  { slug: 'toast', title: 'Toast', category: 'Feedback', exports: ['Toast'] },
  { slug: 'tooltip', title: 'Tooltip', category: 'Feedback', exports: ['Tooltip'] },

  // Data Input
  { slug: 'calendar', title: 'Calendar', category: 'Data Input', exports: ['Calendar'] },
  { slug: 'checkbox', title: 'Checkbox', category: 'Data Input', exports: ['Checkbox'] },
  { slug: 'fieldset', title: 'Fieldset', category: 'Data Input', exports: ['Fieldset', 'FieldsetLegend'] },
  { slug: 'file-input', title: 'File Input', category: 'Data Input', exports: ['FileInput'] },
  { slug: 'filter', title: 'Filter', category: 'Data Input', exports: ['Filter'] },
  { slug: 'label', title: 'Label', category: 'Data Input', exports: ['Label', 'FloatingLabel'] },
  { slug: 'radio', title: 'Radio', category: 'Data Input', exports: ['Radio'] },
  { slug: 'range', title: 'Range', category: 'Data Input', exports: ['Range'] },
  { slug: 'rating', title: 'Rating', category: 'Data Input', exports: ['Rating'] },
  { slug: 'select', title: 'Select', category: 'Data Input', exports: ['Select'] },
  { slug: 'text-input', title: 'Text Input', category: 'Data Input', exports: ['TextInput'] },
  { slug: 'textarea', title: 'Textarea', category: 'Data Input', exports: ['Textarea'] },
  { slug: 'toggle', title: 'Toggle', category: 'Data Input', exports: ['Toggle'] },
  { slug: 'validator', title: 'Validator', category: 'Data Input', exports: ['ValidatorHint'] },
  { slug: 'otp', title: 'OTP', category: 'Data Input', exports: ['Otp'] },

  // Layout
  { slug: 'divider', title: 'Divider', category: 'Layout', exports: ['Divider'] },
  { slug: 'drawer', title: 'Drawer sidebar', category: 'Layout', exports: ['Drawer', 'DrawerButton'] },
  { slug: 'footer', title: 'Footer', category: 'Layout', exports: ['Footer', 'FooterTitle'] },
  { slug: 'hero', title: 'Hero', category: 'Layout', exports: ['Hero', 'HeroContent', 'HeroOverlay'] },
  { slug: 'indicator', title: 'Indicator', category: 'Layout', exports: ['Indicator', 'IndicatorItem'] },
  { slug: 'join', title: 'Join (group items)', category: 'Layout', exports: ['Join'] },
  { slug: 'mask', title: 'Mask', category: 'Layout', exports: ['Mask'] },
  { slug: 'stack', title: 'Stack', category: 'Layout', exports: ['Stack'] },

  // Mockup
  { slug: 'browser-mockup', title: 'Browser', category: 'Mockup', exports: ['BrowserMockup'] },
  { slug: 'code-mockup', title: 'Code', category: 'Mockup', exports: ['CodeMockup'] },
  { slug: 'phone-mockup', title: 'Phone', category: 'Mockup', exports: ['PhoneMockup', 'PhoneMockupCamera', 'PhoneMockupDisplay'] },
  { slug: 'window-mockup', title: 'Window', category: 'Mockup', exports: ['WindowMockup'] },
];

export function componentsByCategory(): Array<{ category: Category; items: ComponentEntry[] }> {
  return CATEGORIES.map((category) => ({
    category,
    items: COMPONENTS.filter((c) => c.category === category),
  }));
}

// `import.meta.env.BASE_URL` is the raw `base` config value, with no
// guaranteed trailing slash (our config has none), so a naive
// `${base}components/...` template drops the "/" between them.
function siteBase(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '');
}

export function homeHref(): string {
  return `${siteBase()}/`;
}

export function componentHref(slug: string): string {
  return `${siteBase()}/components/${slug}/`;
}
