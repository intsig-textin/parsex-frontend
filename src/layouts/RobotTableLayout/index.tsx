import Header from '@/components/GlobalHeader/DesktopHeader/Index';
import type { ReactNode } from 'react';
import LogoCompose from '../components/LogoCompose';
import type { Dispatch } from 'umi';
import styles from './index.less';

const RobotTableLayout = ({ children, dispatch }: { children: ReactNode; dispatch: Dispatch }) => {
  return (
    <div>
      <div className={styles.logo}>
        <Header
          logo={
            <LogoCompose
              onClick={() => {
                // history.push('/dashboard/overview');
              }}
            />
          }
          className={styles['robot-header-layout']}
        />
      </div>
      <main
        id="page_container"
        style={{ minWidth: 1200, height: 'calc(100vh - 50px)', overflow: 'auto' }}
      >
        {children}
      </main>
    </div>
  );
};
export default RobotTableLayout;
