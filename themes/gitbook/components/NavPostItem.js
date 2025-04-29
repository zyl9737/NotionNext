import Badge from '@/components/Badge'
import Collapse from '@/components/Collapse'
import { siteConfig } from '@/lib/config'
import { useEffect, useState } from 'react'
import BlogPostCard from './BlogPostCard'

/**
 * 导航列表
 * @param posts 所有文章
 * @param tags 所有标签
 * @returns {JSX.Element}
 * @constructor
 */
const NavPostItem = props => {
  const { group, expanded, toggleItem } = props // 接收传递的展开状态和切换函数
  const hoverExpand = siteConfig('GITBOOK_FOLDER_HOVER_EXPAND')
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [hoverState, setHoverState] = useState(false)

  // 检测是否为触摸设备
  useEffect(() => {
    const checkTouchDevice = () => {
      if (window.matchMedia('(pointer: coarse)').matches) {
        setIsTouchDevice(true)
      }
    }
    checkTouchDevice()

    // 可选：监听窗口大小变化时重新检测
    window.addEventListener('resize', checkTouchDevice)
    return () => {
      window.removeEventListener('resize', checkTouchDevice)
    }
  }, [])

  // 当展开状态改变时触发切换函数，并根据传入的展开状态更新内部状态
  const toggleOpenSubMenu = () => {
    toggleItem() // 调用父组件传递的切换函数
  }
  
  const onHoverToggle = () => {
    // 允许鼠标悬停时自动展开，而非点击展开
    if (!hoverExpand || isTouchDevice) {
      return
    }
    toggleOpenSubMenu()
  }

  const handleMouseEnter = () => {
    setHoverState(true)
    onHoverToggle()
  }

  const handleMouseLeave = () => {
    setHoverState(false)
  }

  const groupHasLatest = group?.items?.some(post => post.isLatest)

  if (group?.category) {
    return (
      <>
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleOpenSubMenu}
          className={`cursor-pointer relative flex justify-between text-md p-2 rounded-md transition-all duration-200
            ${hoverState ? 'bg-gray-50 dark:bg-gray-700 transform translate-x-1' : ''}
            ${expanded ? 'bg-gray-100 dark:bg-gray-700 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
          `}
          key={group?.category}>
          <span className={`${expanded ? 'text-blue-600 dark:text-blue-400' : ''} flex items-center`}>
            <i className="far fa-folder mr-2"></i>
            {group?.category}
          </span>
          <div className='inline-flex items-center select-none'>
            <i
              className={`px-2 fas fa-chevron-down transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}></i>
            {groupHasLatest &&
              siteConfig('GITBOOK_LATEST_POST_RED_BADGE') && <Badge />}
          </div>
        </div>
        <Collapse isOpen={expanded} onHeightChange={props.onHeightChange}>
          <div className={`ml-3 pl-2 border-l-2 ${expanded ? 'border-blue-300 dark:border-blue-700' : 'border-gray-200 dark:border-gray-700'}`}>
            {group?.items?.map((post, index) => (
              <div key={index} className={`transition-all duration-200 ${expanded ? 'animate-fadeIn' : ''}`}>
                <BlogPostCard className='ml-2' post={post} />
              </div>
            ))}
          </div>
        </Collapse>
      </>
    )
  } else {
    return (
      <>
        {group?.items?.map((post, index) => (
          <div key={index} className="hover:translate-x-1 transition-transform duration-200">
            <BlogPostCard className='text-md py-2' post={post} />
          </div>
        ))}
      </>
    )
  }
}

export default NavPostItem
