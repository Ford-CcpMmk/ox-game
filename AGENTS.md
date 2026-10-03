<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project context

Read `docs/REQUIREMENTS.md` before planning or implementing project features. It contains the agreed requirements, stack choices, and unresolved product decisions. Do not treat unresolved decisions as agreed requirements. Check the current code to establish implementation status.

Setup instructions are in `docs/SETUP.md`.

# UI refactoring

Preserve the approved appearance when refactoring. Visual fidelity takes priority over reducing CSS or replacing custom styles with framework defaults. Compare desktop and mobile before/after; use Tailwind for ordinary layout, daisyUI as the component base, and dedicated CSS for the game's custom surfaces and animations.
