import {
  list as listProject,
  create as createProject,
  deleteProject,
  remove as removeProject,
  getDetail,
} from './../services/project';
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
    *create({ payload: { name, description } }, { call, put }) {
      const data = yield call(createProject, name);
      yield put({ type: 'push', payload: data });
    },
    *delete({ payload: id }, { call, put }) {
      yield call(deleteProject, id);
      yield put({ type: 'pop', payload: id });
    },
    *remove({ payload: id }, { call, put }) {
      yield call(removeProject, id);
      yield put({ type: 'pop', payload: id });
    },
  },

  reducers: {
    save(state, { payload }) {
      return payload;
    },
    push(state, { payload }) {
      return [...state, payload];
    },
    pop(state, { payload }) {
      return state.filter(({ id }) => payload !== id);
    },
  },
};
