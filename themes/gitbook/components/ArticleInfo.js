import { useRouter } from 'next/router'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'

/**
 * 文章补充咨询
 * @param {*} param0
 * @returns
 */
export default function ArticleInfo({ post }) {
  const router = useRouter()
  const index = siteConfig('GITBOOK_INDEX_PAGE', 'about', CONFIG)
  
  // 如果是首页且配置为archive，或者没有post，则不显示
  if (!post || (router.route === '/' && index === 'archive')) {
    return null
  }
  
  return (
    <div className='pt-10 pb-6 text-gray-400 text-sm'>
      <i className='fa-regular fa-clock mr-1' />
      Last update:{' '}
      {post.date?.start_date || post?.publishDay || post?.lastEditedDay}
    </div>
  )
}
