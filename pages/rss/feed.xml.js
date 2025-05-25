// pages/rss/feed.xml.js
import BLOG from '@/blog.config'
import { generateRss } from '@/lib/rss'
import { getGlobalData } from '@/lib/db/getSiteData'
import { extractLangId } from '@/lib/utils/pageId'

export const getServerSideProps = async ({ req, res }) => {
  // 设置缓存头
  res.setHeader(
    'Cache-Control',
    'public, max-age=3600, stale-while-revalidate=59'
  )
  
  // 设置内容类型为XML
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')

  try {
    // 获取所有站点数据
    const siteIds = BLOG.NOTION_PAGE_ID.split(',')
    const siteId = siteIds[0] // 使用第一个站点
    const id = extractLangId(siteId)
    
    console.log('[RSS] 开始获取站点数据...')
    const siteData = await getGlobalData({
      pageId: id,
      from: 'rss-feed'
    })

    if (!siteData) {
      console.error('[RSS] 无法获取站点数据')
      res.statusCode = 500
      res.end('Unable to fetch site data')
      return { props: {} }
    }

    // 过滤出已发布的文章，获取最新的20篇
    const allPages = siteData.allPages || []
    const publishedPosts = allPages
      .filter(post => 
        post && 
        post.status === BLOG.NOTION_PROPERTY_NAME.status_publish &&
        post.type === BLOG.NOTION_PROPERTY_NAME.type_post &&
        post.title
      )
      .sort((a, b) => new Date(b.publishDay || b.date) - new Date(a.publishDay || a.date))
      .slice(0, 20)

    console.log(`[RSS] 找到 ${publishedPosts.length} 篇已发布文章`)

    if (publishedPosts.length === 0) {
      console.warn('[RSS] 没有找到已发布的文章')
      // 即使没有文章也生成空的RSS
    }

    // 生成RSS
    await generateRss({
      NOTION_CONFIG: siteData.NOTION_CONFIG || {},
      siteInfo: siteData.siteInfo || {
        title: BLOG.TITLE,
        description: BLOG.DESCRIPTION,
        link: BLOG.LINK
      },
      latestPosts: publishedPosts
    })

    // 直接使用Feed库生成RSS内容，而不是读取文件
    const { Feed } = require('feed')
    const year = new Date().getFullYear()
    const siteInfo = siteData.siteInfo || {}
    const NOTION_CONFIG = siteData.NOTION_CONFIG || {}
    
    const feed = new Feed({
      title: siteInfo.title || BLOG.TITLE,
      description: siteInfo.description || BLOG.DESCRIPTION,
      link: `${siteInfo.link || BLOG.LINK}${NOTION_CONFIG.SUB_PATH || BLOG.SUB_PATH || ''}`,
      language: NOTION_CONFIG.LANG || BLOG.LANG,
      favicon: `${siteInfo.link || BLOG.LINK}/favicon.png`,
      copyright: `All rights reserved ${year}, ${NOTION_CONFIG.AUTHOR || BLOG.AUTHOR}`,
      author: {
        name: NOTION_CONFIG.AUTHOR || BLOG.AUTHOR,
        email: NOTION_CONFIG.CONTACT_EMAIL || BLOG.CONTACT_EMAIL,
        link: siteInfo.link || BLOG.LINK
      }
    })

    // 添加文章到feed
    for (const post of publishedPosts) {
      const content = post.summary || post.title || '暂无内容预览'
      feed.addItem({
        title: post.title,
        link: `${siteInfo.link || BLOG.LINK}/${post.slug}`,
        description: post.summary || '',
        content: content.length > 300 ? content.substring(0, 300) + '...' : content,
        date: new Date(post.publishDay || post.date || new Date())
      })
    }

    const rssContent = feed.rss2()
    console.log('[RSS] RSS内容生成成功')
    
    res.statusCode = 200
    res.end(rssContent)
  } catch (error) {
    console.error('[RSS] RSS生成错误:', error)
    res.statusCode = 500
    res.end(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RSS生成失败</title>
    <description>服务器内部错误</description>
    <link>${BLOG.LINK}</link>
  </channel>
</rss>`)
  }

  return { props: {} }
}

export default function RSSFeed() {
  return null
}