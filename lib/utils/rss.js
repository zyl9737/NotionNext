import BLOG from '@/blog.config'
import NotionPage from '@/components/NotionPage'
import { getPostBlocks } from '@/lib/db/SiteDataApi'
import { Feed } from 'feed'
import fs from 'fs'

/**
 * 转义 HTML 特殊字符
 * @param {string} unsafe
 * @returns {string}
 */
const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 生成RSS内容 - 简化版本，优先使用摘要
 * @param {*} post
 * @returns
 */
const createFeedContent = async (post) => {
  // 加密的文章内容只返回摘要
  if (post.password && post.password !== '') {
    return escapeHtml(post.summary || '受保护的内容')
  }
  
  // 优先使用摘要，如果摘要存在且长度合适就直接使用
  if (post.summary && post.summary.trim().length > 20) {
    const summary = post.summary.trim()
    // 限制摘要长度，RSS中不需要太长的内容
    if (summary.length > 300) {
      return escapeHtml(summary.substring(0, 300) + '...')
    }
    return escapeHtml(summary)
  }
  
  // 最后的备选方案 - 避免依赖复杂的 getPostBlocks 可能引入 net/tls
  return escapeHtml(post.title || '暂无内容预览')
}

/**
 * 生成RSS数据
 * @param {*} props
 * @returns {Object} 返回生成的feed对象，可用于直接输出
 */
export async function generateRss(props) {
  const { NOTION_CONFIG, siteInfo, latestPosts } = props
  const TITLE = escapeHtml(siteInfo?.title)
  const DESCRIPTION = escapeHtml(siteInfo?.description)
  const LINK = siteInfo?.link
  const AUTHOR = escapeHtml(NOTION_CONFIG?.AUTHOR || BLOG.AUTHOR)
  const LANG = NOTION_CONFIG?.LANG || BLOG.LANG
  const SUB_PATH = NOTION_CONFIG?.SUB_PATH || BLOG.SUB_PATH
  const CONTACT_EMAIL = NOTION_CONFIG?.CONTACT_EMAIL || BLOG.CONTACT_EMAIL

  // 检查 feed 文件是否在10分钟内更新过
  if (isFeedRecentlyUpdated('./public/rss/feed.xml', 10)) {
    return
  }

  console.log('[RSS订阅] 生成/rss/feed.xml')
  const year = new Date().getFullYear()
  const feed = new Feed({
    title: TITLE,
    description: DESCRIPTION,
    link: `${LINK}${SUB_PATH ? '/' + SUB_PATH : ''}`,
    language: LANG,
    favicon: `${LINK}/favicon.png`,
    copyright: `All rights reserved ${year}, ${AUTHOR}`,
    author: {
      name: AUTHOR,
      email: CONTACT_EMAIL,
      link: LINK
    }
  })

  // 添加文章到feed
  for (const post of latestPosts) {
    if (!post.title) continue; // 跳过没有标题的文章
    
    feed.addItem({
      title: escapeHtml(post.title),
      link: `${LINK}/${post.slug}`,
      description: escapeHtml(post.summary || ''),
      content: await createFeedContent(post),
      date: new Date(post?.publishDay || post?.date || new Date())
    })
  }

  // 尝试写入文件，但这在某些环境如Vercel中会失败
  try {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      fs.mkdirSync('./public/rss', { recursive: true })
      fs.writeFileSync('./public/rss/feed.xml', feed.rss2())
      fs.writeFileSync('./public/rss/atom.xml', feed.atom1())
      fs.writeFileSync('./public/rss/feed.json', feed.json1())
    }
  } catch (error) {
    console.warn('[RSS] 无法写入RSS文件', error.message)
    // 在Vercel等只读环境中，这是预期行为，忽略错误
  }

  // 返回feed对象供直接使用
  return feed
}

/**
 * 检查上次更新，如果60分钟内更新过就不操作。
 * @param {*} filePath
 * @param {*} intervalMinutes
 * @returns
 */
function isFeedRecentlyUpdated(filePath, intervalMinutes = 60) {
  try {
    // 在不支持fs的环境中返回false
    if (typeof fs === 'undefined' || !fs.statSync) {
      return false;
    }
    
    const stats = fs.statSync(filePath)
    const now = new Date()
    const lastModified = new Date(stats.mtime)
    const timeDifference = (now - lastModified) / (1000 * 60) // 转换为分钟
    return timeDifference < intervalMinutes
  } catch (error) {
    // 如果文件不存在或在只读环境，返回false
    return false
  }
}
