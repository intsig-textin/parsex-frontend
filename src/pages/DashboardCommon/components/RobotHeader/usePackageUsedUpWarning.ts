import type { ConnectState } from '@/models/connect';
import { useMount } from 'ahooks';
import { useState } from 'react';
import { useLocation, useSelector } from 'umi';
import { createContainer } from 'unstated-next';

export const usePackageUsedUpWarning = () => {
  const [packageUsedUpModal, setPackageUsedUpModal] = useState<Record<string, any>>({
    visible: false,
  });
  const [balanceWarningModal, setBalanceWarningModal] = useState<Record<string, any>>({
    visible: false,
  });

  const [userViewed, setAlreadyUserViewed] = useState(false);

  const {
    query: { service },
  } = useLocation() as any;

  const { countInfo, User } = useSelector(({ Robot, User }: ConnectState) => ({
    countInfo: Robot.countInfo,
    User: User,
  }));
  const getCacheKey = () => {
    return `PackageUsedUpModal-${service}-${User.account}`;
  };

  const setUserViewed = () => {
    setAlreadyUserViewed(true);
    localStorage.setItem(getCacheKey(), '1');
    setPackageUsedUpModal({ visible: false });
    packageUsedUpModal.nextHandle({ visible: false, packageUsedUpViewed: true });
  };

  // 套餐已用尽，弹窗已确认过继续则跳过
  const validatePackageUsedUp = async () => {
    if (!userViewed && countInfo?.count_used != null && countInfo?.count_total != null) {
      if (countInfo?.count_used >= countInfo?.count_total) {
        // if (countInfo?.count_used < countInfo?.count_total) {
        return await new Promise((resolve) => {
          setPackageUsedUpModal({
            visible: true,
            nextHandle: (params: any) => {
              resolve(params.packageUsedUpViewed);
            },
          });
        });
      }
    }
    return true;
  };

  useMount(() => {
    const value = localStorage.getItem(getCacheKey());
    if (value) {
      setAlreadyUserViewed(true);
    }
  });

  return {
    service,
    // 套餐用尽弹窗
    packageUsedUpModal,
    setPackageUsedUpModal,
    userViewed,
    setUserViewed,
    validatePackageUsedUp,

    // 余额不足弹窗
    balanceWarningModal,
    setBalanceWarningModal,
  };
};

export const PackageUsedUpWarningContainer = createContainer(usePackageUsedUpWarning);
