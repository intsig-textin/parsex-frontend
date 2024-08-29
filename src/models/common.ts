import type { Reducer } from 'umi';

export interface ILayoutState {
  collapse: boolean;
}

export interface ICommonModelState {
  loading: boolean;
  language: string;
  layout: ILayoutState;
  openHelpGuide: boolean;
  resultLoading: boolean;
}

export interface ICommonModel {
  namespace: 'Common';
  state: ICommonModelState;
  effects: {};
  reducers: {
    setLoading: Reducer<ICommonModelState>;
    setLanguage: Reducer<ICommonModelState>;
    setChangeCollapse: Reducer<ICommonModelState>;
    toggleHelpGuide: Reducer<ICommonModelState>;
    setResultLoading: Reducer<ICommonModelState>;
  };
  actions: {};
}

const CommonModel: ICommonModel = {
  namespace: 'Common',
  state: {
    loading: false,
    resultLoading: false,
    language: 'CN',
    openHelpGuide: false,
    layout: {
      collapse: false,
    },
  },
  effects: {},
  reducers: {
    setResultLoading(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    setLoading(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    setLanguage(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    toggleHelpGuide(state, { payload: openHelpGuide }) {
      return {
        ...state,
        openHelpGuide,
      };
    },
    setChangeCollapse(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
  actions: {},
};

export default CommonModel;
