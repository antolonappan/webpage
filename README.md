# Webpage

This folder is the standalone static website for https://antolonappan.me/.

## Pages

- `/`
- `/publications/`
- `/research/`
- `/contact/`

## Regenerate

From the project root:

```bash
node webpage/build.js
```

The generator reads:

- `components/pages/research/config.json`
- `components/pages/research/generated.json`
- `components/pages/about/data.json`
- `public/assets/research`

When adding a new arXiv paper, run:

```bash
npm run sync:research
node webpage/build.js
```

## Preview

Serve the folder:

```bash
cd webpage
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
