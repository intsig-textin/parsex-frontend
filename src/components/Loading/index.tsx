import React from 'react';
import { LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styles from './index.less';
import { Spin } from 'antd';
import classNames from 'classnames';

interface IProps {
  type: 'success' | 'loading' | 'normal';
  text?: string;
}

/**
 * @desc 用于图片框选识别的,父容器需要 position:relavtive
 */

export default ({ type, text }: IProps) => {
  return (
    <div className={classNames(styles.loadingWrap, 'recognition-result-loading')}>
      {type !== 'normal' ? (
        <div className={styles.loadingContainer}>
          {type === 'loading' ? (
            <>
              <LoadingOutlined />
              <span>{text || '加载中...'}</span>
            </>
          ) : (
            <>
              <CheckCircleOutlined />
              <span>{text || '识别成功'}</span>
            </>
          )}
        </div>
      ) : (
        <Spin />
      )}
    </div>
  );
};
