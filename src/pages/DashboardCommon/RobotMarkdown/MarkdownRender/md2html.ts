import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkMath from 'remark-math';
import remarkCustomGfm from './remarkCustomGfm/index';

const md2html = (content: string) => {
  const res = unified()
    .use(remarkParse) // 解析 Markdown
    .use(remarkCustomGfm, { singleTilde: false })
    .use(remarkRehype, { allowDangerousHtml: true }) // 转换为 HTML 树
    .use(rehypeStringify) // 转换为 HTML 字符串
    .processSync(content);
  return res.toString();
};

export const getFormula = (content: string) => {
  const treeData = unified()
    .use(remarkParse) // 解析 Markdown
    .use(remarkMath)
    .parse(content);
  const result = filterMath(treeData);
  return result.filter((i) => i);
};

const filterMath = (data: any): string[] => {
  const result: string[] = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      if (/math/i.test(item.type)) {
        result.push(item.value);
      } else if (Array.isArray(item.children)) {
        result.push(...filterMath(item.children));
      }
    }
  } else if (Array.isArray(data.children)) {
    result.push(...filterMath(data.children));
  }
  return result;
};

export default md2html;
