import { Form, Modal, Radio } from 'antd';
import classNames from 'classnames';
import useUploadFormat from '../../store/useUploadFormat';
import styles from './index.less';

export default function ParamsSelect() {
  const { modalInfo, setModalInfo } = useUploadFormat.useContainer();

  const [modalForm] = Form.useForm();

  function onCloseModal() {
    setModalInfo({ visible: false });
    modalForm.resetFields();
  }

  function onNextUpload() {
    modalForm.validateFields().then((values: any) => {
      if (typeof modalInfo.nextHandle === 'function') {
        modalInfo.nextHandle({ queryParams: values });
        onCloseModal();
      }
    });
  }

  return (
    <Modal
      title={modalInfo.title || '选择参数'}
      visible={modalInfo.visible}
      okButtonProps={{ htmlType: 'submit' }}
      width={420}
      wrapClassName={classNames(styles['params-modal'], 'no-footer-border')}
      onCancel={onCloseModal}
      onOk={onNextUpload}
      maskClosable={false}
      centered
    >
      <Form form={modalForm}>
        {Array.isArray(modalInfo?.options) &&
          modalInfo?.options.map((item) => (
            <Form.Item
              name={item.key}
              key={item.key}
              style={{ marginBottom: 0 }}
              initialValue={item.options[0].value}
            >
              <Radio.Group options={item.options} />
            </Form.Item>
          ))}
      </Form>
    </Modal>
  );
}
