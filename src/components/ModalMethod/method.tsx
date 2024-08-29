import type { ModalFuncProps } from 'antd';
import { Modal } from 'antd';
import {
  ExclamationCircleFilled,
  InfoCircleFilled,
  CloseCircleFilled,
  CheckCircleFilled,
} from '@ant-design/icons';

const common = {
  centered: true,
  width: 420,
};

export const ModalConfirm = (props: ModalFuncProps) => {
  return Modal.confirm({
    icon: <ExclamationCircleFilled />,
    ...common,
    ...props,
  });
};

export const ModalWarn = (props: ModalFuncProps) => {
  return Modal.warn({
    icon: <ExclamationCircleFilled />,
    ...common,
    ...props,
  });
};

export const ModalInfo = (props: ModalFuncProps) => {
  return Modal.info({
    icon: <InfoCircleFilled />,
    ...common,
    ...props,
  });
};

export const ModalErrorConfirm = (props: ModalFuncProps) => {
  return Modal.confirm({
    icon: <ExclamationCircleFilled style={{ color: '#E55245' }} />,
    ...common,
    ...props,
  });
};
export const ModalError = (props: ModalFuncProps) => {
  return Modal.error({
    icon: <CloseCircleFilled />,
    ...common,
    ...props,
  });
};

export const ModalSuccess = (props: ModalFuncProps) => {
  return Modal.success({
    icon: <CheckCircleFilled />,
    ...common,
    ...props,
  });
};
