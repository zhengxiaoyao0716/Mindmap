import { login } from './../services/user';
import localStorage from './../utils/storage';

export default {
  namespace: 'account',

  state: {
    baseInfo: null,
  },

  subscriptions: {
    // setup({ dispatch, history }) {  // eslint-disable-line
    // },
  },

  effects: {
    * autoLogin({ payload }, { call, put }) {  // eslint-disable-line
      const data = yield login().catch((err) => {
        localStorage.removeItem('remmeber');
        payload(err);
        return null;
      });
      if (data != null) {
        yield put({ type: 'saveBaseInfo', payload: data });
      }
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
    saveBaseInfo(state, { payload }) {
      return { ...state, baseInfo: payload };
    },
  },

};
