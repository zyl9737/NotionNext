import BLOG from '@/blog.config'
import {
  getDataFromCache,
  getOrSetDataWithCache,
  setDataToCache
} from '@/lib/cache/cache_manager'
import { deepClone, delay } from '../../utils'
import notionAPI from '@/lib/db/notion/getNotionAPI'

/**
 * 获取文章内容块
 * @param {string} id
 * @param {*} from
 * @param {*} slice
 */
export async function fetchNotionPageBlocks(id, from = null, slice = 0) {
  const cacheKey = `page_content_${id}`

  // 1️⃣ 统一由缓存工具负责「读 / 写 / 兜底获取」
  const pageBlock = await getOrSetDataWithCache(
    cacheKey,
    async () => {
      // 抓取最新数据
      return await getPageWithRetry(id, from)
    }
  )

  // 2️⃣ 防御式返回
  if (!pageBlock) {
    console.warn('[getPage] empty pageBlock:', id)
    return null
  }

  // 3️⃣ 转换为 post
  return pageBlock
}


/**
 * 调用接口，失败会重试
 * @param {*} id
 * @param {*} retryAttempts
 */
export async function getPageWithRetry(id, from, retryAttempts = 3) {
  if (retryAttempts && retryAttempts > 0) {
    console.log(
      '[API-->>请求]',
      `from:${from}`,
      `id:${id}`,
      retryAttempts < 3 ? `剩余重试次数:${retryAttempts}` : ''
    )
    try {
      const start = new Date().getTime()
      const pageData = await notionAPI.getPage(id)
      const end = new Date().getTime()
      console.log('[API<<--响应]', `耗时:${end - start}ms - from:${from}`)
      return pageData
    } catch (e) {
      console.warn('[API<<--异常]:', e)
      await delay(1000)
      const cacheKey = 'page_block_' + id
      const pageBlock = await getDataFromCache(cacheKey)
      if (pageBlock) {
        // console.log('[重试缓存]', `from:${from}`, `id:${id}`)
        return pageBlock
      }
      return await getPageWithRetry(id, from, retryAttempts - 1)
    }
  } else {
    console.error('[请求失败]:', `from:${from}`, `id:${id}`)
    return null
  }
}

/**
 * Notion页面BLOCK格式化处理
 * 1.删除冗余字段
 * 2.比如文件、视频、音频、url格式化
 * 3.代码块等元素兼容
 * @param {*} id 页面ID
 * @param {*} blockMap 页面元素
 * @param {*} slice 截取数量
 * @returns
 */
function convertNotionBlocksToPost(id, blockMap, slice) {
  const clonePageBlock = normalizeNotionBlockMap(deepClone(blockMap))
  let count = 0
  const blocksToProcess = Object.keys(clonePageBlock?.block || {})

  // 循环遍历文档的每个block
  for (let i = 0; i < blocksToProcess.length; i++) {
    const blockId = blocksToProcess[i]
    const b = clonePageBlock?.block[blockId]

    if (slice && slice > 0 && count > slice) {
      delete clonePageBlock?.block[blockId]
      continue
    }

    // 当BlockId等于PageId时移除
    if (b?.value?.id === id) {
      // 此block含有敏感信息
      delete b?.value?.properties
      continue
    }

    count++

    // === 【新增】强制修复非法 URL ===
    sanitizeBlockUrls(b?.value)

    if (b?.value?.type === 'sync_block' && b?.value?.children) {
      const childBlocks = b.value.children
      // 移除同步块
      delete clonePageBlock.block[blockId]
      // 用子块替代同步块
      childBlocks.forEach((childBlock, index) => {
        const newBlockId = `${blockId}_child_${index}`
        clonePageBlock.block[newBlockId] = childBlock
        blocksToProcess.splice(i + index + 1, 0, newBlockId)
      })
      // 重新处理新加入的子块
      i--
      continue
    }

    // 处理 c++、c#、汇编等语言名字映射
    if (b?.value?.type === 'code') {
      if (b?.value?.properties?.language?.[0][0] === 'C++') {
        b.value.properties.language[0][0] = 'cpp'
      }
      if (b?.value?.properties?.language?.[0][0] === 'C#') {
        b.value.properties.language[0][0] = 'csharp'
      }
      if (b?.value?.properties?.language?.[0][0] === 'Assembly') {
        b.value.properties.language[0][0] = 'asm6502'
      }
    }

    // 如果是文件，或嵌入式PDF，需要重新加密签名
    if (
      ['file', 'pdf', 'video', 'audio'].includes(b?.value?.type) &&
      b?.value?.properties?.source?.[0][0] &&
      (b?.value?.properties?.source?.[0][0].indexOf('attachment') === 0 ||
        b?.value?.properties?.source?.[0][0].indexOf('amazonaws.com') > 0)
    ) {
      const oldUrl = b?.value?.properties?.source?.[0][0]
      const newUrl = `https://notion.so/signed/${encodeURIComponent(oldUrl)}?table=block&id=${b?.value?.id}`
      b.value.properties.source[0][0] = newUrl
    }
  }

  // 去掉不用的字段
  // if (id === BLOG.NOTION_PAGE_ID) {
  //   return clonePageBlock
  // }
  return clonePageBlock
}

/**
 * 统一 Notion block / collection / collection_view 结构
 * - 兼容新老 Notion 数据
 * - 彻底展开 spaceId
 * - 彻底解包 value.value.value...
 * - 输出 react-notion-x 可直接消费的格式
 */

/* ===========================
 * 主入口
 * =========================== */

