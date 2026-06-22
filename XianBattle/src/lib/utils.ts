/**
 * Tailwind CSS 工具函数
 * 合并ClassName，支持Tailwind优先级覆盖
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并多个className，支持Tailwind类名优先级
 * @param inputs - 可变数量的className参数
 * @returns 合并后的className字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
