import { Reducer, AnyAction } from 'redux';
import { MenuTreeItem, SysMenu } from './data';
import { getTreeMenu, getTreeMenuById, upadateMenuById, insertMenu, deleteTreeMenuById } from './service';
import { EffectsCommandMap } from 'dva';
import { SysMenuType } from '../../../static/enums';


export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T },
) => void;

export interface StateType {
  treeData: MenuTreeItem[],
  menuForm: SysMenu,
}

const initValue = {
  id: '',
  icon: '',
  title: '',
  url: '',
  type: SysMenuType['MENU'],
  parentId: '',
  hide: 0,
}
export interface ModelType {
  namespace: string,
  state: StateType,
  effects: {
    fetchMenus: Effect;
    fetchMenuById: Effect;
    upadateTreeNodeById: Effect;
    insertTreeNode: Effect;
    deleteTreeNodeById: Effect;
  },
  reducers: {
    saveMenus: Reducer;
    saveMenuForm: Reducer;
  }
}

const Model: ModelType = {
  namespace: 'sysMenu',
  state: {
    treeData: [],
    menuForm: {
      ...initValue
    }
  },
  effects: {
    *fetchMenus({ callback }, { call , put }) {
      const response = yield call(getTreeMenu);
      if (response.code !== 2000) {
        return;
      }
      yield put({
        type: 'saveMenus',
        payload: response.data,
      });
      typeof callback === 'function' && callback();
    },
    *fetchMenuById({ callback, payload }, { call , put }) {
      const response = yield call(getTreeMenuById, payload.id);
      if (response.code !== 2000) {
        return;
      }
      yield put({
        type: 'saveMenuForm',
        payload: response.data,
      });
      typeof callback === 'function' && callback();
    },
      
    *upadateTreeNodeById({ callback, payload }, {call, put }) {
      const response = yield call(upadateMenuById, payload);
      if (response.code !== 2000) {
        return;
      }
      typeof callback === 'function' && callback();
    },
    *insertTreeNode({ callback, payload }, {call, put }) {
      const response = yield call(insertMenu, payload);
      if (response.code !== 2000) {
        return;
      }
      typeof callback === 'function' && callback();
    },
    *deleteTreeNodeById({ callback, payload }, { call }) {
      const response = yield call(deleteTreeMenuById, payload.id);
      if (response.code !== 2000) {
        return;
      }
      typeof callback === 'function' && callback();
    },
  },
  reducers: {
    saveMenus(state, action) {
      return {
        ...state,
        treeData: action.payload
      }
    },
    saveMenuForm(state, action) {
      return {
        ...state,
        menuForm: action.payload ? action.payload : initValue
      }
    }
  }
} 
export default Model;