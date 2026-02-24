import { fetchGlobalAllData } from './SiteDataApi'

/**
 * 获取全局站点数据的包装函数
 * 用于 RSS 和其他需要动态导入的场景
 * @param {Object} options 
 * @param {string} options.pageId - Notion 页面 ID
 * @param {string} options.from - 请求来源
 * @param {boolean} options.simplifySiteData - 是否简化数据（用于性能优化）
 * @returns {Promise<Object>} 站点数据
 */
export async function getGlobalData({ pageId, from, simplifySiteData = false }) {
  try {
    const data = await fetchGlobalAllData({
      pageId,
      from
    })

    // 如果需要简化数据，移除不必要的字段来减少内存占用
    if (simplifySiteData && data) {
      return {
        allPages: data.allPages || [],
        siteInfo: data.siteInfo || {},
        NOTION_CONFIG: data.NOTION_CONFIG || {},
        tagOptions: data.tagOptions || [],
        categoryOptions: data.categoryOptions || []
      }
    }

    return data
  } catch (error) {
    console.error('[getSiteData] Error fetching global data:', error)
    throw error
  }
}

export { fetchGlobalAllData } from './SiteDataApi'
