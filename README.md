# idea_implement

Idea to launch with five slash commands (skills from [mattpocock/skills](https://github.com/mattpocock/skills), MIT):

| Step | Command | Output |
| --- | --- | --- |
| 1 | `/grill-with-docs` | Q&A rounds that settle every design decision; `CONTEXT.md` glossary + `docs/adr/` |
| 2 | `/to-spec` | `.scratch/<feature>/spec.md` |
| 3 | `/to-tickets` | `.scratch/<feature>/issues/NN-*.md` (vertical slices with blocking edges) |
| 4 | `/implement` | TDD commits, one ticket at a time |
| 5 | `/code-review` | Two-axis review (Standards / Spec) since a fixed point |

Run `/setup-matt-pocock-skills` once per new repo (this repo is already configured: local markdown tracker, see `docs/agents/`).

## Install on your machine

The skills live in `.claude/skills/`, so Claude Code picks them up automatically inside this repo. To use them in every project:

```bash
./scripts/install-skills.sh   # copies to ~/.claude/skills, skips existing ones
```

## Example: focus timer

`.scratch/focus-timer/` holds the full trail for the example app in `site/`. Run the tests with `npm test`. To preview locally, run `python3 -m http.server -d site`.

### Going live (one-time)

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**. Pages on a private repo needs GitHub Pro/Team; otherwise make the repo public.
2. Merge to `main`. `.github/workflows/pages.yml` runs the tests and deploys `site/`.
