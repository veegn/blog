# VEEGN Blog Maintenance

This repository is a Hexo blog that uses NexT as the upstream theme plus a small set of site-specific patches.

## Source of Truth

- Article content: `source/_posts/`
- New content templates: `scaffolds/`
- Site-wide injected markup: `source/_data/*.swig`
- Site-owned NexT config: `source/_data/next.yml`
- Site-owned SEO filters: `scripts/seo/`
- Crawl policy: `source/robots.txt`
- IndexNow submission: `.github/workflows/deploy.yml` + `scripts/seo/submit-indexnow.js`

## Preferred Change Order

When making changes, prefer this order:

1. Change article front matter or article content in `source/_posts/`
2. Change site config in `source/_data/next.yml`
3. Change site-specific scripts in `scripts/seo/`
4. Change injected markup in `source/_data/*.swig`
5. Patch `themes/next/` only if the same result cannot be achieved above

## Current Theme Patches

These files are intentional site-specific theme patches:

- `themes/next/layout/_partials/header/brand.swig`
- `themes/next/layout/index.swig`

Reason:

- `brand.swig` keeps the header site title from producing an extra `<h1>` on non-home pages.
- `index.swig` adds the homepage's single SEO-facing `<h1>`.

These remain in the theme because NexT's `custom_file_path` supports injection, not clean replacement of these structural templates.

## SEO Rules

- Every article should have `title`, `date`, `tags`, `categories`, `abbrlink`, and `description`.
- Keep `scaffolds/post.md` and `scaffolds/draft.md` aligned with the required article front matter.
- Do not repeat the article title as the first Markdown `#` heading unless necessary.
- Homepage and tag-page descriptions are generated centrally in `scripts/seo/page-descriptions.js`.
- Duplicate title heading cleanup is handled in `scripts/seo/strip-duplicate-title-heading.js`.
- `sitemap.xml` is pruned after generation in `scripts/seo/prune-sitemap.js` so it stays aligned with robots and IndexNow scope.
- IndexNow submission is triggered after GitHub Pages deployment and requires the `INDEXNOW_KEY` repository secret.
- If `robots.txt` changes, review whether sitemap behavior should also change.

## Head and Body Injection

- Keep `source/_data/head.swig` minimal.
- Put DOM widgets and late scripts in `source/_data/body-end.swig`.
- Do not pile unrelated scripts into head unless they must execute there.

## Validation

After SEO or structure changes, run:

```powershell
npm run clean
npm run build
```

Then validate generated HTML in `public/` for the exact affected pages.

Examples:

```powershell
$html = Get-Content public\index.html -Raw
[regex]::Matches($html, '<h1\b').Count
```

```powershell
$html = Get-Content public\posts\openclaw-free-models-guide\index.html -Raw
[regex]::Matches($html, '<meta[^>]+(?:name="description"|property="og:description")[^>]+>').Value
```

## Generated Artifacts

- `public/`
- `db.json`
- `node_modules/`

Treat these as generated outputs, not authored source.

## AI Maintenance

Project-specific AI maintenance guidance lives in:

- `.codex/skills/veegn-blog-maintenance/SKILL.md`

Use that skill when continuing SEO, Hexo, or NexT maintenance in this repository.
