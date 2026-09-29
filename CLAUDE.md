# idea_implement

## Workflow

Idea to launch: `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` → `/code-review`.
Skills live in `.claude/skills/` (from mattpocock/skills, MIT).

## Agent skills

### Issue tracker

Specs and tickets are local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
