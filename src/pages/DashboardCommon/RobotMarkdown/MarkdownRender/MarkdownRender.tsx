import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import classNames from 'classnames';
import remarkCustomGfm from './remarkCustomGfm/index';
import { useRefreshMath } from '../MathJaxRender/useMathJaxLoad';
import CopyWrapper from '../containers/CopyWrapper';
import LazyImage from './LazyImage';
import styles from './index.less';

const MarkdownRender = ({ content, className }: { content: string; className?: string }) => {
  useRefreshMath(content);

  return (
    <div className={classNames(styles['markdown-body'], className)}>
      <Markdown
        remarkPlugins={[[remarkCustomGfm, { singleTilde: false }]]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: (node) => <LazyImage src={node.src} />,
          table: (node) => {
            return (
              <div className="content-container">
                <CopyWrapper />
                <table {...node.node.properties}>{node.children}</table>
              </div>
            );
          },
        }}
        linkTarget="_blank"
      >
        {content}
      </Markdown>
    </div>
  );
};

export default MarkdownRender;
