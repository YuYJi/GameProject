/**
 * 主题切换Hook
 * 管理应用的明暗主题切换
 */

import { useState, useEffect } from 'react';

// 主题类型定义
type Theme = 'light' | 'dark';

/**
 * 主题管理Hook
 * @returns theme - 当前主题
 * @returns toggleTheme - 切换主题函数
 * @returns isDark - 是否为暗色主题
 */
export function useTheme() {
  // 从localStorage读取主题，或检测系统偏好
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    // 检测系统是否偏好暗色主题
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // 主题变化时更新DOM和localStorage
  useEffect(() => {
    // 移除旧的主题类名
    document.documentElement.classList.remove('light', 'dark');
    // 添加新的主题类名
    document.documentElement.classList.add(theme);
    // 保存到localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  /**
   * 切换主题
   * 在light和dark之间切换
   */
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };
}
