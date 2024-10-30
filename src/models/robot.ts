import type { Effect, Reducer } from 'umi';
import type { IRobotSceneItemProp, IUploadFileResponse } from '@/services/robot';
import { getRobotAndApiInfo, uploadRobotFile } from '@/services/robot';
import type { IRobotInfoResponse, IRobotInfo, IRobotApiInfoResponse } from '@/services/robot';

import { message } from 'antd';
import { formatSuffix } from '@/pages/DashboardCommon/components/RobotLeftView/store/useUploadFormat';

export interface Tag {
  type: IRobotSceneItemProp;
  tagsData: IRobotSceneItemProp[];
  expandable?: boolean;
}
export const tags: Tag[] = [
  {
    type: { id: 0, scene: '技术类型' },
    tagsData: [{ id: 1, scene: '文字识别' }],
  },
];

export interface IRobotModelState {
  info: Partial<IRobotInfo>;
  times: {
    ocrTimes: number;
    cloudOcrTimes: number;
    packageType?: any;
  };
  scrollTop: number;
  list: IRobotInfo[];
  createList: any[];
  sceneAllList: any[]; // 场景机器人 所有结果
  sceneOwnerList: any[];
  sceneOwnerAllList: any[];
  hotList: IRobotInfo[];
  tags: Tag[];
  sceneList: IRobotInfo[]; // 机器人市场-场景机器人-搜索后结果
  // 是否停留在在使用页面
  isUsePage: boolean;
  acceptInfo?: { accept: string; desc: string };
  uploadEnd: 0;
  countInfo?: { count_used: number; count_total: number };
  fileFromUrl?: string;
}

interface IRobotModel {
  namespace: 'Robot';
  state: IRobotModelState;
  effects: {
    getRobotInfo: Effect;
    uploadFile: Effect;
  };
  reducers: {
    saveRobotInfo: Reducer<IRobotModelState>;
    saveRobotList: Reducer<IRobotModelState>;
    saveRobotScrollPosition: Reducer<IRobotModelState>;
    clearRobotInfo: Reducer<IRobotModelState>;
    onUsePage: Reducer<IRobotModelState>;
  };
  actions: {};
}
const initialInfo = {
  id: 0,
  name: '',
  service: 'pdf_to_markdown',
  interaction: 16,
  guid: undefined,
  image: '',
  description: '',
  api_id: '',
  t_coin: 0,
  postpay_status: 0,
  publish_time: 0,
};

const pdf2mdResData = {
  msg: 'success',
  data: {
    utime: '2024-08-16 15:39:04',
    has_package: '1',
    status: 1,
    introduction: '',
    income_coefficient: 0,
    exper_center_status: 1,
    banner: '002822dd71fd499c95fc731ace950e00',
    api_id: '',
    product_category: 0,
    lowest_price: '0.01',
    tag: '{"tag":[]}',
    name: '通用文档解析',
    scene: -1,
    image:
      'https://web-api.textin.com/open/image/download?filename=9414bf70408b4af99cbc2e5512ef068d、https://web-api.textin.com/open/image/download?filename=ce729cfc57ad40e8911b5e060f134a4f.pdf、https://web-api.textin.com/open/image/download?filename=fdd03cb2705d465caaa1802a78588806.pdf',
    ctime: '2024-03-22 15:00:16',
    type: -1,
    special_describe: '',
    id: 207,
    Isowned: 0,
    publish_status: 1,
    interaction: 16,
    description:
      '利用合合信息强大的文字识别和文档理解能力，识别文档或图片中的文字信息，并按常见的阅读顺序进行还原，赋能大语言模型的数据清洗和文档问答任务。支持标准的年报、文书、函件、合同等文档内容，兼容扫描文档和电子PDF文件。',
    display_type: 1,
    editor: 525,
    relate_robot_list: [],
    month_package: 0,
    postpay_status: 1,
    service: 'pdf_to_markdown',
    original_t_coin: 0.32,
    is_owned: 0,
    ranking: 4,
    t_coin: 0.32,
    gateway_guid: '776334a5-8bf4-495e-b559-b79b2b3c2a87',
    is_public: 1,
    sso_visible: 1,
    deduction_method: '1',
    interaction_uri: '/recognition/robot_markdown',
    visible_type: 1,
    product_type: 1,
  },
  code: 200,
};

const RobotModel: IRobotModel = {
  namespace: 'Robot',
  state: {
    info: initialInfo,
    times: {
      ocrTimes: 0,
      cloudOcrTimes: 0,
    },
    scrollTop: 0,
    list: [],
    hotList: [],
    createList: [],
    sceneList: [],
    sceneAllList: [],
    sceneOwnerAllList: [],
    sceneOwnerList: [],
    tags,
    isUsePage: false,
    uploadEnd: 0,
    countInfo: undefined,
    fileFromUrl: '',
  },
  effects: {
    *getRobotInfo({ payload }, { call, put }) {
      const [apiRes]: [IRobotInfoResponse, IRobotApiInfoResponse] = yield call(
        getRobotAndApiInfo,
        payload,
      );
      const response = pdf2mdResData;
      if (response.code === 200 && response.data) {
        let acceptInfo;
        try {
          if (apiRes?.data) {
            const result = formatSuffix(apiRes.data.request_body_description, payload.service);
            acceptInfo = { accept: result.acceptStr, desc: result.acceptDes };
          }
        } catch (error) {
          console.log('convert accept error', error);
        }
        yield put({
          type: 'saveRobotInfo',
          payload: {
            info: { ...response.data, api_document: apiRes?.data },
            acceptInfo,
          },
        });
      } else if (response.code !== 400) {
        message.error(response.msg);
      }
      return response;
    },

    *uploadFile({ payload }, { call }) {
      const response: IUploadFileResponse = yield call(uploadRobotFile, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      return response;
    },
  },
  reducers: {
    saveRobotInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    onUsePage(state) {
      return {
        ...state!,
        isUsePage: true,
      };
    },
    saveRobotList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveRobotScrollPosition(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clearRobotInfo(state) {
      return {
        ...state!,
        info: initialInfo,
        isUsePage: false,
      };
    },
  },
  actions: {},
};

export default RobotModel;
