const CONFIG = {
  GITBOOK_INDEX_PAGE: 'archive', // 文档首页显示的内容，'archive'将直接显示归档页面，其它值将重定向到对应slug的文章

  GITBOOK_AUTO_SORT: process.env.NEXT_PUBLIC_GITBOOK_AUTO_SORT || true, // 是否自动按分类名 归组排序文章；自动归组可能会打乱您Notion中的文章顺序

  GITBOOK_LATEST_POST_RED_BADGE:
    process.env.NEXT_PUBLIC_GITBOOK_LATEST_POST_RED_BADGE || false, // 是否给最新文章显示红点

  // 性能优化选项
  GITBOOK_ENABLE_PERFORMANCE_MODE: process.env.NEXT_PUBLIC_GITBOOK_PERFORMANCE_MODE || true, // 启用性能优化模式，减少长文卡顿

  // 菜单
  GITBOOK_MENU_CATEGORY: false, // 显示分类
  GITBOOK_BOOK_MENU_TAG: false, // 显示标签
  GITBOOK_MENU_ARCHIVE: false, // 显示归档
  GITBOOK_MENU_SEARCH: false, // 显示搜索

  // 导航文章自动排他折叠
  GITBOOK_EXCLUSIVE_COLLAPSE: true, // 一次只展开一个分类，其它文件夹自动关闭。

  GITBOOK_FOLDER_HOVER_EXPAND: false, // 左侧导航文件夹鼠标悬停时自动展开；若为false，则要点击才能展开

  // Widget
  GITBOOK_WIDGET_REVOLVER_MAPS:
    process.env.NEXT_PUBLIC_WIDGET_REVOLVER_MAPS || 'true', // 地图插件
  GITBOOK_WIDGET_TO_TOP: true // 跳回顶部
}
export default CONFIG
