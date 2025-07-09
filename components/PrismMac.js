import { useCallback, useEffect, useRef } from 'react'
import Prism from 'prismjs'
// 所有语言的prismjs 使用autoloader引入
// import 'prismjs/plugins/autoloader/prism-autoloader'
import 'prismjs/plugins/toolbar/prism-toolbar'
import 'prismjs/plugins/toolbar/prism-toolbar.min.css'
import 'prismjs/plugins/show-language/prism-show-language'
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard'
import 'prismjs/plugins/line-numbers/prism-line-numbers'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

// mermaid图
import { loadExternalResource } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useGlobal } from '@/lib/global'
import { siteConfig } from '@/lib/config'

/**
 * 代码美化相关 - 性能优化版本
 * @author https://github.com/txs/
 * @returns
 */
const PrismMac = () => {
  const router = useRouter()
  const { isDarkMode } = useGlobal()
  const codeMacBar = siteConfig('CODE_MAC_BAR')
  const prismjsAutoLoader = siteConfig('PRISM_JS_AUTO_LOADER')
  const prismjsPath = siteConfig('PRISM_JS_PATH')

  const prismThemeSwitch = siteConfig('PRISM_THEME_SWITCH')
  const prismThemeDarkPath = siteConfig('PRISM_THEME_DARK_PATH')
  const prismThemeLightPath = siteConfig('PRISM_THEME_LIGHT_PATH')
  const prismThemePrefixPath = siteConfig('PRISM_THEME_PREFIX_PATH')

  const mermaidCDN = siteConfig('MERMAID_CDN')
  const codeLineNumbers = siteConfig('CODE_LINE_NUMBERS')

  const codeCollapse = siteConfig('CODE_COLLAPSE')
  const codeCollapseExpandDefault = siteConfig('CODE_COLLAPSE_EXPAND_DEFAULT')
  
  // 使用 useRef 跟踪初始化状态，避免多次执行
  const initialized = useRef(false)
  const renderAttempts = useRef(0)
  const maxRenderAttempts = 3 // 减少最大尝试次数
  const observersRef = useRef([]) // 存储所有 observer，便于清理
  const debounceTimerRef = useRef(null) // 防抖定时器

  // 防抖渲染函数
  const debouncedRender = useCallback((renderFunction, delay = 150) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      renderFunction()
    }, delay)
  }, [])

  // 清理所有 observers
  const cleanupObservers = useCallback(() => {
    observersRef.current.forEach(observer => observer.disconnect())
    observersRef.current = []
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
  }, [])

  useEffect(() => {
    // 主要的初始化逻辑
    const initializePrism = async () => {
      if (initialized.current) return
      
      try {
        // 1. 首先加载样式文件
        if (codeMacBar) {
          await loadExternalResource('/css/prism-mac-style.css', 'css')
        }
        
        // 2. 加载 Prism 主题样式
        await loadPrismThemeCSS(
          isDarkMode,
          prismThemeSwitch,
          prismThemeDarkPath,
          prismThemeLightPath,
          prismThemePrefixPath
        )
        
        // 3. 加载 PrismJS 自动加载器
        if (prismjsAutoLoader) {
          await loadExternalResource(prismjsAutoLoader, 'js')
          if (window?.Prism?.plugins?.autoloader) {
            window.Prism.plugins.autoloader.languages_path = prismjsPath
          }
        }
        
        // 等待 DOM 元素准备好
        checkAndRenderWhenReady()
      } catch (error) {
        console.error('PrismMac 初始化失败:', error)
      }
    }

    // 检查 DOM 元素是否准备好并尝试渲染
    const checkAndRenderWhenReady = () => {
      const container = document?.getElementById('notion-article')
      const codeBlocks = container?.getElementsByTagName('pre')
      
      if (container && codeBlocks && codeBlocks.length > 0) {
        // DOM 已准备好，可以渲染
        debouncedRender(() => {
          renderAllCodeBlocks()
          initialized.current = true
        }, 100)
      } else if (renderAttempts.current < maxRenderAttempts) {
        // DOM 还没准备好，延迟重试
        renderAttempts.current += 1
        setTimeout(checkAndRenderWhenReady, 500) // 增加延迟间隔
      }
    }
    
    // 渲染所有代码块
    const renderAllCodeBlocks = () => {
      // 批量处理，减少重排次数
      renderPrismMac(codeLineNumbers)
      renderMermaid(mermaidCDN)
      renderCollapseCode(codeCollapse, codeCollapseExpandDefault)
    }
    
    // 启动初始化过程
    initializePrism()
    
    // 当路由或暗黑模式状态变化时重新初始化
    return () => {
      cleanupObservers()
      initialized.current = false
      renderAttempts.current = 0
    }
  }, [router, isDarkMode, debouncedRender, cleanupObservers, codeLineNumbers, codeMacBar, mermaidCDN, prismjsAutoLoader, prismjsPath, prismThemeSwitch, prismThemeDarkPath, prismThemeLightPath, prismThemePrefixPath, codeCollapse, codeCollapseExpandDefault])

  // 监听 DOM 变化，处理动态加载的内容 - 优化版本
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // 监视 notion-article 元素的变化
    const observer = new MutationObserver((mutations) => {
      // 使用防抖避免频繁触发
      debouncedRender(() => {
        // 检测是否有新的代码块被添加
        const hasNewCodeBlocks = mutations.some(mutation => {
          return Array.from(mutation.addedNodes).some(node => {
            if (node.nodeType === 1) { // Element node
              return node.tagName === 'PRE' || 
                    node.querySelector('pre') ||
                    node.classList?.contains('notion-code')
            }
            return false
          })
        })
        
        // 如果有新的代码块，重新渲染
        if (hasNewCodeBlocks) {
          renderPrismMac(codeLineNumbers)
          renderCollapseCode(codeCollapse, codeCollapseExpandDefault)
        }
      }, 200) // 增加防抖延迟
    })
    
    // 开始监视变化
    const articleElement = document.getElementById('notion-article')
    if (articleElement) {
      observer.observe(articleElement, { 
        childList: true, 
        subtree: true 
      })
      observersRef.current.push(observer)
    }
    
    return () => {
      observer.disconnect()
    }
  }, [debouncedRender, codeLineNumbers, codeCollapse, codeCollapseExpandDefault])

  return <></>
}

