import { Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useRef } from 'react';
import { useHover } from 'ahooks';
import { Link } from 'umi';

const content = (
  <div>
    <p>
      TextIn服务器默认不储存您上传的任何文件，使用机器人时，上传的文件仅展示在您的本地列表中，关闭或刷新页面后，文件将会被清空。
    </p>
    <p>
      想保留您的上传文件，请至
      <Link to="/dashboard/systemsetting" style={{ color: '#1A66FF' }}>
        【设置】
      </Link>
      中开启储存服务。
    </p>
  </div>
);
const iconStyle = { color: '#868A9C', marginLeft: 8 };

export default () => {
  const wrapper = useRef<HTMLSpanElement>(null);
  const isHovering = useHover(wrapper);
  return (
    <Popover
      content={content}
      overlayClassName="headerInfoProperWrap"
      placement="right"
      trigger="hover"
      autoAdjustOverflow={false}
    >
      <span ref={wrapper}>
        <InfoCircleOutlined style={{ ...iconStyle, color: isHovering ? '#1A66FF' : '#868A9C' }} />
      </span>
    </Popover>
  );
};