export function normalizeNotionBlockMap(blockMap) {
  if (!blockMap || typeof blockMap !== 'object') return blockMap

  const res = {
    ...blockMap,
    // block: blockMap.block,
    collection: normalizeCollectionMap(blockMap.collection),
    collection_view: normalizeCollectionMap(blockMap.collection_view)
  }

  console.log('[Notion BlockMap 规范化]', res)
  return res
}

function normalizeBlockMap(blockMap) {
  if (!blockMap || typeof blockMap !== 'object') return {}

  const result = {}

  for (const [key, raw] of Object.entries(blockMap)) {
    // 新版 Notion：spaceId 层
    if (isSpaceLayer(raw)) {
      for (const [blockId, blockRaw] of Object.entries(raw)) {
        const normalized = normalizeSingleBlock(blockId, blockRaw)
        if (normalized) {
          result[blockId] = normalized
        }
      }
      continue
    }

    // 老版 Notion：直接是 block
    const normalized = normalizeSingleBlock(key, raw)
    if (normalized) {
      result[key] = normalized
    }
  }

  return result
}

function normalizeSingleBlock(blockId, raw) {
  if (!raw || typeof raw !== 'object') {
    console.warn('[normalizeBlockMap] invalid block', blockId, raw)
    return null
  }

  const value = unwrapValueDeep(raw)

  if (!value || !value.id) {
    console.warn('[normalizeBlockMap] missing value.id', blockId, raw)
    return null
  }

  return { value }
}

function unwrapValueDeep(raw) {
  let cur = raw

  // 只要还有 value.value，就继续拆
  while (
    cur &&
    typeof cur === 'object' &&
    cur.value &&
    typeof cur.value === 'object' &&
    cur.value.value
  ) {
    cur = cur.value
  }

  return cur.value ?? cur
}

function isSpaceLayer(obj) {
  if (!obj || typeof obj !== 'object') return false

  // spaceId 层的特征：
  // value 不在第一层，而在第二层
  return Object.values(obj).some(
    v => v && typeof v === 'object' && v.value
  )
}

function normalizeCollectionMap(map) {
  if (!map || typeof map !== 'object') return {}

  const flattened = flattenSpaceMap(map)
  const result = {}

  for (const [id, raw] of Object.entries(flattened)) {
    const value = unwrapValueDeep(raw)
    if (!value) continue

    result[id] = { value }
  }

  return result
}

function flattenSpaceMap(map) {
  const result = {}

  for (const value of Object.values(map)) {
    // 老版：已经是 { id: { value } }
    if (value?.value) {
      return map
    }

    // 新版：{ spaceId: { id: { value } } }
    if (value && typeof value === 'object') {
      for (const [id, raw] of Object.entries(value)) {
        result[id] = raw
      }
    }
  }

  return result
}


/**
 * 根据[]ids，批量抓取blocks
 * 在获取数据库文章列表时，超过一定数量的block会被丢弃，因此根据pageId批量抓取block
 * @param {*} ids
 * @param {*} batchSize
 * @returns
 */
export const fetchInBatches = async (ids, batchSize = 100) => {
  // 如果 ids 不是数组，则将其转换为数组
  if (!Array.isArray(ids)) {
    ids = [ids]
  }

  let fetchedBlocks = {}
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    console.log('[API-->>请求] Fetching missing blocks', ids.length)
    const start = new Date().getTime()
    const pageChunk = await notionAPI.getBlocks(batch)
    const end = new Date().getTime()
    console.log(
      `[API<<--响应] 耗时:${end - start}ms Fetching missing blocks count:${ids.length} `
    )

    console.log('[API<<--响应]')
    fetchedBlocks = Object.assign(
      {},
      fetchedBlocks,
      pageChunk?.recordMap?.block
    )
  }
  return fetchedBlocks
}


/**
 * 强制修复 block 中所有可能的非法 URL 字段
 * @param {Object} blockValue - block.value
 */
function sanitizeBlockUrls(blockValue) {
  if (!blockValue || typeof blockValue !== 'object') return

  const fixUrl = (url) => {
    if (typeof url !== 'string') return url

    if (url.startsWith('/')) {
      return url
    }

    // 修复 http:xxx → http://xxx
    if (url.startsWith('http:') && !url.startsWith('http://')) {
      url = 'http://' + url.slice(5)
    } else if (url.startsWith('https:') && !url.startsWith('https://')) {
      url = 'https://' + url.slice(6)
    }

    // 再次验证是否合法，否则替换为占位图
    try {
      new URL(url)
      return url
    } catch {
      console.warn('[Sanitize URL] Invalid URL replaced:', url)
      return 'https://via.placeholder.com/1x1?text=Invalid+Image'
    }
  }

  // 1. 处理 properties.source（用于 image, embed, bookmark, file, pdf 等）
  if (
    blockValue.properties?.source?.[0]?.[0] &&
    typeof blockValue.properties.source[0][0] === 'string'
  ) {
    blockValue.properties.source[0][0] = fixUrl(blockValue.properties.source[0][0])
  }

  // 2. 处理 file.url（用于 file block）
  if (blockValue.file?.url && typeof blockValue.file.url === 'string') {
    blockValue.file.url = fixUrl(blockValue.file.url)
  }

  // 3. 处理 format.page_cover（页面封面）
  if (blockValue.format?.page_cover && typeof blockValue.format.page_cover === 'string') {
    blockValue.format.page_cover = fixUrl(blockValue.format.page_cover)
  }

  // 4. 处理其他可能的 URL 字段（可选扩展）
  // 例如：video、audio 的 source 可能也走 properties.source，已覆盖
}