# Webpage

This folder is the standalone static website for https://antolonappan.me/.

## Source data

- `data/research/config.json` is the editable arXiv/publication list, Google Scholar profile URL, manual venue labels, DOI overrides, and code links.
- `data/research/generated.json` is generated from arXiv metadata and arXiv/ar5iv figures.
- `data/about.json` is the editable profile/about copy.

## Pages

- `/`
- `/publications/`
- `/research/`
- `/contact/`

## Regenerate

From this repository root:

```bash
npm install
npm run sync:research
npm run sync:scholar
npm run build
npm run validate
```

The generator reads:

- `data/research/config.json`
- `data/research/generated.json`
- `data/about.json`
- `assets/research`

When adding a new arXiv paper, run:

```bash
npm run sync:research
npm run build
```

## Automation

GitHub Actions keeps the generated site current:

- `Build` runs on pushes and pull requests and fails if generated files are stale.
- `Sync Research Site` runs monthly, can be triggered manually, and runs after source-data changes on `main`. It updates arXiv metadata, downloads figures, checks Google Scholar citations/h-index/i10-index, rebuilds the site, validates it, and commits generated changes back to `main` when anything changed.
- If Google Scholar blocks CI, the workflow keeps the checked-in citation metrics and continues. The next successful monthly, manual, or local sync will update them.

## Preview

Serve the folder:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
