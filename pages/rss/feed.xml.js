// pages/rss/feed.xml.js
import BLOG from '@/blog.config'
import { generateRss } from '@/lib/rss'
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
    
    // 使用 dynamic import 避免在编译时引入可能导致问题的依赖
    const { getGlobalData } = await import('@/lib/db/getSiteData')
    
    const siteData = await getGlobalData({
      pageId: id,
      from: 'rss-feed',
      // 避免加载完整文章内容，减少依赖
      simplifySiteData: true
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

    // 使用简化版的 generateRss
    const feed = await generateRss({
      NOTION_CONFIG: siteData.NOTION_CONFIG || {},
      siteInfo: siteData.siteInfo || {
        title: BLOG.TITLE,
        description: BLOG.DESCRIPTION,
        link: BLOG.LINK
      },
      latestPosts: publishedPosts
    })

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