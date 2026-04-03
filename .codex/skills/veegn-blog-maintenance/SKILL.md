---
name: veegn-blog-maintenance
description: Maintain the VEEGN Hexo blog. Use when working in this repository on SEO fixes, content structure, robots/sitemap behavior, Hexo generation issues, NexT theme customization, or project organization changes. Trigger for tasks that touch source/_posts, source/_data, scripts/seo, robots.txt, or small site-specific NexT patches.
---

# VEEGN Blog Maintenance

Maintain this repo as a Hexo blog with NexT as the upstream theme and a small set of site-specific patches.

## Repo Boundaries

- Treat `source/_posts/` as the source of truth for article content and article-level front matter.
- Treat `scaffolds/` as the source of truth for new post and page templates.
- Treat `source/_data/next.yml` as the preferred place for site-owned NexT configuration.
- Treat `source/_data/*.swig` as the preferred place for site-wide injected markup.
- Treat `scripts/seo/` as the preferred place for site-owned SEO and content-normalization filters.
- Treat `themes/next/` as upstream theme code. Only modify it when the change cannot be expressed through `source/_data`, `scripts/`, or normal Hexo config.

## Current Site-Specific Structure

- `source/_data/next.yml`: site-owned NexT options that should not live in `themes/next/_config.yml`.
- `scaffolds/post.md` and `scaffolds/draft.md`: required front-matter baseline for future content.
- `source/_data/head.swig`: minimal head injection only.
- `source/_data/body-end.swig`: Google Translate widget and other late DOM injections.
- `scripts/seo/strip-duplicate-title-heading.js`: removes a leading Markdown `#` when it duplicates the post title.
- `scripts/seo/page-descriptions.js`: provides homepage and tag-page meta descriptions.
- `scripts/seo/prune-sitemap.js`: removes non-index targets such as tags, categories, and 404 from `sitemap.xml` after generation.
- `source/robots.txt`: crawl policy. Keep it aligned with sitemap strategy.
- `.github/workflows/deploy.yml` + `scripts/seo/submit-indexnow.js`: IndexNow integration for Bing and participating search engines.

## Editing Rules

- Prefer changing article `description` in the article front matter instead of adding special-case code.
- Prefer root-level scripts in `scripts/seo/` over editing NexT filters when behavior is site-specific.
- Prefer `source/_data/next.yml` over editing `themes/next/_config.yml`.
- Keep `source/_data/head.swig` small. Move widgets and scripts to `body-end.swig` unless they must run in `<head>`.
- Do not add new site behavior to `themes/next/scripts/filters/locals.js` unless the same result is impossible from root-level scripts.
- Avoid adding noindex or robots logic in multiple places. If crawl policy changes, review both `robots.txt` and sitemap behavior.
- If deployment behavior changes, review whether IndexNow submission and key-file generation still run after publish.

## Theme Patch Policy

Theme patches currently remain in:

- `themes/next/layout/_partials/header/brand.swig`
- `themes/next/layout/index.swig`

These patches exist because the changes affect theme structure, not simple injection points.

When touching them:

1. Confirm the goal cannot be handled by `source/_data` injection or root-level Hexo filters.
2. Keep the patch minimal and site-specific.
3. Rebuild and verify generated HTML, not just template code.
4. Mention in the final summary that the change still lives as a theme patch.

## SEO Maintenance Workflow

When fixing SEO issues, use this order:

1. Identify whether the issue is article-level, page-type-level, or theme-structure-level.
2. Fix article-level metadata in front matter when possible.
3. Fix page-type metadata with root-level scripts in `scripts/seo/`.
4. Fix structural semantics such as heading hierarchy in theme templates only if needed.
5. Rebuild with `npm run clean` and `npm run build`.
6. Verify generated output in `public/` for the exact affected URLs.

## Validation Checklist

After SEO or structure changes, validate the generated HTML directly:

- Count `<h1>` tags on affected pages.
- Check `<meta name="description">`.
- Check `og:description` when relevant.
- Check canonical tags when relevant.
- Check that `robots.txt` still matches the intended crawl policy.

Useful commands:

```powershell
npm run clean
npm run build
```

```powershell
$html = Get-Content public\index.html -Raw
[regex]::Matches($html, '<h1\b').Count
```

```powershell
$html = Get-Content public\posts\openclaw-free-models-guide\index.html -Raw
[regex]::Matches($html, '<meta[^>]+(?:name="description"|property="og:description")[^>]+>').Value
```

## Content Rules

- New posts should have `title`, `date`, `tags`, `categories`, `abbrlink`, and `description`.
- Keep `scaffolds/post.md` and `scaffolds/draft.md` aligned with those required fields.
- Do not repeat the article title as the first Markdown `#` heading unless there is a deliberate reason.
- Keep article descriptions specific to the article, not generic site copy.
- Homepage and tag-page descriptions may be generated centrally when they are not naturally backed by front matter.

## High-Risk Areas

- `themes/next/_config.yml`: avoid site-specific edits if the same config can live in `source/_data/next.yml`.
- `themes/next/scripts/filters/locals.js`: avoid site-specific SEO logic here.
- `source/_data/head.swig`: avoid piling up unrelated widgets, trackers, and DOM-heavy code.
- `public/` and `db.json`: generated artifacts only. Do not treat them as source.

## Final Response Expectations

- State whether the change was content-level, script-level, or theme-patch-level.
- Mention the exact files changed.
- Mention whether `npm run clean` and `npm run build` succeeded.
- If validation was done against generated HTML in `public/`, mention the exact pages checked.
