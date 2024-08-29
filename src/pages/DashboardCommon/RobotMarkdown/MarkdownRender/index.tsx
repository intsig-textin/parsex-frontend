import { dynamic } from 'umi';

const MarkdownComponent = dynamic({
  loader: async function () {
    const { default: MarkdownRender } = await import(
      /* webpackChunkName: "external_A" */ './MarkdownRender'
    );
    return MarkdownRender;
  },
});

export const MultiPageMarkdown = dynamic({
  loader: async function () {
    const { default: MarkdownRender } = await import(
      /* webpackChunkName: "external_A" */ './MultiPageMarkdown'
    );
    return MarkdownRender;
  },
});

export default MarkdownComponent;
