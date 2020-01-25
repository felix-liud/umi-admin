import { Effect } from '../menu/model';
import { Reducer } from 'redux';
import { getDicts } from './service';


export interface ListType {
  id: string;
  name: string;
  description: string;
  type: number;
  code: string;
}
export interface FormType {
  name: string;
  code: string;
  description: string;
}

export interface StateType {
  list: ListType[];
  form: FormType;
}
interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    featchDicts: Effect;
  },
  reducers: {
    saveDicts: Reducer;
    saveForm: Reducer;
  }

}
const initFormValue: FormType = {
  name: '',
  code: '',
  description: ''
}
const Model: ModelType = {
  namespace: 'sysDict',
  state: {
    form: { ...initFormValue },
    list: []
  },
  effects: {
    *featchDicts({ payload, callback }, { call, put }) {
      const response = yield call(getDicts, payload);
      if (response.code !== 2000) {
        return; 
      }
      yield put({
        type: 'saveDicts',
        payload: response.data.records      
      });
      typeof callback === 'function' && callback();
    }
  },
  reducers: {
    saveDicts(state, action) {
      return {
        ...state,
        list: action.payload
      }
    },
    saveForm(state, action) {
      console.log(action, 'fff');
      
      return {
        ...state,
        form: action.payload
      }
    }
  }

}

export default Model;