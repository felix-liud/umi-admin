import { Reducer, AnyAction } from 'redux';
import { MenuTreeItem, SysMenu } from './data';
import { getTreeMenu } from './service';
import { EffectsCommandMap } from 'dva';


export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T },
) => void;

export interface StateType {
  treeData: MenuTreeItem[],
  menuForm: SysMenu,
}

export interface ModelType {
  namespace: string,
  state: StateType,
  effects: {
    fetchMenus: Effect,
  },
  reducers: {
    saveMenus: Reducer;
  }
}

const Model: ModelType = {
  namespace: 'sysMenu',
  state: {
    treeData: [],
    menuForm: {
      id: '',
      title: '',
      url: '',
      authority: '',
      type: 0,
      parentId: '',
      hide: 0,
    }
  },
  effects: {
    *fetchMenus({ callback }, { call , put }) {
      const response = yield call(getTreeMenu);
      if (response.code !== 2000) {
        return;
      }
      typeof callback === 'function' && callback();
      yield put({
        type: 'saveMenus',
        payload: response.data,
      })
    },
  },
  reducers: {
    saveMenus(state, action) {
      return {
        ...state,
        treeData: action.payload
      }
    }
  }
} 
export default Model