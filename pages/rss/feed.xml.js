// pages/rss/feed.xml.js
import BLOG from '@/blog.config'
import { generateRss } from '@/lib/utils/rss'
import { extractLangId } from '@/lib/utils/pageId'

export const getServerSideProps = async ({ req, res }) => {
  // 设置缓存头 - 更长的缓存时间以减少API调用
  res.setHeader(
    'Cache-Control',
    'public, max-age=7200, stale-while-revalidate=3600'
  )
  
  // 设置内容类型为XML
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')

  // 设置超时保护（30秒内必须完成）
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({ timeout: true })
    }, 28000) // 28秒时返回备用内容，留2秒给网关
  })

  try {
    // 获取所有站点数据
    const siteIds = BLOG.NOTION_PAGE_ID.split(',')
    const siteId = siteIds[0] // 使用第一个站点
    const id = extractLangId(siteId)
    
    console.log('[RSS] 开始获取站点数据...')
    
    // 使用 dynamic import 避免在编译时引入可能导致问题的依赖
    const { getGlobalData } = await import('@/lib/db/getSiteData')
    
    const dataPromise = getGlobalData({
      pageId: id,
      from: 'rss-feed',
      // 避免加载完整文章内容，减少依赖
      simplifySiteData: true
    })

    // 竞速：超时或数据获取完成（以先发生者为准）
    const result = await Promise.race([dataPromise, timeoutPromise])
    
    if (result.timeout) {
      console.warn('[RSS] 数据获取超时，返回空RSS')
      const fallbackFeed = generateMinimalRss()
      res.statusCode = 200
      res.end(fallbackFeed)
      return { props: {} }
    }

    const siteData = result

    if (!siteData) {
      console.error('[RSS] 无法获取站点数据')
      res.statusCode = 200 // 返回200但内容为空，防止继续重试
      res.end(generateMinimalRss())
      return { props: {} }
    }

    // 过滤出已发布的文章，获取最新的15篇（减少处理量）
    const allPages = siteData.allPages || []
    const publishedPosts = allPages
      .filter(post => 
        post && 
        post.status === 'Published' &&
        post.type === 'Post' &&
        post.title
      )
      .sort((a, b) => new Date(b.publishDay || b.date) - new Date(a.publishDay || a.date))
      .slice(0, 15)

    console.log(`[RSS] 找到 ${publishedPosts.length} 篇已发布文章`)

    // 生成RSS - 只使用摘要，不获取完整内容
    const year = new Date().getFullYear()
    const { Feed } = await import('feed')
    const feed = new Feed({
      title: siteData.siteInfo?.title || BLOG.TITLE,
      description: siteData.siteInfo?.description || BLOG.DESCRIPTION,
      link: BLOG.LINK,
      language: siteData.NOTION_CONFIG?.LANG || BLOG.LANG,
      favicon: `${BLOG.LINK}/favicon.png`,
      copyright: `All rights reserved ${year}, ${siteData.NOTION_CONFIG?.AUTHOR || BLOG.AUTHOR}`,
      author: {
        name: siteData.NOTION_CONFIG?.AUTHOR || BLOG.AUTHOR,
        link: BLOG.LINK
      }
    })

    // 仅添加文章摘要，不获取完整内容（避免超时）
    for (const post of publishedPosts) {
      feed.addItem({
        title: post.title,
        link: `${BLOG.LINK}/${post.slug || post.id}`,
        description: post.summary || '',
        date: new Date(post?.publishDay || post?.date || new Date())
      })
    }

    const rssContent = feed.rss2()
    console.log('[RSS] RSS内容生成成功')
    
    res.statusCode = 200
    res.end(rssContent)
  } catch (error) {
    console.error('[RSS] RSS生成错误:', error)
    res.statusCode = 200 // 返回200防止继续重试
    res.end(generateMinimalRss())
  }

  return { props: {} }
}

// 生成最小化的RSS（备用内容，用于超时或错误情况）
function generateMinimalRss() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${BLOG.TITLE || 'Blog'}</title>
    <description>${BLOG.DESCRIPTION || 'Blog RSS Feed'}</description>
    <link>${BLOG.LINK}</link>
    <language>${BLOG.LANG || 'en'}</language>
  </channel>
</rss>`
}

export default function RSSFeed() {
  return null
}