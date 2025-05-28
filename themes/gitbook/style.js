/* eslint-disable react/no-unknown-property */
/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return (
    <style jsx global>{`
      /* 整体样式设置 */
      body {
        transition: background-color 0.3s ease;
      }

      /* 明亮模式 */
      body {
        background-color: #f8f9fa;
      }
      
      /* 暗黑模式设置 */
      .dark body {
        background-color: #121212;
        color: #e0e0e0;
      }
      
      /* 内容区域样式 */
      #theme-gitbook #container-inner {
        background-color: white;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        padding: 2rem;
        margin-top: 1.5rem;
        transition: all 0.3s ease;
      }
      
      .dark #theme-gitbook #container-inner {
        background-color: #1e1e1e;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      }
      
      /* 标题美化 */
      #theme-gitbook h1 {
        font-size: 2.2rem;
        letter-spacing: -0.5px;
        border-bottom: 2px solid #f0f0f0;
        padding-bottom: 0.75rem;
        margin-bottom: 1.5rem;
        transition: border-color 0.3s ease;
      }
      
      /* 标题井号样式 - 修改为鼠标悬停显示绿色标记 */
      #theme-gitbook .notion-h1::after,
      #theme-gitbook .notion-h2::after,
      #theme-gitbook .notion-h3::after,
      #theme-gitbook .notion-h4::after,
      #theme-gitbook .notion-h5::after,
      #theme-gitbook .notion-h6::after {
        color: #2ecc71;
        font-weight: normal;
        margin-left: 0.5rem;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      /* 鼠标悬停时显示井号 */
      #theme-gitbook .notion-h1:hover::after,
      #theme-gitbook .notion-h2:hover::after,
      #theme-gitbook .notion-h3:hover::after,
      #theme-gitbook .notion-h4:hover::after,
      #theme-gitbook .notion-h5:hover::after,
      #theme-gitbook .notion-h6:hover::after {
        opacity: 0.8;
      }
      
      /* 各级标题井号内容 */
      #theme-gitbook .notion-h1::after {
        content: " #";
      }
      
      #theme-gitbook .notion-h2::after {
        content: " ##";
      }
      
      #theme-gitbook .notion-h3::after {
        content: " ###";
      }
      
      #theme-gitbook .notion-h4::after {
        content: " ####";
      }
      
      #theme-gitbook .notion-h5::after {
        content: " #####";
      }
      
      #theme-gitbook .notion-h6::after {
        content: " ######";
      }
      
      /* 暗黑模式下#号颜色调整 */
      .dark #theme-gitbook .notion-h1:hover::after,
      .dark #theme-gitbook .notion-h2:hover::after,
      .dark #theme-gitbook .notion-h3:hover::after,
      .dark #theme-gitbook .notion-h4:hover::after,
      .dark #theme-gitbook .notion-h5:hover::after,
      .dark #theme-gitbook .notion-h6:hover::after {
        color: #2ecc71;
      }
      
      /* 导航菜单美化 */
      #theme-gitbook .sticky {
        transition: all 0.3s ease;
      }
      
      /* 底部按钮组美化 */
      .bottom-button-group {
        box-shadow: 0px -3px 10px 0px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-top: 1px solid rgba(230, 230, 230, 0.7);
        transition: all 0.3s ease;
      }
      
      .dark .bottom-button-group {
        box-shadow: 0px -3px 10px 0px rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(50, 50, 50, 0.7);
        background-color: rgba(30, 30, 30, 0.8);
      }
      
      /* 文章卡片美化 */
      #theme-gitbook .hover\:bg-gray-100:hover {
        transform: translateY(-2px);
        transition: transform 0.2s ease, background-color 0.2s ease;
      }
      
      /* 代码块美化 */
      #theme-gitbook pre {
        border-radius: 6px;
        padding: 1rem;
        margin: 1.5rem 0;
        background-color: #f6f8fa !important;
        border: 1px solid #eaeaea;
        overflow: auto;
      }
      
      .dark #theme-gitbook pre {
        background-color: #2d2d2d !important;
        border-color: #444;
      }
      
      /* 表格美化 */
      #theme-gitbook table {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
        border-radius: 5px;
        overflow: hidden;
        margin: 1.5rem 0;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      }
      
      #theme-gitbook th {
        background-color: #f5f5f5;
        font-weight: 600;
        text-align: left;
        padding: 0.75rem 1rem;
        border-bottom: 2px solid #eaeaea;
      }
      
      .dark #theme-gitbook th {
        background-color: #333;
        border-bottom-color: #444;
      }
      
      #theme-gitbook td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #eaeaea;
      }
      
      .dark #theme-gitbook td {
        border-bottom-color: #333;
      }
      
      #theme-gitbook tr:last-child td {
        border-bottom: none;
      }
      
      /* 滚动条美化 */
      #theme-gitbook ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      #theme-gitbook ::-webkit-scrollbar-track {
        background: transparent;
      }
      
      #theme-gitbook ::-webkit-scrollbar-thumb {
        background-color: #d1d1d1;
        border-radius: 3px;
      }
      
      .dark #theme-gitbook ::-webkit-scrollbar-thumb {
        background-color: #555;
      }
      
      /* 引用块美化 */
      #theme-gitbook blockquote {
        border-left: 4px solid #e6e6e6;
        padding-left: 1rem;
        color: #666;
        font-style: italic;
        margin: 1.5rem 0;
      }
      
      .dark #theme-gitbook blockquote {
        border-left-color: #444;
        color: #aaa;
      }
      
      /* 响应式优化 */
      @media (max-width: 768px) {
        #theme-gitbook #container-inner {
          padding: 1.5rem;
          border-radius: 0;
          margin-top: 0;
        }
        
        #theme-gitbook h1 {
          font-size: 1.8rem;
        }
      }
      
      /* 动画效果 */
      #theme-gitbook .transition-all {
        transition: all 0.3s ease;
      }
    `}</style>
  )
}

export { Style }
