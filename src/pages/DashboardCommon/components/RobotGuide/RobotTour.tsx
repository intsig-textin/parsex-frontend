import { useEffect, useMemo, useState } from 'react';
import { Button } from 'antd';
import { useSelector } from 'dva';
import NoticeIcon from '@/assets/icon/icon_notice.png';
import type { StepItem } from '@/components/ReactGuide';
import Tour from '@/components/ReactGuide';
import styles from './RobotTour.less';
import { getParamsSettingBannerTips } from '../RecognizeParamsSettings/utils';
import type { ConnectState } from '@/models/connect';

const RobotTour = ({ showSettings }: { showSettings?: boolean }) => {
  const { fileSaveFlag, userInfoLoaded, robotInfo } = useSelector((store: ConnectState) => ({
    fileSaveFlag: false,
    userInfoLoaded: true,
    robotInfo: store.Robot.info,
  }));

  const service = robotInfo.service as string;
  const hasShownRobotTourCacheKey = `hasShownRobotTour_${service}`;

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasShownRobotTour = localStorage.getItem(hasShownRobotTourCacheKey) === '1';
    if (hasShownRobotTour) {
      return;
    }
    if (!userInfoLoaded) {
      return;
    }
    setVisible(true);
    localStorage.setItem(hasShownRobotTourCacheKey, '1');
  }, [service, userInfoLoaded]);

  const onClose = () => {
    setVisible(false);
  };

  const tooltipRender: StepItem['render'] = ({ curStep, total, next, prev, onClose }) => {
    const isLast = curStep + 1 === total;
    return (
      <div className={styles.tour_tooltips}>
        <div className={styles.tour_desc}>
          <img className={styles.tour_desc_icon} src={NoticeIcon} />
          <div className={styles.tour_desc_text}>{steps[curStep]?.desc || ''}</div>
        </div>
        <div className={styles.operation_btn}>
          <div className={styles.btn_wrapper}>
            {!isLast && (
              <Button
                onClick={onClose}
                style={{ marginLeft: 12 }}
                type="default"
                size="small"
                className={styles.close_btn}
              >
                关闭
              </Button>
            )}
            {/* {curStep > 0 ? (
              <Button type="primary" size="small" className={styles.step_btn} onClick={prev}>
                上一步
              </Button>
            ) : null} */}
            <Button
              onClick={() => {
                if (isLast) {
                  onClose?.();
                } else {
                  next();
                }
              }}
              style={{ marginLeft: 12 }}
              type="primary"
              size="small"
              className={styles.step_btn}
            >
              {isLast ? '我知道了' : '下一个'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const steps: StepItem[] = useMemo(() => {
    const finalSteps: StepItem[] = [];
    if (fileSaveFlag) {
      finalSteps.unshift({
        target: '.robot_tour_step_2',
        render: tooltipRender,
        tooltipProps: {
          placement: 'rightTop',
        },
        desc: '为提升您的使用体验，已默认开启文件存储功能，可随时查看历史文件记录。',
      });
    }
    if (showSettings) {
      finalSteps.push({
        target: '.robot_tour_step_1',
        render: tooltipRender,
        tooltipProps: {
          placement: 'bottomLeft',
        },
        desc: getParamsSettingBannerTips(service),
      });
    }
    return finalSteps;
  }, [service, showSettings, fileSaveFlag]);

  return <>{visible && <Tour visible={visible} steps={steps} onClose={onClose} />}</>;
};

export default RobotTour;