/**
 * 加载Prism主题样式
 */
const loadPrismThemeCSS = async (
  isDarkMode,
  prismThemeSwitch,
  prismThemeDarkPath,
  prismThemeLightPath,
  prismThemePrefixPath
) => {
  let PRISM_THEME
  let PRISM_PREVIOUS
  if (prismThemeSwitch) {
    if (isDarkMode) {
      PRISM_THEME = prismThemeDarkPath
      PRISM_PREVIOUS = prismThemeLightPath
    } else {
      PRISM_THEME = prismThemeLightPath
      PRISM_PREVIOUS = prismThemeDarkPath
    }
    const previousTheme = document.querySelector(
      `link[href="${PRISM_PREVIOUS}"]`
    )
    if (
      previousTheme &&
      previousTheme.parentNode &&
      previousTheme.parentNode.contains(previousTheme)
    ) {
      previousTheme.parentNode.removeChild(previousTheme)
    }
    await loadExternalResource(PRISM_THEME, 'css')
  } else {
    await loadExternalResource(prismThemePrefixPath, 'css')
  }
}

/*
 * 将代码块转为可折叠对象 - 性能优化版本
 */
const renderCollapseCode = (codeCollapse, codeCollapseExpandDefault) => {
  if (!codeCollapse) {
    return
  }
  
  // 使用 DocumentFragment 批量操作 DOM，减少重排
  const codeBlocks = document.querySelectorAll('.code-toolbar:not(.processed)')
  if (!codeBlocks || codeBlocks.length === 0) return
  
  // 批量处理，避免逐个操作导致的频繁重排
  requestAnimationFrame(() => {
    for (const codeBlock of codeBlocks) {
      // 标记为已处理，避免重复处理
      codeBlock.classList.add('processed')
      
      // 判断当前元素是否被包裹
      if (codeBlock.closest('.collapse-wrapper')) {
        continue // 如果被包裹了，跳过当前循环
      }

      const code = codeBlock.querySelector('code')
      if (!code) continue
      
      const languageMatch = code.getAttribute('class')?.match(/language-(\w+)/)
      const language = languageMatch ? languageMatch[1] : '代码'

      // 使用 DocumentFragment 创建新元素
      const fragment = document.createDocumentFragment()
      
      const collapseWrapper = document.createElement('div')
      collapseWrapper.className = 'collapse-wrapper w-full py-2'
      
      const panelWrapper = document.createElement('div')
      panelWrapper.className =
        'border dark:border-gray-600 rounded-md hover:border-indigo-500 duration-200 transition-colors'

      const header = document.createElement('div')
      header.className =
        'flex justify-between items-center px-4 py-2 cursor-pointer select-none'
      header.innerHTML = `<h3 class="text-lg font-medium">${language}</h3><svg class="transition-all duration-200 w-5 h-5 transform rotate-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6.293 6.293a1 1 0 0 1 1.414 0L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 0-1.414z" clip-rule="evenodd"/></svg>`

      const panel = document.createElement('div')
      panel.className =
        'invisible h-0 transition-transform duration-200 border-t border-gray-300'

      // 组装元素
      panelWrapper.appendChild(header)
      panelWrapper.appendChild(panel)
      collapseWrapper.appendChild(panelWrapper)
      fragment.appendChild(collapseWrapper)
      
      // 一次性插入DOM
      codeBlock.parentNode.insertBefore(fragment, codeBlock)
      panel.appendChild(codeBlock)

      // 优化的折叠函数
      function collapseCode() {
        // 使用 requestAnimationFrame 优化动画性能
        requestAnimationFrame(() => {
          panel.classList.toggle('invisible')
          panel.classList.toggle('h-0')
          panel.classList.toggle('h-auto')
          header.querySelector('svg').classList.toggle('rotate-180')
          panelWrapper.classList.toggle('border-gray-300')
        })
      }

      // 点击后折叠展开代码
      header.addEventListener('click', collapseCode)
      
      // 是否自动展开
      if (codeCollapseExpandDefault) {
        // 延迟执行，避免阻塞渲染
        setTimeout(() => {
          collapseCode()
        }, 0)
      }
    }
  })
}

