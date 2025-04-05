import * as utils from './utils'

/**
 * 初始化核心模块
 */
export function initCore() {
  // 导出所有工具类以便全局访问
  return {
    // 工具类
    utils
  }
}

// 导出所有工具类
export { utils }
