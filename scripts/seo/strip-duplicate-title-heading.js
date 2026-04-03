'use strict';

const stripLeadingDuplicateHeading = (content, title) => {
  if (!content || !title) return content;

  const normalizedTitle = title.trim();
  if (!normalizedTitle) return content;

  const lines = content.split(/\r?\n/);
  let index = 0;

  while (index < lines.length && !lines[index].trim()) {
    index += 1;
  }

  if (index >= lines.length) return content;

  const match = lines[index].match(/^#\s+(.+?)\s*$/);
  if (!match) return content;
  if (match[1].trim() !== normalizedTitle) return content;

  lines.splice(index, 1);

  if (index < lines.length && !lines[index].trim()) {
    lines.splice(index, 1);
  }

  return lines.join('\n');
};

hexo.extend.filter.register('before_post_render', data => {
  data.content = stripLeadingDuplicateHeading(data.content, data.title);
  return data;
});