/**
 * 将mermaid语言 渲染成图片
 */
const renderMermaid = async(mermaidCDN) => {
  if (!document.querySelector('#notion-article')) return
  
  // 检查现有的 mermaid 代码块
  const mermaidCodeBlocks = document.querySelectorAll('.notion-code.language-mermaid')
  let needRender = false
  
  for (const block of mermaidCodeBlocks) {
    const chart = block.querySelector('code')?.textContent
    if (chart && !block.querySelector('.mermaid')) {
      const mermaidChart = document.createElement('pre')
      mermaidChart.className = 'mermaid'
      mermaidChart.innerHTML = chart
      block.appendChild(mermaidChart)
      needRender = true
    }
  }
  
  // 如果需要渲染 mermaid 图表
  if (needRender) {
    try {
      await loadExternalResource(mermaidCDN, 'js')
      setTimeout(() => {
        const mermaid = window.mermaid
        mermaid?.contentLoaded()
      }, 100)
    } catch (error) {
      console.error('加载 Mermaid 失败:', error)
    }
  }

  // 设置监视器处理动态添加的 mermaid 代码块
  const observer = new MutationObserver(mutationsList => {
    mutationsList.forEach(m => {
      if (m.target.className === 'notion-code language-mermaid') {
        const chart = m.target.querySelector('code')?.textContent
        if (chart && !m.target.querySelector('.mermaid')) {
          const mermaidChart = document.createElement('pre')
          mermaidChart.className = 'mermaid'
          mermaidChart.innerHTML = chart
          m.target.appendChild(mermaidChart)
          
          // 异步加载 mermaid 但不阻塞 observer
          loadExternalResource(mermaidCDN, 'js').then(() => {
            setTimeout(() => {
              window.mermaid?.contentLoaded()
            }, 100)
          }).catch(error => {
            console.error('动态加载 Mermaid 失败:', error)
          })
        }
      }
    })
  })
  
  const articleElement = document.querySelector('#notion-article')
  if (articleElement) {
    observer.observe(articleElement, {
      attributes: true,
      subtree: true
    })
  }
}

