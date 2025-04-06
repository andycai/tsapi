import { Context } from 'elysia';
import { ApiCode } from '../core/constants/code';
import { template } from './template';

/**
 * 处理API错误响应
 * @param context Elysia错误上下文
 * @returns 标准化的JSON错误响应
 */
export function handleApiError({ error, code, set }: any): any {
  // API路由返回JSON错误响应
  if (code === 'NOT_FOUND') {
    set.status = 404;
    return { code: ApiCode.NOT_FOUND, message: 'API endpoint not found' };
  }
  
  if (code === 'VALIDATION') {
    console.error('验证错误详情:', JSON.stringify(error, null, 2));
    
    let details = 'Invalid data format';
    
    if (error.all) {
      details = error.all.map((err: any) => `${err.path}: ${err.message}`).join('; ');
    } else if (error.message) {
      details = error.message;
    }
    
    set.status = 400;
    
    return { 
      code: ApiCode.DATA_VALIDATION_FAILED, 
      message: 'Validation Error: ' + details,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    };
  }

  if (code === 403) {
    set.status = 403;
    return { code: ApiCode.FORBIDDEN, message: 'Forbidden - Insufficient permissions' };
  }
  
  if (code === 401) {
    set.status = 401;
    return { code: ApiCode.UNAUTHORIZED, message: 'Unauthorized - Please login' };
  }

  console.error('API服务器错误:', error);
  set.status = 500;
  return { code: ApiCode.SERVER_ERROR, message: 'Server Error' };
}

/**
 * 处理管理页面错误响应
 * @param context Elysia错误上下文
 * @returns HTML错误页面
 */
export function handleAdminError({ error, code, set }: any): any {
  // Admin路由返回HTML错误页面
  set.headers['Content-Type'] = 'text/html; charset=utf-8';
  
  if (code === 'NOT_FOUND') {
    set.status = 404;
    return template('errors/404', {});
  }
  
  if (code === 'VALIDATION') {
    console.error('验证错误详情:', JSON.stringify(error, null, 2));
    
    set.status = 400;
    return template('errors/400', {});
  }

  if (code === 403) {
    set.status = 403;
    return template('errors/403', {});
  }
  
  if (code === 401) {
    set.status = 401;
    return template('errors/401', {});
  }

  console.error('Admin服务器错误:', error);
  set.status = 500;
  return template('errors/500', {});
}

/**
 * 通用错误处理器
 * 根据请求路径决定返回HTML还是JSON响应
 */
export function handleError({ error, code, set, request }: any): any {
  // 通过URL检查是API请求还是页面请求
  const isApiRequest = request.url.includes('/api/');
  
  if (isApiRequest) {
    return handleApiError({ error, code, set });
  } else {
    return handleAdminError({ error, code, set });
  }
} 