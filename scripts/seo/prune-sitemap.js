'use strict';

const fs = require('fs');
const path = require('path');

const EXCLUDED_PATH_SEGMENTS = ['/tags/', '/categories/'];
const EXCLUDED_PATH_SUFFIXES = ['/404.html'];

function shouldKeepUrl(loc) {
  if (!loc) return true;
  if (EXCLUDED_PATH_SEGMENTS.some(segment => loc.includes(segment))) return false;
  if (EXCLUDED_PATH_SUFFIXES.some(suffix => loc.endsWith(suffix))) return false;
  return true;
}

hexo.extend.filter.register('after_generate', () => {
  const sitemapPath = path.join(hexo.public_dir, 'sitemap.xml');

  if (!fs.existsSync(sitemapPath)) return;

  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const cleaned = xml.replace(/<url>[\s\S]*?<\/url>/g, block => {
    const match = block.match(/<loc>(.*?)<\/loc>/);
    if (!match) return block;
    return shouldKeepUrl(match[1]) ? block : '';
  });

  fs.writeFileSync(sitemapPath, cleaned, 'utf8');
});
