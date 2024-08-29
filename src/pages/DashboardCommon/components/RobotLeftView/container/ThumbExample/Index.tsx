// import type { MouseEvent } from 'react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'dva';
import { useToggle } from 'ahooks';
import type { IFileItem } from '../../container/RobotFileList/Index';
import type { ConnectState } from '@/models/connect';
import { TABLE_CROP_VALUE } from '../../constants';
import { fileContainer, listContainer } from '../../store';
import classNames from 'classnames';
import ThumbImg from '../../components/ThumbImg/Index';
import { ReactComponent as DownOutlined } from '@/assets/robot/icon-chevrons-down.svg';
import { ReactComponent as UpOutlined } from '@/assets/robot/icon-chevrons-up.svg';
// import { render } from 'react-dom';
// import { useEventListener } from 'ahooks';

export default function Index() {
  const [collapsed, { toggle }] = useToggle(true);
  const [demoList, setDemoList] = useState<IFileItem[]>([]);
  const { handleCheckFileClick, curFileActiveId } = fileContainer.useContainer();
  const { list } = listContainer.useContainer();
  const { robotInfo, isNew } = useSelector((store: ConnectState) => ({
    robotInfo: store.Robot.info,
    isNew: store.User.isNew,
  }));
  const dispatch = useDispatch();
  // useEffect(() => {
  //   const tooltipWrapper = document.createElement('div');
  //   tooltipWrapper.className="tooltip_inner"
  //   const target = document.querySelector('.Resizer');
  //   const height = tooltipWrapper?.getBoundingClientRect().height
  //   const targetHeight = target?.getBoundingClientRect().height;
  //   // const target = document.querySelector('.Resizer');
  //   tooltipWrapper!.style.top=(targetHeight!/2- height/2)+"px"
  //   render(
  //     <div>
  //     111
  //     </div>,
  //     tooltipWrapper,
  //   );
  //   target?.appendChild(tooltipWrapper);
  // }, []);
  // useEventListener("mousemove",(e: MouseEvent<HTMLDivElement>)=>{
  //   console.log(e.clientY);
  //   const tooltip_inner=document.querySelector('.tooltip_inner');
  //   const width = tooltip_inner?.getBoundingClientRect().width
  //  // const target = document.querySelector('.Resizer');
  //   tooltip_inner!.style.top=(e.clientY-90-width!/2)+"px"
  // },{target:document.querySelector('.Resizer')})
  useEffect(() => {
    if (!robotInfo.image) return;

    const sampleImageList = robotInfo.image ? robotInfo.image.split('、') : [];
    const displaySampleList = sampleImageList.slice(0, 3);
    setDemoList(
      displaySampleList.map((item: any, index: number) => ({
        id: item.split('filename=')[1],
        name: `样例${index + 1}`,
        url: item,
        thumbnail: `${item}&crop=${TABLE_CROP_VALUE}`,
        isExample: true,
        status: 'wait',
      })),
    );
  }, [robotInfo.image]);

  useEffect(() => {
    if (demoList.length && isNew) {
      setTimeout(() => {
        dispatch({
          type: 'Common/toggleHelpGuide',
          payload: true,
        });
      }, 1000);
    }
  }, [demoList]);

  useEffect(() => {
    toggle(list.length > 0);
  }, [list]);

  if (!demoList.length) {
    return null;
  }
  return (
    <div className="exampleWrapper">
      <div className="titleWrapper">
        <div className="title">示例样本</div>
        <div className={classNames('icon', 'icon-outlined')} onClick={() => toggle()}>
          {collapsed ? <DownOutlined /> : <UpOutlined />}
        </div>
      </div>
      <div
        className={classNames('imgWrapper', {
          imgCollapsed: collapsed,
        })}
      >
        {demoList &&
          demoList.map((demo, idx) => {
            return (
              <ThumbImg
                key={demo.id}
                {...demo}
                isExample
                number={idx + 1}
                active={curFileActiveId === demo.id}
                onClick={() => {
                  handleCheckFileClick(demo);
                }}
              />
            );
          })}
      </div>
    </div>
  );
}
