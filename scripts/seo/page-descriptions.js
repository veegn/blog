'use strict';

const homeDescription = '聚焦 Java 性能优化、网络工具、AI Agent、OpenClaw 实战与自动化脚本，持续记录真实排障过程、部署经验、踩坑复盘和可直接落地的技术方案。';

function buildTagDescription(page) {
  const postCount = page.posts && page.posts.length ? page.posts.length : 0;
  return `浏览 ${page.tag} 标签下的 ${postCount} 篇文章，涵盖相关实战教程、故障排查、版本兼容性分析、配置经验与可直接复用的解决方案，帮助快速定位问题并理解背景。`;
}

hexo.extend.filter.register('template_locals', locals => {
  const page = locals.page || {};

  if (page.path === 'index.html') {
    locals.description = homeDescription;
    page.description = homeDescription;
    return locals;
  }

  if (page.tag) {
    const tagDescription = buildTagDescription(page);
    locals.description = tagDescription;
    page.description = tagDescription;
  }

  return locals;
});
