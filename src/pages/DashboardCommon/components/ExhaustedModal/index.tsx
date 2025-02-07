import { useSelector } from 'umi';
import type { ConnectState } from '@/models/connect';
import { BalanceWarningModal } from './components';

export default function ExhaustedModal() {
  const { robotInfo } = useSelector(({ Robot }: ConnectState) => ({
    robotInfo: Robot.info,
  }));

  return (
    <>
      <BalanceWarningModal />
    </>
  );
}
