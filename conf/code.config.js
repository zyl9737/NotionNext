/**
 * 网页中代码显示的效果
 */
module.exports = {
  // START********代码相关********
  // PrismJs 代码相关
  // START********代码相关********
  // PrismJs 代码相关
  PRISM_JS_PATH: 'https://npm.elemecdn.com/prismjs@1.29.0/components/',
  PRISM_JS_AUTO_LOADER:
    'https://npm.elemecdn.com/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js',

  // 代码主题 @see https://github.com/PrismJS/prism-themes
  PRISM_THEME_PREFIX_PATH:
    process.env.NEXT_PUBLIC_PRISM_THEME_PREFIX_PATH ||
    'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-okaidia.css', // 代码块默认主题
  PRISM_THEME_SWITCH: process.env.NEXT_PUBLIC_PRISM_THEME_SWITCH || true, // 是否开启浅色/深色模式代码主题切换； 开启后将显示以下两个主题
  PRISM_THEME_LIGHT_PATH:
    process.env.NEXT_PUBLIC_PRISM_THEME_LIGHT_PATH ||
    'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-solarizedlight.css', // 浅色模式主题
  PRISM_THEME_DARK_PATH:
    process.env.NEXT_PUBLIC_PRISM_THEME_DARK_PATH ||
    'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-okaidia.min.css', // 深色模式主题

  CODE_MAC_BAR: process.env.NEXT_PUBLIC_CODE_MAC_BAR || true, // 代码左上角显示mac的红黄绿图标
  CODE_LINE_NUMBERS: process.env.NEXT_PUBLIC_CODE_LINE_NUMBERS || false, // 是否显示行号
  CODE_COLLAPSE: process.env.NEXT_PUBLIC_CODE_COLLAPSE || true, // 是否支持折叠代码框
  CODE_COLLAPSE_EXPAND_DEFAULT:
    process.env.NEXT_PUBLIC_CODE_COLLAPSE_EXPAND_DEFAULT || true, // 折叠代码默认是展开状态
  
  // 代码块加载动画相关
  CODE_LOADING_ANIMATION: process.env.NEXT_PUBLIC_CODE_LOADING_ANIMATION || true, // 代码块加载时显示动画
  CODE_RENDER_TIMEOUT: process.env.NEXT_PUBLIC_CODE_RENDER_TIMEOUT || 3000, // 代码块渲染超时时间（毫秒）
  CODE_RENDER_DELAY: process.env.NEXT_PUBLIC_CODE_RENDER_DELAY || 200, // 代码块渲染延迟时间（毫秒）
  
  // 性能优化相关
  CODE_RENDER_PERFORMANCE_MODE: process.env.NEXT_PUBLIC_CODE_PERFORMANCE_MODE || true, // 启用代码渲染性能优化模式
  CODE_HIGHLIGHT_DEBOUNCE_DELAY: process.env.NEXT_PUBLIC_CODE_HIGHLIGHT_DEBOUNCE || 150, // 代码高亮防抖延迟（毫秒）
  // Mermaid 图表CDN
  MERMAID_CDN:
    process.env.NEXT_PUBLIC_MERMAID_CDN ||
    'https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.0/mermaid.min.js',// CDN
  // QRCodeCDN
  QR_CODE_CDN:
  process.env.NEXT_PUBLIC_QR_CODE_CDN ||
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',

  // END********代码相关********
}
