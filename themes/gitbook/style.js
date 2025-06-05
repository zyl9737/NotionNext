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
      
      /* 标题样式重新设计 - 左上角灰色H标记 */
      #theme-gitbook .notion-h1,
      #theme-gitbook .notion-h2,
      #theme-gitbook .notion-h3,
      #theme-gitbook .notion-h4,
      #theme-gitbook .notion-h5,
      #theme-gitbook .notion-h6 {
        position: relative;
        padding-left: 2rem;
        margin-top: 1.5rem;
        margin-bottom: 0.8rem;
        line-height: 1.4;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      
      /* H1 样式 */
      #theme-gitbook .notion-h1 {
        font-size: 2rem;
        color: #1a1a1a;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 0.5rem;
        margin-bottom: 1.2rem;
      }
      
      #theme-gitbook .notion-h1::before {
        content: "H1";
        position: absolute;
        left: 0;
        top: 0;
        font-size: 0.7rem;
        font-weight: 500;
        color: #9ca3af;
        background-color: #f3f4f6;
        padding: 0.15rem 0.3rem;
        border-radius: 3px;
        letter-spacing: 0.3px;
        transition: all 0.3s ease;
        z-index: 1;
      }
      
      /* H2 样式 */
      #theme-gitbook .notion-h2 {
        font-size: 1.6rem;
        color: #2d3748;
        border-left: 3px solid #e5e7eb;
        padding-left: 0.8rem;
        margin-left: -0.8rem;
      }
      
      #theme-gitbook .notion-h2::before {
        content: "H2";
        position: absolute;
        left: 0;
        top: 0;
        font-size: 0.65rem;
        font-weight: 500;
        color: #6b7280;
        background-color: #f9fafb;
        padding: 0.12rem 0.25rem;
        border-radius: 3px;
        letter-spacing: 0.3px;
        transition: all 0.3s ease;
        z-index: 1;
      }
      
      /* H3 样式 */
      #theme-gitbook .notion-h3 {
        font-size: 1.4rem;
        color: #374151;
      }
      
      #theme-gitbook .notion-h3::before {
        content: "H3";
        position: absolute;
        left: 0;
        top: 0;
        font-size: 0.6rem;
        font-weight: 500;
        color: #6b7280;
        background-color: #f9fafb;
        padding: 0.1rem 0.2rem;
        border-radius: 2px;
        letter-spacing: 0.3px;
        transition: all 0.3s ease;
        z-index: 1;
      }
      
      /* H4 样式 */
      #theme-gitbook .notion-h4 {
        font-size: 1.2rem;
        color: #4b5563;
      }
      
      #theme-gitbook .notion-h4::before {
        content: "H4";
        position: absolute;
        left: 0;
        top: 0;
        font-size: 0.55rem;
        font-weight: 500;
        color: #9ca3af;
        background-color: #f9fafb;
        padding: 0.08rem 0.18rem;
        border-radius: 2px;
        letter-spacing: 0.3px;
        transition: all 0.3s ease;
        z-index: 1;
      }
      
      /* H5 样式 */
      #theme-gitbook .notion-h5 {
        font-size: 1.1rem;
        color: #6b7280;
      }
      
      #theme-gitbook .notion-h5::before {
        content: "H5";
        position: absolute;
        left: 0;
        top: 0;
        font-size: 0.5rem;
        font-weight: 500;
        color: #9ca3af;
        background-color: #f9fafb;
        padding: 0.06rem 0.15rem;
        border-radius: 2px;
        letter-spacing: 0.3px;
        transition: all 0.3s ease;
        z-index: 1;
      }
      
      /* H6 样式 */
      #theme-gitbook .notion-h6 {
        font-size: 1rem;
        color: #9ca3af;
      }
      
      #theme-gitbook .notion-h6::before {
        content: "H6";
        position: absolute;
        left: 0;
        top: 0;
        font-size: 0.45rem;
        font-weight: 500;
        color: #9ca3af;
        background-color: #f9fafb;
        padding: 0.05rem 0.12rem;
        border-radius: 2px;
        letter-spacing: 0.3px;
        transition: all 0.3s ease;
        z-index: 1;
      }
      
      /* 确保链接锚点跟在标题文字后面 */
      #theme-gitbook .notion-h1 a,
      #theme-gitbook .notion-h2 a,
      #theme-gitbook .notion-h3 a,
      #theme-gitbook .notion-h4 a,
      #theme-gitbook .notion-h5 a,
      #theme-gitbook .notion-h6 a {
        position: relative;
        z-index: 2;
      }
      
      /* 隐藏标题内部的链接装饰 */
      #theme-gitbook .notion-h1 a::before,
      #theme-gitbook .notion-h2 a::before,
      #theme-gitbook .notion-h3 a::before,
      #theme-gitbook .notion-h4 a::before,
      #theme-gitbook .notion-h5 a::before,
      #theme-gitbook .notion-h6 a::before {
        display: none !important;
      }
      
      /* 鼠标悬停效果 */
      #theme-gitbook .notion-h1:hover::before,
      #theme-gitbook .notion-h2:hover::before,
      #theme-gitbook .notion-h3:hover::before {
        background-color: #e5e7eb;
        color: #374151;
        transform: scale(1.05);
      }
      
      #theme-gitbook .notion-h4:hover::before,
      #theme-gitbook .notion-h5:hover::before,
      #theme-gitbook .notion-h6:hover::before {
        background-color: #e5e7eb;
        color: #6b7280;
        transform: scale(1.05);
      }
      
      /* 暗黑模式下的标题样式 */
      .dark #theme-gitbook .notion-h1 {
        color: #f9fafb;
        border-bottom-color: #374151;
      }
      
      .dark #theme-gitbook .notion-h2 {
        color: #e5e7eb;
        border-left-color: #374151;
      }
      
      .dark #theme-gitbook .notion-h3 {
        color: #d1d5db;
      }
      
      .dark #theme-gitbook .notion-h4 {
        color: #9ca3af;
      }
      
      .dark #theme-gitbook .notion-h5 {
        color: #6b7280;
      }
      
      .dark #theme-gitbook .notion-h6 {
        color: #4b5563;
      }
      
      /* 暗黑模式下的H标记 */
      .dark #theme-gitbook .notion-h1::before,
      .dark #theme-gitbook .notion-h2::before,
      .dark #theme-gitbook .notion-h3::before {
        color: #9ca3af;
        background-color: #374151;
      }
      
      .dark #theme-gitbook .notion-h4::before,
      .dark #theme-gitbook .notion-h5::before,
      .dark #theme-gitbook .notion-h6::before {
        color: #6b7280;
        background-color: #374151;
      }
      
      /* 暗黑模式悬停效果 */
      .dark #theme-gitbook .notion-h1:hover::before,
      .dark #theme-gitbook .notion-h2:hover::before,
      .dark #theme-gitbook .notion-h3:hover::before,
      .dark #theme-gitbook .notion-h4:hover::before,
      .dark #theme-gitbook .notion-h5:hover::before,
      .dark #theme-gitbook .notion-h6:hover::before {
        background-color: #4b5563;
        color: #d1d5db;
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
        
        /* 移动端标题样式调整 */
        #theme-gitbook .notion-h1,
        #theme-gitbook .notion-h2,
        #theme-gitbook .notion-h3,
        #theme-gitbook .notion-h4,
        #theme-gitbook .notion-h5,
        #theme-gitbook .notion-h6 {
          padding-left: 1.5rem;
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
