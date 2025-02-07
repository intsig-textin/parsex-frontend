import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Popover,
  Select,
  Space,
  Switch,
  Tooltip,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useSessionStorageState } from 'ahooks';
import { useSelector } from 'dva';
import lodash from 'lodash';
import type { ConnectState } from '@/models/connect';
import useUploadFormat from '../RobotLeftView/store/useUploadFormat';
import {
  AppIdAndSecretOptions,
  getDefaultParams,
  getParamsSettingBannerTips,
  rewriteParams,
  SettingsSaveKey,
} from './utils';
import styles from './index.less';
import { QuestionToolTips } from '@/components';
import classNames from 'classnames';
import TipsBanner from './TipsBanner';

const RecognizeParamsSettings = ({
  disabled,
  currentFile,
}: {
  disabled?: boolean;
  currentFile?: any;
}) => {
  const [open, setOpen] = useState(false);

  const [form] = Form.useForm();
  const wrapperRef = useRef(null);

  const { documentInfo } = useUploadFormat.useContainer();

  const { robotInfo } = useSelector((states: ConnectState) => ({
    robotInfo: states.Robot.info as { service: string },
  }));
  const { service } = robotInfo;

  const defaultParams = useMemo(() => {
    return getDefaultParams(robotInfo);
  }, [robotInfo]);

  const [settingsCache, setSettingsCache] = useSessionStorageState<Record<string, any>>(
    SettingsSaveKey,
    {},
  );

  const formItems: Record<string, any>[] = useMemo(() => {
    if (documentInfo && robotInfo && Array.isArray(documentInfo.url_params)) {
      const params = rewriteParams(documentInfo.url_params, { robotInfo });
      return params.map((item: any) => {
        const row: Record<string, any> = {
          name: item.key,
          label: item.label ? `${item.label} (${item.key})` : item.key,
          desc: item.desc,
          type: item.type,
          props: item.props || {},
          tag: item.tag,
        };
        if (item.rewriteType === 'switch') {
          row.switchEnums = [0, 1];
          row.valuePropName = 'checked';
        }
        if (item.valueEnums) {
          row.valueEnums = item.valueEnums;
        } else if (row.desc.includes('<ul>')) {
          const temp = document.createElement('div');
          temp.innerHTML = row.desc;
          const list = temp.querySelectorAll('li');
          if (list?.length) {
            const valueEnums: string[] = [];
            list.forEach((op) => {
              let text = op.innerText;
              if (/^[\w]+[\s]*=[\s]*/.test(text)) {
                text = text.replace(/^[\w]+[\s]*=[\s]*/, '');
              }
              valueEnums.push(text.split(/\s/)[0].replace(':', ''));
            });
            if (valueEnums.length) {
              if (row.type === 'integer' && valueEnums.length === 2) {
                row.switchEnums = valueEnums.map((no) => Number(no));
                row.valuePropName = 'checked';
              } else {
                row.valueEnums = valueEnums.map((item) => ({
                  key: item,
                  label: item,
                  value: item,
                }));
              }
            }
          }
        }
        return row;
      });
    }
    return [];
  }, [documentInfo, robotInfo]);

  useEffect(() => {
    if (defaultParams && !Object.keys(settingsCache).length) {
      setSettingsCache(defaultParams);
    }
  }, [defaultParams]);

  useEffect(() => {
    if (open) {
      const curValues = Object.keys(settingsCache).length ? settingsCache : defaultParams;
      form.resetFields();
      form.setFieldsValue(curValues);
    }
  }, [open]);

  const showSettings = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const saveHandle = async (data: Record<string, any>) => {
    setSettingsCache(data);
  };

  const onSave = async () => {
    if (service) {
      const params = form.getFieldsValue();
      const result: Record<string, any> = {};
      const fieldInfoMap = formItems.reduce((pre, cur) => ({ ...pre, [cur.name]: cur }), {});
      // 只保存非空的数据
      for (const key in params) {
        if (!['', null, undefined].includes(params[key])) {
          if (fieldInfoMap[key].type === 'integer' && typeof params[key] === 'boolean') {
            result[key] = Number(params[key]);
          } else {
            result[key] = params[key];
          }
        }
      }
      await saveHandle(result);
      message.success('保存成功');
      onClose();
    }
  };

  const onReset = async () => {
    if (!service) return;
    const allFields = formItems.reduce((pre, cur) => ({ ...pre, [cur.name]: undefined }), {});
    const resetValues = {
      ...allFields,
      ...defaultParams,
      ...lodash.pick(
        settingsCache,
        AppIdAndSecretOptions.map((item) => item.key),
      ),
    };
    form.setFieldsValue(resetValues);
    await saveHandle(resetValues);
    message.success('重置成功');
  };

  return (
    <div className={classNames(styles.container)}>
      <div className={styles.sectionLabel}>服务配置</div>
      <Popover
        trigger="click"
        placement="bottomLeft"
        overlayClassName={styles['popover-overlay']}
        // getPopupContainer={(node: HTMLElement) => node.parentElement as HTMLElement}
        title={null}
        visible={open}
        onVisibleChange={(visible) => setOpen(visible)}
        content={
          <div ref={wrapperRef}>
            <div className={styles.bannerWrapper}>
              <TipsBanner text={getParamsSettingBannerTips(service)} />
            </div>
            <Form form={form} className={styles.formWrapper}>
              {formItems.map((item) => {
                let content = <Input style={{ width: 120 }} placeholder="请输入" />;
                if (item.switchEnums) {
                  content = <Switch />;
                } else if (item.valueEnums) {
                  content = (
                    <Select placeholder="请选择" style={{ width: 120 }} options={item.valueEnums} />
                  );
                } else if (item.type === 'integer') {
                  content = (
                    <InputNumber placeholder="请输入" style={{ width: 120 }} {...item.props} />
                  );
                }
                return (
                  <Tooltip
                    key={item.name}
                    title={<div dangerouslySetInnerHTML={{ __html: item.desc }} />}
                    overlayClassName={styles.labelTooltips}
                    color="#fff"
                    placement="right"
                  >
                    <Form.Item
                      key={item.name}
                      name={item.name}
                      label={
                        <>
                          <span>{item.label}</span>
                          {item.tag && <span className={styles.labelTag}>{item.tag}</span>}
                        </>
                      }
                      className={classNames({ [styles.hasTag]: item.tag })}
                      valuePropName={item.valuePropName}
                    >
                      {content}
                    </Form.Item>
                  </Tooltip>
                );
              })}
            </Form>
            <div className={styles.footerWrapper}>
              <div className={styles.footerText}>
                {currentFile?.result?.version && (
                  <div className={styles.versionInfo}>
                    <QuestionToolTips
                      title={`引擎版本：${currentFile.result.version}`}
                      defaultPopupContainer
                    >
                      <InfoCircleOutlined />
                    </QuestionToolTips>
                  </div>
                )}
                <span className={styles.tipsDesc}>参数调整仅对新的识别生效</span>
              </div>
              <Space size={12} className={styles.footerBtn}>
                <Button type="default" onClick={onReset}>
                  重置
                </Button>
                <Button type="primary" onClick={onSave}>
                  确定
                </Button>
              </Space>
            </div>
          </div>
        }
      >
        <div className={styles.buttons}>
          <Button
            className={classNames(styles.settingsBtn, {
              [styles.settingsBtnActive]: open,
              robot_tour_step_1: true,
            })}
            type="default"
            disabled={disabled}
            onClick={showSettings}
          >
            参数配置
          </Button>
        </div>
      </Popover>
    </div>
  );
};

export default RecognizeParamsSettings;
