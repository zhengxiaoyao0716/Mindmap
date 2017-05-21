import { list as listProject, create as createProject } from './../services/project';
import { event } from './../components/Page';

export default {
  namespace: 'project',

  state: [],

  subscriptions: {
    setup({ dispatch }) {
      return event.on('/project', () => {
        dispatch({ type: 'list' });
      });
    },
  },

  effects: {
    *list({ payload }, { call, put }) {  // eslint-disable-line
      const data = yield call(listProject);
      yield put({ type: 'save', payload: data });
    },
    *create({ payload: name }, { call, put }) {
      const data = yield call(createProject, name);
      yield put({ type: 'push', payload: data });
    },
  },

  reducers: {
    save(state, { payload }) {
      return payload;
    },
    push(state, { payload }) {
      return [...state, payload];
    },
  },

};
