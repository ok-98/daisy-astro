# daisy-astro

## 0.1.0

### Minor Changes

- c486048: feat(alert,card): implement Stage 2's first two, and clear Aura's fallback
- d6f5da0: feat(avatar): implement Avatar + AvatarGroup with doc-example stories
- a14f555: feat(badge): implement Badge with doc-example stories
- 30c92f7: feat(breadcrumbs,countdown): implement both; a bare > also breaks Props inference
- f7bada5: feat(button): full doc-example stories, plus Tier 0 storybook prerequisites
- c383b5e: feat(calendar): wrap Cally, at the scope the plan asked to confirm
- 54196b2: feat(carousel): implement Carousel and CarouselItem, with no JavaScript
- 6a9d21b: feat(chat-bubble): implement Chat, ChatBubble, ChatHeader, ChatFooter
- b578787: feat(checkbox): implement colour and size, fixing the scaffold's missing type
- ac6b3b0: feat(collapse): implement all four triggers, and Accordion as a group wrapper
- 0339114: feat(diff): implement, with the fixed three-child structure owned by the component
- bb8882d: feat(divider,progress,skeleton): implement three leaves
- c580d4c: feat(dock): implement Dock, DockItem and DockLabel; document the two setup lines
- 6c1843f: feat(drawer): implement the skeleton, plus the toggleClass §4 was missing
- 47dc533: feat(dropdown): implement both wrapper methods, dropping §4's content wrapper
- 900277b: feat(effects): implement Aura, Hover3dCard, HoverGallery and TextRotate
- c9b79ee: feat(fab): implement, adding the triggerClass prop §4 was missing
- bfbc7cc: feat(fieldset): implement Fieldset and FieldsetLegend as the native elements
- b04e3df: feat(file-input): implement, and fix multiple={false} rendering as enabled
- 9d69109: feat(filter): implement, and amend button.md with the aria-label rule
- e158e32: feat(footer): implement the grid of grids, with columns as bare elements
- c390e3c: feat(hero): implement the one-cell grid, and make the empty overlay say so
- ae1c3a5: feat(indicator): implement, and correct what "compose the real component" means
- 1ee721a: feat(join): implement the group wrapper, with no JoinItem and no direct-child rule
- 28713ee: feat(kbd,status): implement both; fix Mask, which shipped silently broken
- f21ded6: feat(label): implement Label and FloatingLabel, neither of them a form label
- 96e27b1: feat(link,loading): implement both; clear Button's raw-markup fallback
- 208170b: feat(list): implement List and ListRow
- 2140d2b: feat(mask): implement Mask; fix polymorphic Props inference in Button and Badge
- b742689: feat(megamenu): implement the pair-per-item bar, and keep the pairs unwrapped
- 23658bf: feat(menu): implement Menu and MenuTitle; settle the menu-disabled question
- 65094a8: feat(mockups): implement all four — browser, code, window and phone
- 4cc6d72: feat(modal): implement, covering all four daisyUI methods from one component
- 11d7517: feat(navbar): implement the bar and its three parts, and show both layouts
- f908180: feat(otp): implement, fixing the scaffold's wrong root element
- d42e973: feat(package): export the 112 components from the entry point
- 6024c0e: feat(radial-progress): implement, with aria derived from value
- d07f590: feat(radio,range): implement both, fixing the missing-type scaffold bug
- ad7c26b: feat(rating): implement, composing Mask shapes over a radio group
- 32147bc: feat(select): implement three axes on the native element, options as slot content
- ad87136: feat(stack): implement the four directions, documenting the three layer limit
- 4aa8c6b: feat(stat): implement all seven components, with stats as the container
- 09616bc: feat(steps): implement Steps, Step and StepIcon
- c2965b5: feat(swap): implement Swap with its three state parts, and close README §7
- 848ba44: feat(table): implement four modifiers on one class, with no wrapper
- 7819189: feat(tabs): implement Tabs, Tab and TabContent
- f5f99d9: feat(text-input): implement both documented roots, with a guard that was fired
- 2c91b9f: feat(textarea): implement three axes, and fix the scaffold's whitespace bug
- 6c19414: feat(theme-controller): render the two attributes the selector needs
- 0245e72: feat(timeline): implement all five components
- 8273403: feat(toast): implement the two placement axes, leaving position:fixed alone
- 6e8afcc: feat(toggle): implement both roots, fixing the eighth missing-type defect
- 9ada94b: feat(tooltip): implement, with seven colours derived rather than retyped
- 26bc046: feat(validator): ship ValidatorHint only, and delete Validator.astro

### Patch Changes

- 8b59bbe: fix textrotate
- 7cf387c: fix(package): stop publishing the stories, and document the CSS cost
- 9b73a88: refactor(aura): extract the props and class map to aura.ts
- 6f277e2: refactor(fieldset): pass 2 — stories compose the real TextInput
- e3ed61c: refactor(floating-label): pass 2 — compose TextInput, Textarea and Select
- f3d95cb: refactor(join): pass 2 — NestedItems composes the real TextInput and Select
- 493820e: refactor(label): pass 2 — affix stories use TextInput as="label"
- 4075873: refactor(pagination): delete the component, keep the recipes
- 237a013: chore(package): add the npm release metadata
  
  Description, keywords, homepage, repository, bugs, license and author, plus a
  `prepack` that copies the root README and LICENSE into the package so npm and
  the Astro integrations library have something to read. The `astro-component`
  and `withastro` keywords list it at astro.build/integrations; `css` and `ui`
  file it under CSS + UI.
