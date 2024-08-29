import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Drawer, Form, Input, InputNumber, message, Select, Space, Switch } from 'antd';
import { useSessionStorageState } from 'ahooks';
import { useSelector } from 'dva';
import type { ConnectState } from '@/models/connect';
import useUploadFormat from '../RobotLeftView/store/useUploadFormat';
import { SettingsSaveKey } from './utils';
import styles from './index.less';
import { textinDomain } from '@/utils/helper';
// import { gatConfigService, SaveConfigService } from '../../RobotMarkdown/service';

const mdDefaultParams: Record<string, any> = {
  dpi: 144,
  page_count: 1000,
  apply_document_tree: 1,
  markdown_details: 1,
  table_flavor: 'html',
  get_image: 'objects',
  parse_mode: 'auto',
  support_doc_parser: 1,
};

const paramsProps: Record<string, any> = {
  page_start: { min: 1, max: 1000 },
  page_count: { min: 1, max: 1000 },
};

export const AppIdAndSecretPosition = `请在【页面右下角 - 高级模式】中填写`;

export const AppIdAndSecretDesc = `请至 ${textinDomain} 免费注册账号后，在【工作台 - 账号管理 - 开发者信息】中查看`;

const AppIdAndSecretOptions = [
  {
    desc: `自定义API接口地址`,
    key: 'custom_api',
    require: false,
    type: 'string',
  },
  {
    desc: AppIdAndSecretDesc,
    key: 'x-ti-app-id',
    require: false,
    type: 'string',
  },
  {
    desc: AppIdAndSecretDesc,
    key: 'x-ti-secret-code',
    require: false,
    type: 'string',
  },
];

const ParamsSettings = ({ disabled }: { disabled?: boolean }) => {
  const [open, setOpen] = useState(false);

  const [form] = Form.useForm();
  const wrapperRef = useRef(null);

  const { documentInfo } = useUploadFormat.useContainer();
  const { service } = useSelector(
    (states: ConnectState) => states.Robot.info as { service: string },
  );

  const [settingsCache, setSettingsCache] = useSessionStorageState<Record<string, any>>(
    SettingsSaveKey,
    {},
  );

  const formItems = useMemo(() => {
    if (documentInfo && Array.isArray(documentInfo.url_params)) {
      AppIdAndSecretOptions.reverse().map((o) => {
        const exist = documentInfo.url_params.some((p) => p.key === o.key);
        if (!exist) {
          documentInfo.url_params.unshift(o);
        }
      });

      return documentInfo.url_params.map((item) => {
        const row: Record<string, any> = {
          name: item.key,
          label: item.key,
          desc: item.desc,
          type: item.type,
          props: paramsProps[item.key] || {},
        };
        if (row.desc.includes('<ul>')) {
          const temp = document.createElement('div');
          temp.innerHTML = row.desc;
          const list = temp.querySelectorAll('li');
          if (list?.length) {
            const valueEnums: string[] = [];
            list.forEach((op) => {
              valueEnums.push(op.innerText.split(/\s/)[0]);
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
        if ('get_image' === item.key && mdDefaultParams[item.key]) {
          row.desc =
            '<p>获取markdown里的图片，默认为objects，返回页面内的图像对象</p>\n<ul>\n<li>none 不返回任何图像</li>\n<li>page 返回每一页的整页图像</li>\n<li>objects 返回页面内的图像对象</li>\n<li>both 返回整页图像和图像对象</li>\n</ul>\n';
        } else if ('parse_mode' === item.key && mdDefaultParams[item.key]) {
          row.desc =
            '<p>PDF解析模式，默认为auto模式，综合文字识别和解析模式。图片不用设置，均按文字识别方式处理。</p>\n<ul>\n<li>auto 综合文字识别和解析模式</li>\n<li>scan 仅按文字识别模式</li>\n</ul>\n';
        }
        return row;
      });
    }
    return [];
  }, [documentInfo]);

  useEffect(() => {
    if (open) {
      const curValues = Object.keys(settingsCache).length ? settingsCache : mdDefaultParams;
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
    const resetValues = { ...allFields, ...mdDefaultParams };
    form.setFieldsValue(resetValues);
    await saveHandle(resetValues);
    message.success('重置成功');
  };

  return (
    <>
      <Button
        className={styles['settings-btn']}
        type="default"
        disabled={disabled}
        onClick={showSettings}
      >
        高级模式
      </Button>

      <Drawer
        title="参数面板"
        visible={open}
        width={400}
        onClose={onClose}
        footer={
          <Space size={12} className={styles['footer-btn']}>
            <Button type="default" onClick={onReset}>
              重置参数
            </Button>
            <Button type="primary" onClick={onSave}>
              确定
            </Button>
          </Space>
        }
      >
        <div ref={wrapperRef}>
          <Form form={form} className={styles['form-wrapper']}>
            {formItems.map((item) => {
              let content = <Input style={{ width: 150 }} placeholder="请输入" />;
              if (item.switchEnums) {
                content = <Switch />;
              } else if (item.valueEnums) {
                content = (
                  <Select placeholder="请选择" style={{ width: 150 }} options={item.valueEnums} />
                );
              } else if (item.type === 'integer') {
                content = (
                  <InputNumber placeholder="请输入" style={{ width: 150 }} {...item.props} />
                );
              }
              return (
                <Form.Item
                  key={item.name}
                  name={item.name}
                  label={item.label}
                  tooltip={{
                    title: <div dangerouslySetInnerHTML={{ __html: item.desc }} />,
                    overlayClassName: styles['label-tooltips'],
                    color: '#2E384D',
                  }}
                  valuePropName={item.valuePropName}
                >
                  {content}
                </Form.Item>
              );
            })}
          </Form>
        </div>
      </Drawer>
    </>
  );
};

export default ParamsSettings;
