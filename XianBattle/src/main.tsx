/**
 * 应用入口文件
 * 创建React根节点并渲染应用
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * 挂载React应用到DOM
 * 使用StrictMode进行开发模式检查
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
