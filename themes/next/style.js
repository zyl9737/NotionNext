/* eslint-disable react/no-unknown-property */
/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return (
    <style jsx global>{`
      // 底色
      body {
        background-color: #f0f8ff;
      }
      .dark body {
        background-color: black;
      }

      // 菜单下划线动画
      #theme-next .menu-link {
        text-decoration: none;
        background-image: linear-gradient(#4e80ee, #4e80ee);
        background-repeat: no-repeat;
        background-position: bottom center;
        background-size: 0 2px;
        transition: background-size 100ms ease-in-out;
      }
      #theme-next .menu-link:hover {
        background-size: 100% 2px;
        color: #4e80ee;
      }
      /* 引用样式优化 */
      #theme-next .notion-quote {
        background: #f7f7f7;
        border-left: 3px solid #d1d5db;
        padding: 1rem 1.5rem;
        margin: 1.5rem 0;
        color: #4b5563;
        border-radius: 4px;
        font-size: 1em; /* 明确字体大小与正文一致 */
      }

      /* 移除引用块内段落的默认边距 */
      #theme-next .notion-quote p {
          margin: 0;
      }

      #theme-next .dark .notion-quote {
        background: #2a2a2a;
        border-left-color: #4a4a4a;
        color: #d1d5db;
      }
    `}</style>
  )
}

export { Style }
