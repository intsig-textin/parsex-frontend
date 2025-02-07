import { useState } from 'react';
import { createContainer } from 'unstated-next';

const ExhaustedModal = () => {
  const [balanceWarningModal, setBalanceWarningModal] = useState<Record<string, any>>({
    visible: false,
  });
  return {
    balanceWarningModal,
    setBalanceWarningModal,
  };
};

export const ExhaustedModalContainer = createContainer(ExhaustedModal);

export default ExhaustedModalContainer;
