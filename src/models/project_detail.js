import { getDetail } from './../services/project';
import { event } from './../components/Page';

export default {
  namespace: 'projectDetail',

  state: {},

  subscriptions: {
    setup({ dispatch }) {
      return event.on('/project/detail', (location) => {
        dispatch({ type: 'get', payload: location.search });
      });
    },
  },

  effects: {
    *get({ payload }, { call, put }) {  // eslint-disable-line
      const data = yield call(getDetail, payload);
      yield put({ type: 'save', payload: data });
    },
  },

  reducers: {
    save(state, { payload }) {
      return payload;
    },
  },
};
