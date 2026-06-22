/**
 * 空白组件
 * 占位用组件，当前未实际使用
 */

import { cn } from '@/lib/utils'

/**
 * 空白占位组件
 * 用于需要占位但暂不显示内容的场景
 */
export default function Empty() {
  return (
    <div className={cn('flex h-full items-center justify-center')}>Empty</div>
  )
}
