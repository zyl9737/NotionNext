import { isBrowser } from '@/lib/utils'
import { useGlobal } from '@/lib/global'
import throttle from 'lodash.throttle'
import { uuidToId } from 'notion-utils'
import { useCallback, useEffect, useState } from 'react'

/**
 * 目录导航组件
 * @param toc
 * @returns {JSX.Element}
 * @constructor
 */
const Catalog = ({ post }) => {
  const toc = post?.toc
  const { locale } = useGlobal()
  // 同步选中目录事件
  const [activeSection, setActiveSection] = useState(null)
  const [showCatalog, setShowCatalog] = useState(true)

  // 监听滚动事件
  useEffect(() => {
    window.addEventListener('scroll', actionSectionScrollSpy)
    actionSectionScrollSpy()
    return () => {
      window.removeEventListener('scroll', actionSectionScrollSpy)
    }
  }, [post])

  const throttleMs = 200
  const actionSectionScrollSpy = useCallback(
    throttle(() => {
      const sections = document.getElementsByClassName('notion-h')
      let prevBBox = null
      let currentSectionId = null
      for (let i = 0; i < sections.length; ++i) {
        const section = sections[i]
        if (!section || !(section instanceof Element)) continue
        if (!currentSectionId) {
          currentSectionId = section.getAttribute('data-id')
        }
        const bbox = section.getBoundingClientRect()
        const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0
        const offset = Math.max(150, prevHeight / 4)
        // GetBoundingClientRect returns values relative to viewport
        if (bbox.top - offset < 0) {
          currentSectionId = section.getAttribute('data-id')
          prevBBox = bbox
          continue
        }
        // No need to continue loop, if last element has been detected
        break
      }
      setActiveSection(currentSectionId)
      const tocIds = post?.toc?.map(t => uuidToId(t.id)) || []
      const index = tocIds.indexOf(currentSectionId) || 0
      if (isBrowser && tocIds?.length > 0) {
        for (const tocWrapper of document?.getElementsByClassName(
          'toc-wrapper'
        )) {
          tocWrapper?.scrollTo({ top: 28 * index, behavior: 'smooth' })
        }
      }
    }, throttleMs)
  )

  // 无目录就直接返回空
  if (!toc || toc?.length < 1) {
    return <></>
  }
  
  const toggleCatalog = () => {
    setShowCatalog(!showCatalog)
  }

  return (
    <div className="catalog-container bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-5 border dark:border-gray-700">
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleCatalog}>
        <div className="text-lg font-medium flex items-center text-gray-700 dark:text-gray-300">
          <i className="mr-2 fas fa-list-ul text-green-500 dark:text-green-400" />
          {locale.COMMON.TABLE_OF_CONTENTS}
        </div>
        <div className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors duration-200">
          <i className={`fas ${showCatalog ? 'fa-chevron-up' : 'fa-chevron-down'} text-sm`} />
        </div>
      </div>

      {showCatalog && (
        <div
          id='toc-wrapper'
          className='toc-wrapper overflow-y-auto my-2 max-h-80 overscroll-none scroll-hidden transition-all duration-500'
          style={{ maxHeight: showCatalog ? '20rem' : '0' }}>
          <nav className='h-full text-black'>
            {toc?.map(tocItem => {
              const id = uuidToId(tocItem.id)
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`${activeSection === id 
                    ? 'border-green-500 text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-opacity-10 rounded' 
                    : 'border-gray-200 dark:border-gray-700'
                  } border-l-2 pl-4 block hover:text-green-600 dark:hover:text-green-400 duration-300 py-1 my-1 transition-colors truncate`}>
                  <span
                    style={{
                      display: 'inline-block',
                      marginLeft: tocItem.indentLevel * 16
                    }}>
                    {tocItem.text}
                  </span>
                </a>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}

export default Catalog
