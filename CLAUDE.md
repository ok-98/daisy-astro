# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A pnpm monorepo with one published package, `packages/daisy-astro`: Astro components wrapping every
daisyUI 5 component, where each daisyUI variant class is a typed prop and every native HTML attribute
is forwarded. 112 `.astro` files across 68 daisyUI components, 84 story files, no runtime dependencies.

Three directories matter, and each has its own `CLAUDE.md`:

- `packages/daisy-astro/` — the library. Component authoring rules live there.
- `plans/` — the spec. One plan per daisyUI component, plus the shared ruleset. Read before implementing.
- `.changeset/` — one changeset per commit touching the **published** package (see below).

`packages/site/` is the docs/marketing website (Astro, deployed to GitHub Pages via
`.github/workflows/pages.yml`), `private: true` and never published to npm.

## Commands

There is **no test runner and no linter**. `astro check` is the only automated gate.

```bash
cd packages/daisy-astro && npx astro check   # the gate: type-checks .astro (tsc does not)
pnpm --filter daisy-astro storybook          # dev, port 6006
pnpm --filter daisy-astro build-storybook    # static build; prerenders real component HTML
pnpm changeset                               # add a changeset
```

`astro check` covers the whole package in one pass (204 files). There is no way to check one component
in isolation; there is no single-test command because there are no tests.

To verify a component renders correctly without a browser: `pnpm --filter daisy-astro build-storybook`,
then grep `packages/daisy-astro/storybook-static/` for the expected markup. Stories are prerendered,
so the rendered HTML is really in there.

## Repo-wide invariants

**Tailwind scans source *text*, including comments.** A daisyUI class name written anywhere in a file —
JSDoc prose, a `//` comment — emits its full CSS. So an interpolated class name (`` `btn-${color}` ``)
produces markup no CSS backs, and a comment explaining why a class is *unused* ships that class's bytes.
This one fact drives most of the library's conventions (`plans/README.md` §1b).

**The package ships `.astro` source and one `@source` line.** `astro`, `daisyui` and `tailwindcss` are
peers; `cally` is an optional peer for `Calendar`. Consumers must `@import "daisy-astro/styles.css"`
— the package's own stylesheet, which registers `src` as a Tailwind source — or everything renders
unstyled with no error (README.md, `plans/README.md` §1c). Adding a file consumers import means
`package.json`'s `exports` **and** `files` both need an entry; missing either is silent.

**`src/index.ts` is the entire public surface** and nothing enforces that it stays complete — a component
missing from the barrel is unimportable while every check in the repo still passes.

## Conventions

Commits are Conventional Commits with a component scope: `feat(navbar): implement the bar and its
three parts`. Subjects describe what was decided, not just what changed.

**Every commit touching `packages/daisy-astro/` ships a changeset in the same commit.** `feat` → `minor`,
`fix`/`refactor` → `patch`. Body is the commit subject. Plan-, docs-only, and `packages/site/`-only
commits get none — `site` is private and never published.

Code comments cite the plan section that justifies them (`plans/README.md §5c`,
`plans/components/dock.md §3e`). Keep that up — the citations are how a rule's evidence is found again.

## MCP servers

`.mcp.json` provides `astro-docs` (official Astro docs search) and `daisyui` (the daisyUI repo).
Prefer them over memory for Astro behaviour and daisyUI class lists — several conventions here exist
because a remembered API was wrong.