function renderPrismMac(codeLineNumbers) {
  const container = document?.getElementById('notion-article')
  if (!container) return

  // 使用 requestAnimationFrame 优化渲染性能
  requestAnimationFrame(() => {
    // Add line numbers
    if (codeLineNumbers) {
      const codeBlocks = container.getElementsByTagName('pre')
      if (codeBlocks) {
        Array.from(codeBlocks).forEach(item => {
          if (!item.classList.contains('line-numbers')) {
            item.classList.add('line-numbers')
            item.style.whiteSpace = 'pre-wrap'
          }
        })
      }
    }

    try {
      // 确保 Prism 已加载
      if (typeof Prism !== 'undefined') {
        // 只高亮新添加的代码块，而不是所有代码块
        const unprocessedBlocks = container.querySelectorAll('pre code:not(.prism-processed)')
        if (unprocessedBlocks.length > 0) {
          unprocessedBlocks.forEach(block => {
            Prism.highlightElement(block)
            block.classList.add('prism-processed')
          })
        }
      }
    } catch (err) {
      console.error('代码渲染出错:', err)
    }

    // 添加 Mac 样式 UI - 延迟执行避免阻塞
    setTimeout(() => {
      const codeToolBars = container.querySelectorAll('.code-toolbar:not(.mac-styled)')
      if (codeToolBars && codeToolBars.length > 0) {
        Array.from(codeToolBars).forEach(item => {
          // 标记为已处理
          item.classList.add('mac-styled')
          
          // 检查是否已经有 pre-mac 元素
          if (!item.querySelector('.pre-mac')) {
            const preMac = document.createElement('div')
            preMac.classList.add('pre-mac')
            preMac.innerHTML = '<span></span><span></span><span></span>'
            item.appendChild(preMac)
          }
        })
      }
      
      // 修复行号样式
      if (codeLineNumbers) {
        fixCodeLineStyle()
      }
    }, 50)
  })
}

/**
 * 行号样式在首次渲染或被detail折叠后行高判断错误
 * 在此手动resize计算
 */
const fixCodeLineStyle = () => {
  // 检查是否有需要修复的代码块
  const preCodes = document.querySelectorAll('pre.notion-code.line-numbers')
  for (const preCode of preCodes) {
    if (typeof Prism !== 'undefined' && 
        Prism.plugins && 
        Prism.plugins.lineNumbers) {
      Prism.plugins.lineNumbers.resize(preCode)
    }
  }
  
  // 观察 details 元素的变化，处理折叠导致的行号问题
  const observer = new MutationObserver(mutationsList => {
    for (const m of mutationsList) {
      if (m.target.nodeName === 'DETAILS' || 
          m.target.classList.contains('collapse-wrapper')) {
        setTimeout(() => {
          const affectedCodes = m.target.querySelectorAll('pre.notion-code.line-numbers')
          for (const code of affectedCodes) {
            if (typeof Prism !== 'undefined' && 
                Prism.plugins && 
                Prism.plugins.lineNumbers) {
              Prism.plugins.lineNumbers.resize(code)
            }
          }
        }, 100)
      }
    }
  })
  
  if (document.querySelector('#notion-article')) {
    observer.observe(document.querySelector('#notion-article'), {
      attributes: true,
      subtree: true
    })
  }
}

export default PrismMac
