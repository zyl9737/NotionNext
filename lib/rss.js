import BLOG from '@/blog.config'
import NotionPage from '@/components/NotionPage'
import { getPostBlocks } from '@/lib/db/getSiteData'
import { Feed } from 'feed'
import fs from 'fs'
import ReactDOMServer from 'react-dom/server'

/**
 * 转义 HTML 特殊字符
 * @param {string} unsafe
 * @returns {string}
 */
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 清理HTML内容，移除所有无用的标签和属性
 * @param {string} html 
 * @returns {string}
 */
const cleanHtmlContent = (html) => {
  if (!html) return ''
  
  return html
    // 移除所有script和style标签及其内容
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // 移除所有notion相关的class和id
    .replace(/\s*class="[^"]*notion[^"]*"/gi, '')
    .replace(/\s*id="[^"]*notion[^"]*"/gi, '')
    .replace(/\s*data-id="[^"]*"/gi, '')
    // 移除多余的div包装
    .replace(/<div[^>]*class="[^"]*notion-article[^"]*"[^>]*>/gi, '')
    .replace(/<div[^>]*class="[^"]*mx-auto[^"]*"[^>]*>/gi, '')
    .replace(/<div[^>]*class="[^"]*overflow-hidden[^"]*"[^>]*>/gi, '')
    .replace(/<main[^>]*class="[^"]*notion[^"]*"[^>]*>/gi, '')
    .replace(/<div[^>]*class="[^"]*notion-viewport[^"]*"[^>]*><\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*notion-collection-page-properties[^"]*"[^>]*><\/div>/gi, '')
    // 简化标题标签，只保留h1-h6
    .replace(/<h([1-6])[^>]*>/gi, '<h$1>')
    // 简化段落标签
    .replace(/<p[^>]*>/gi, '<p>')
    // 简化链接标签，只保留href
    .replace(/<a[^>]*href="([^"]*)"[^>]*>/gi, '<a href="$1">')
    // 简化图片标签，只保留src和alt
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '<img src="$1" alt="$2">')
    .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '<img src="$2" alt="$1">')
    // 移除空的div标签
    .replace(/<div[^>]*><\/div>/gi, '')
    .replace(/<div[^>]*>\s*<\/div>/gi, '')
    // 移除多余的span标签，保留内容
    .replace(/<span[^>]*>([^<]*)<\/span>/gi, '$1')
    // 清理多余的空白字符
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

/**
 * 从blockMap中提取纯文本内容
 * @param {Object} blockMap 
 * @returns {string}
 */
const extractTextFromBlocks = (blockMap) => {
  if (!blockMap || !blockMap.block) return ''
  
  const blocks = Object.values(blockMap.block)
  let textContent = ''
  
  blocks.forEach(block => {
    const value = block.value
    if (!value) return
    
    // 处理不同类型的block
    switch (value.type) {
      case 'text':
      case 'header':
      case 'sub_header':
      case 'sub_sub_header':
      case 'quote':
      case 'callout':
        if (value.properties && value.properties.title) {
          const title = value.properties.title.map(item => 
            typeof item === 'string' ? item : item[0] || ''
          ).join('')
          textContent += title + '\n\n'
        }
        break
      case 'bulleted_list':
      case 'numbered_list':
        if (value.properties && value.properties.title) {
          const title = value.properties.title.map(item => 
            typeof item === 'string' ? item : item[0] || ''
          ).join('')
          textContent += '• ' + title + '\n'
        }
        break
      case 'code':
        if (value.properties && value.properties.title) {
          const code = value.properties.title.map(item => 
            typeof item === 'string' ? item : item[0] || ''
          ).join('')
          textContent += '```\n' + code + '\n```\n\n'
        }
        break
      case 'image':
        if (value.properties && value.properties.source) {
          const imageUrl = value.properties.source[0][0]
          const caption = value.properties.caption ? 
            value.properties.caption.map(item => 
              typeof item === 'string' ? item : item[0] || ''
            ).join('') : ''
          textContent += `![${caption}](${imageUrl})\n\n`
        }
        break
    }
  })
  
  return textContent.trim()
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
  
  // 如果没有摘要或摘要太短，尝试从blockMap提取简短内容
  try {
    const blockMap = await getPostBlocks(post.id, 'rss-content')
    if (blockMap) {
      const textContent = extractTextFromBlocks(blockMap)
      if (textContent && textContent.length > 20) {
        // RSS内容限制在200字符以内
        const shortContent = textContent.substring(0, 200)
        return escapeHtml(shortContent + (textContent.length > 200 ? '...' : ''))
      }
    }
  } catch (error) {
    console.warn('提取文章内容失败:', error.message)
  }
  
  // 最后的备选方案
  return escapeHtml(post.title || '暂无内容预览')
}

/**
 * 生成RSS数据
 * @param {*} props
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
    link: `${LINK}/${SUB_PATH}`,
    language: LANG,
    favicon: `${LINK}/favicon.png`,
    copyright: `All rights reserved ${year}, ${AUTHOR}`,
    author: {
      name: AUTHOR,
      email: CONTACT_EMAIL,
      link: LINK
    }
  })
  for (const post of latestPosts) {
    feed.addItem({
      title: escapeHtml(post.title),
      link: `${LINK}/${post.slug}`,
      description: escapeHtml(post.summary),
      content: await createFeedContent(post),
      date: new Date(post?.publishDay)
    })
  }

  try {
    fs.mkdirSync('./public/rss', { recursive: true })
    fs.writeFileSync('./public/rss/feed.xml', feed.rss2())
    fs.writeFileSync('./public/rss/atom.xml', feed.atom1())
    fs.writeFileSync('./public/rss/feed.json', feed.json1())
  } catch (error) {
    // 在vercel运行环境是只读的，这里会报错；
    // 但在vercel编译阶段、或VPS等其他平台这行代码会成功执行
    // RSS被高频词访问将大量消耗服务端资源，故作为静态文件
  }
}

/**
 * 检查上次更新，如果60分钟内更新过就不操作。
 * @param {*} filePath
 * @param {*} intervalMinutes
 * @returns
 */
function isFeedRecentlyUpdated(filePath, intervalMinutes = 60) {
  try {
    const stats = fs.statSync(filePath)
    const now = new Date()
    const lastModified = new Date(stats.mtime)
    const timeDifference = (now - lastModified) / (1000 * 60) // 转换为分钟
    return timeDifference < intervalMinutes
  } catch (error) {
    // 如果文件不存在，我们需要创建它
    return false
  }
}
