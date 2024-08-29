import { Image } from 'antd';
import styles from './Index.less';
import officalAccount from '../assets/officalAccount.jpg';
import service from '../assets/service.png';

const Card = () => {
  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div className={styles.codeImg}>
          <Image src={service} preview={false} />
        </div>
        <div className={styles.title}>添加客服微信</div>
        <div className={styles.desc}>体验1对1即时服务</div>
      </div>
      <div className={styles.right}>
        <div className={styles.codeImg}>
          <Image src={officalAccount} preview={false} />
        </div>
        <div className={styles.title}>关注公众号</div>
        <div className={styles.desc}>了解更多资讯</div>
      </div>
    </div>
  );
};
export default Card;
