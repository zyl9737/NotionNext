// pages/rss/feed.xml.js
import BLOG from '@/blog.config'
import { generateRss } from '@/lib/rss'
import { getGlobalData } from '@/lib/db/getSiteData'
import { extractLangId, extractLangPrefix } from '@/lib/utils/pageId'

export const getServerSideProps = async ({ req, res }) => {
  // 设置缓存头
  res.setHeader(
    'Cache-Control',
    'public, max-age=3600, stale-while-revalidate=59'
  )
  
  // 设置内容类型为XML
  res.setHeader('Content-Type', 'application/rss+xml')

  try {
    // 获取所有站点数据
    const siteIds = BLOG.NOTION_PAGE_ID.split(',')
    const siteId = siteIds[0] // 使用第一个站点
    const id = extractLangId(siteId)
    
    const siteData = await getGlobalData({
      pageId: id,
      from: 'rss-feed'
    })

    if (!siteData || !siteData.allPages) {
      res.statusCode = 404
      res.end('RSS feed not found')
      return { props: {} }
    }

    // 过滤出已发布的文章，获取最新的20篇
    const publishedPosts = siteData.allPages
      ?.filter(post => 
        post.status === BLOG.NOTION_PROPERTY_NAME.status_publish &&
        post.type === BLOG.NOTION_PROPERTY_NAME.type_post
      )
      ?.sort((a, b) => new Date(b.publishDay) - new Date(a.publishDay))
      ?.slice(0, 20) || []

    // 生成RSS
    await generateRss({
      NOTION_CONFIG: siteData.NOTION_CONFIG,
      siteInfo: siteData.siteInfo,
      latestPosts: publishedPosts
    })

    // 读取生成的RSS文件并返回
    const fs = require('fs')
    const path = require('path')
    const rssPath = path.join(process.cwd(), 'public', 'rss', 'feed.xml')
    
    if (fs.existsSync(rssPath)) {
      const rssContent = fs.readFileSync(rssPath, 'utf8')
      res.statusCode = 200
      res.end(rssContent)
    } else {
      res.statusCode = 404
      res.end('RSS feed not found')
    }
  } catch (error) {
    console.error('RSS生成错误:', error)
    res.statusCode = 500
    res.end('Internal Server Error')
  }

  return { props: {} }
}

export default function RSSFeed() {
  return null
}