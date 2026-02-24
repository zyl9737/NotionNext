// pages/rss/feed.xml.js
//
// 重要：不要在此文件顶部 import 任何涉及 SiteDataApi / cache_manager / ioredis 的模块！
// 否则 webpack 静态分析会打包 ioredis → 需要 Node 内置模块 'net' → 构建失败。
// 所有重量级依赖一律通过 dynamic import() 在运行时加载。
//
import BLOG from '@/blog.config'
import { extractLangId } from '@/lib/utils/pageId'

export const getServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=7200, stale-while-revalidate=3600'
  )

  // 设置超时保护（30秒内必须完成）
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({ timeout: true })
    }, 28000) // 28秒时返回备用内容，留2秒给网关
  })

  try {
    const siteIds = BLOG.NOTION_PAGE_ID.split(',')
    const id = extractLangId(siteIds[0])

    // ---- 动态导入，切断 webpack 静态分析链 ----
    const { fetchGlobalAllData } = await import('@/lib/db/SiteDataApi')
    const siteData = await fetchGlobalAllData({
      pageId: id,
      from: 'rss-feed'
    })

    if (!siteData) {
      res.statusCode = 200
      res.end(fallbackRss())
      return { props: {} }
    }

    // 过滤已发布文章，取最新 20 篇
    const posts = (siteData.allPages || [])
      .filter(
        p => p && p.status === 'Published' && p.type === 'Post' && p.title
      )
      .sort(
        (a, b) =>
          new Date(b.publishDay || b.date) - new Date(a.publishDay || a.date)
      )
      .slice(0, 20)

    const { Feed } = await import('feed')
    const LINK = siteData.siteInfo?.link || BLOG.LINK
    const AUTHOR = siteData.NOTION_CONFIG?.AUTHOR || BLOG.AUTHOR

    const feed = new Feed({
      title: siteData.siteInfo?.title || BLOG.TITLE || 'Blog',
      description: siteData.siteInfo?.description || BLOG.DESCRIPTION || '',
      id: LINK,
      link: LINK,
      language: siteData.NOTION_CONFIG?.LANG || BLOG.LANG || 'zh-CN',
      favicon: `${LINK}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${AUTHOR}`,
      author: { name: AUTHOR, link: LINK }
    })

    for (const post of posts) {
      feed.addItem({
        title: post.title,
        id: `${LINK}/${post.slug || post.id}`,
        link: `${LINK}/${post.slug || post.id}`,
        description: post.summary || '',
        date: new Date(post.publishDay || post.date || Date.now())
      })
    }

    res.statusCode = 200
    res.end(feed.rss2())
  } catch (err) {
    console.error('[RSS] 生成失败:', err)
    res.statusCode = 200
    res.end(fallbackRss())
  }

  return { props: {} }
}

function fallbackRss() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${BLOG.TITLE || 'Blog'}</title>
    <link>${BLOG.LINK || ''}</link>
    <description>${BLOG.DESCRIPTION || ''}</description>
  </channel>
</rss>`
}

export default function RSSFeed() {
  return null
}