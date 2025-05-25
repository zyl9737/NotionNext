// pages/rss/atom.xml.js
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
  res.setHeader('Content-Type', 'application/atom+xml; charset=utf-8')

  try {
    // 获取所有站点数据
    const siteIds = BLOG.NOTION_PAGE_ID.split(',')
    const siteId = siteIds[0]
    const id = extractLangId(siteId)
    
    console.log('[Atom] 开始获取站点数据...')
    const siteData = await getGlobalData({
      pageId: id,
      from: 'atom-feed'
    })

    if (!siteData) {
      console.error('[Atom] 无法获取站点数据')
      res.statusCode = 500
      res.end('Unable to fetch site data')
      return { props: {} }
    }

    // 过滤出已发布的文章
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

    console.log(`[Atom] 找到 ${publishedPosts.length} 篇已发布文章`)

    // 直接使用Feed库生成Atom内容
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

    const atomContent = feed.atom1()
    console.log('[Atom] Atom内容生成成功')
    
    res.statusCode = 200
    res.end(atomContent)
  } catch (error) {
    console.error('[Atom] Atom生成错误:', error)
    res.statusCode = 500
    res.end(`<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom生成失败</title>
  <subtitle>服务器内部错误</subtitle>
  <link href="${BLOG.LINK}"/>
  <id>${BLOG.LINK}</id>
  <updated>${new Date().toISOString()}</updated>
</feed>`)
  }

  return { props: {} }
}

export default function AtomFeed() {
  return null
}