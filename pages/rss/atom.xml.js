// pages/rss/atom.xml.js
//
// 重要：不要在此文件顶部 import 任何涉及 SiteDataApi / cache_manager / ioredis 的模块！
// 否则 webpack 静态分析会打包 ioredis → 需要 Node 内置模块 'net' → 构建失败。
// 所有重量级依赖一律通过 dynamic import() 在运行时加载。
//
import BLOG from '@/blog.config'
import { extractLangId } from '@/lib/utils/pageId'

export const getServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'application/atom+xml; charset=utf-8')
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=7200, stale-while-revalidate=3600'
  )

  try {
    const siteIds = BLOG.NOTION_PAGE_ID.split(',')
    const id = extractLangId(siteIds[0])

    // ---- 动态导入，切断 webpack 静态分析链 ----
    const { fetchGlobalAllData } = await import('@/lib/db/SiteDataApi')
    const siteData = await fetchGlobalAllData({
      pageId: id,
      from: 'atom-feed'
    })

    if (!siteData) {
      res.statusCode = 200
      res.end(fallbackAtom())
      return { props: {} }
    }

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
      favicon: LINK + '/favicon.ico',
      copyright: 'All rights reserved ' + new Date().getFullYear() + ', ' + AUTHOR,
      author: { name: AUTHOR, link: LINK }
    })

    for (const post of posts) {
      const postLink = LINK + '/' + (post.slug || post.id)
      feed.addItem({
        title: post.title,
        id: postLink,
        link: postLink,
        description: post.summary || '',
        date: new Date(post.publishDay || post.date || Date.now())
      })
    }

    res.statusCode = 200
    res.end(feed.atom1())
  } catch (err) {
    console.error('[Atom] 生成失败:', err)
    res.statusCode = 200
    res.end(fallbackAtom())
  }

  return { props: {} }
}

function fallbackAtom() {
  const title = BLOG.TITLE || 'Blog'
  const desc = BLOG.DESCRIPTION || ''
  const link = BLOG.LINK || ''
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<feed xmlns="http://www.w3.org/2005/Atom">' +
    '<title>' + title + '</title>' +
    '<subtitle>' + desc + '</subtitle>' +
    '<link href="' + link + '"/>' +
    '<id>' + link + '</id>' +
    '<updated>' + new Date().toISOString() + '</updated>' +
    '</feed>'
}

export default function AtomFeed() {
  return null
}
