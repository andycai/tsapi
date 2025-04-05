import { readFileSync } from 'fs'
import { join } from 'path';

// 简单模板引擎实现
// 使用{{.key}}来获取数据
// 支持 layout 布局
// 支持 include 包含
// 支持 extends 继承
// 支持 if 条件判断
// 支持 each 循环

let templateExt = ".html";
let templatePath = join(process.cwd(), "templates");
let layoutPath = join("layouts", "layout");

/**
 * 从文件加载HTML模板
 */
const loadTemplate = (path: string): string => {
    if (!path.endsWith(templateExt)) {
        path = path + templateExt
    }
    try {
        return readFileSync(join(templatePath, path), 'utf-8')
    } catch (error) {
        console.error(`模板加载失败: ${path}`, error)
        return '<div>加载视图失败</div>'
    }
}

/**
 * 设置模板参数
 * 
 * templateExt 模板扩展名，默认是 .html
 * templatePath 模板路径，默认是 templates
 * layoutPath 布局路径，默认是 templates/layouts/layout
 */
export const setTemplateParams = (params: {
    templateExt?: string,
    templatePath?: string,
    layoutPath?: string
}) => {
    if (params.templateExt) {
        templateExt = params.templateExt
    }
    if (params.templatePath) {
        templatePath = join(process.cwd(), params.templatePath)
    }
    if (params.layoutPath) {
        layoutPath = params.layoutPath
    }
}

/**
 * 处理条件语句
 * 匹配 {{if .condition}}...{{else}}...{{/if}} 模式
 */
const processIfStatements = (content: string, data: Record<string, any>): string => {
    // 匹配 if 语句块，支持 else 分支
    const ifRegex = /\{\{if\s+\.(\w+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;
    
    return content.replace(ifRegex, (_, condition, ifContent, elseContent = '') => {
        // 计算条件真假
        const value = data[condition];
        // 如果条件为真，返回 if 内容，否则返回 else 内容
        if (value) {
            return ifContent;
        } else {
            return elseContent;
        }
    });
}

/**
 * 处理循环语句
 * 匹配 {{each .items as .item}}...{{/each}} 模式
 */
const processEachStatements = (content: string, data: Record<string, any>): string => {
    // 匹配 each 语句块
    const eachRegex = /\{\{each\s+\.(\w+)\s+as\s+\.(\w+)(?:\s+index\s+\.(\w+))?\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return content.replace(eachRegex, (_, itemsKey, itemKey, indexKey, eachContent) => {
        const items = data[itemsKey];
        
        // 如果 items 不是数组或为空，返回空字符串
        if (!Array.isArray(items) || items.length === 0) {
            return '';
        }
        
        // 为每个元素渲染内容并拼接
        return items.map((item, index) => {
            // 创建局部上下文
            const itemData: Record<string, any> = { ...data, [itemKey]: item };
            
            // 如果指定了索引变量，添加到上下文
            if (indexKey) {
                itemData[indexKey] = index;
            }
            
            // 处理循环体内的变量替换
            return replaceVariables(eachContent, itemData);
        }).join('');
    });
}

/**
 * 替换变量
 */
const replaceVariables = (content: string, data: Record<string, any>): string => {
    return content.replace(/\{\{\.(\w+)(?:\.(\w+))?\}\}/g, (_, key, subKey) => {
        if (subKey && data[key] && typeof data[key] === 'object') {
            return data[key][subKey] !== undefined ? data[key][subKey] : '';
        }
        return data[key] !== undefined ? data[key] : '';
    });
}

/**
 * 渲染模板
 * @param template 模板文件路径
 * @param layout 布局文件路径
 * @param data 数据
 * @returns 渲染后的内容
 */
export const template = (template: string, data: Record<string, any>, layout?: string): string => {
    // 读取 template 文件
    const templateContent = loadTemplate(template)
    // 读取 layout 文件
    const layoutContent = loadTemplate(layout ? layout : layoutPath)
    // 用 templateContent 替换 layoutContent 中的 {{.layout}}
    const pageContent = layoutContent.replace(/\{\{\.layout\}\}/g, () => {
        return templateContent
    })

    // 先处理条件语句
    let processedContent = processIfStatements(pageContent, data);
    
    // 处理循环语句
    processedContent = processEachStatements(processedContent, data);
    
    // 替换普通变量
    const fullContent = replaceVariables(processedContent, data);

    return fullContent
}
