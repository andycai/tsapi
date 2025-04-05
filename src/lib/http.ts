/**
 * HTTP相关的辅助函数
 */

/**
 * 设置重定向响应
 * @param set - Elysia响应设置对象
 * @param url - 重定向的URL
 * @param statusCode - HTTP状态码，默认为302 (临时重定向)
 */
export function redirect(set: any, url: string, statusCode: number = 302): void {
  set.headers = {
    ...(set.headers || {}),
    'Location': url
  } as any
  set.status = statusCode
} 