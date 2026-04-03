'use strict';

const fs = require('fs');
const path = require('path');

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const EXCLUDED_PREFIXES = ['archives/', 'categories/', 'tags/'];
const EXCLUDED_FILES = new Set(['404.html']);

function walkHtmlFiles(dir, baseDir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fullPath, baseDir, files);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      files.push(relativePath);
    }
  }

  return files;
}

function shouldSubmit(relativePath) {
  if (EXCLUDED_FILES.has(relativePath)) return false;
  return !EXCLUDED_PREFIXES.some(prefix => relativePath.startsWith(prefix));
}

function toPublicUrl(siteUrl, relativePath) {
  if (relativePath === 'index.html') return `${siteUrl}/`;
  if (relativePath.endsWith('/index.html')) {
    return `${siteUrl}/${relativePath.slice(0, -'index.html'.length)}`;
  }
  return `${siteUrl}/${relativePath}`;
}

async function main() {
  const indexNowKey = process.env.INDEXNOW_KEY;
  const siteUrl = process.env.SITE_URL && process.env.SITE_URL.replace(/\/+$/, '');
  const publicDir = path.resolve(process.env.PUBLIC_DIR || 'public');

  if (!indexNowKey) {
    console.log('INDEXNOW_KEY is not set. Skipping IndexNow submission.');
    return;
  }

  if (!siteUrl) {
    throw new Error('SITE_URL is required.');
  }

  if (!fs.existsSync(publicDir)) {
    throw new Error(`Public directory not found: ${publicDir}`);
  }

  const htmlFiles = walkHtmlFiles(publicDir, publicDir).filter(shouldSubmit);
  const urlList = [...new Set(htmlFiles.map(file => toPublicUrl(siteUrl, file)))].slice(0, 10000);

  if (urlList.length === 0) {
    console.log('No eligible URLs found for IndexNow submission.');
    return;
  }

  const payload = {
    host: new URL(siteUrl).host,
    key: indexNowKey,
    keyLocation: `${siteUrl}/${indexNowKey}.txt`,
    urlList
  };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(payload)
  });

  const body = await response.text();
  console.log(`IndexNow response: ${response.status} ${response.statusText}`);
  if (body) console.log(body);

  if (!response.ok) {
    throw new Error(`IndexNow submission failed with status ${response.status}.`);
  }

  console.log(`Submitted ${urlList.length} URLs to IndexNow.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
