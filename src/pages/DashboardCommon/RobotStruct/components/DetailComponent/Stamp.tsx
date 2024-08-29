import styles from './Index.less';

const Stamp = ({ item, width, valueWidth, curUid, onClick }: Record<string, any>) => (
  <div className={styles.resultContent} data-uid={item.uid} onClick={onClick}>
    <div className={styles.resultTitle}>{item.description}</div>
    <div className={styles.resultItem}>
      <div className={`result-struct-item`} style={{ padding: 0 }}>
        <div className="result-struct-key" style={{ width: `${width}px`, minWidth: '100px' }}>
          类型
        </div>
        <div className="result-struct-value" style={{ width: `${valueWidth}px` }}>
          {item.stampType}
        </div>
      </div>
      <div className={`result-struct-item`} style={{ padding: 0 }}>
        <div className="result-struct-key" style={{ width: `${width}px`, minWidth: '100px' }}>
          颜色
        </div>
        <div className="result-struct-value" style={{ width: `${valueWidth}px` }}>
          {item.color}
        </div>
      </div>
      <div className={`result-struct-item`} style={{ padding: 0 }}>
        <div className="result-struct-key" style={{ width: `${width}px`, minWidth: '100px' }}>
          形状
        </div>
        <div className="result-struct-value" style={{ width: `${valueWidth}px` }}>
          {item.stamp_shape}
        </div>
      </div>
      <div className={`result-struct-item`} style={{ padding: 0 }}>
        <div className="result-struct-key" style={{ width: `${width}px`, minWidth: '100px' }}>
          内容
        </div>
        <div className="result-struct-value" style={{ width: `${valueWidth}px` }}>
          {item.value}
        </div>
      </div>
      <div className={`result-struct-item`} style={{ padding: 0 }}>
        <div className="result-struct-key" style={{ width: `${width}px`, minWidth: '100px' }}>
          样本
        </div>
        <div className="result-struct-value" style={{ width: `${valueWidth}px` }}>
          <img
            src={`data:image/jpeg;base64,${item.image}`}
            className={curUid === item.uid ? 'active' : ''}
            alt=""
          />
        </div>
      </div>
    </div>
  </div>
);

export default Stamp;
