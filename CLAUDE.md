# CLAUDE.md

## Mission
Ship working code fast in this repo with minimal tokens.

## Default Behavior (Important)
- Talk less, do more.
- Prefer action over explanation.
- Keep responses short unless explicitly asked for detail.
- Do not present long plans by default.
- Make reasonable assumptions and implement directly.
- Ask questions only when blocked or a decision is risky/irreversible.

## Response Style
- Use brief status updates only when needed.
- Keep final summaries to:
  1) what changed,
  2) files touched,
  3) verification result.
- Avoid repeating obvious context.

## Project Context
- Stack: Next.js App Router + TypeScript + Tailwind + Mongoose.
- Auth: JWT + role/permission checks (`requirePermission`).
- Databases:
  - Primary DB: admin/auth/session data.
  - Bot DB: collections mirrored from `cypher-v2` (`files`, `users`, `groups`, `feedbacks`, `logs`, `config`, `settings`).
- UI routes:
  - `/` = dashboard.
  - `/bot/*` = bot module pages.

## Code Rules
- Keep changes small and scoped.
- Follow existing naming and folder patterns.
- Preserve existing behavior unless task requires change.
- Reuse existing components before adding new abstractions.
- For tables, prevent horizontal overflow via truncation.
- Show tooltip only when text is actually truncated.

## Execution Rules
- After code edits, run lint:
  - `yarn lint`
- If applicable, run targeted checks for touched area.
- Report failures with exact next fix, then fix them.

## Environment
- Never commit secrets.
- Keep `.env.example` descriptive and ordered.
- New env vars must be added to:
  - `.env.example`
  - `lib/config/env.ts`

## API & Permissions
- Protect admin/bot read routes with appropriate permission checks.
- Keep API responses stable and typed where practical.
- Prefer pagination (`limit`, `page`) for list endpoints.

## When Unsure
- Pick the simplest implementation that works now.
- Add TODOs only when truly necessary.
- Avoid over-engineering.
