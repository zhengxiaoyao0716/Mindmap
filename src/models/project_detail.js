import { getDetail, removeMember } from './../services/project';
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
    setupEdit({ dispatch }) {
      return event.on('/project/edit', (location) => {
        dispatch({ type: 'get', payload: location.search });
      });
    },
  },

  effects: {
    *get({ payload }, { call, put }) {  // eslint-disable-line
      const data = yield call(getDetail, payload);
      event.ready('/project/edit#join');
      yield put({ type: 'save', payload: data });
    },
    *removeMember({ payload: { projectId, userId } }, { call, put }) {  // eslint-disable-line
      yield call(removeMember, projectId, userId);
      yield put({ type: 'pop', payload: userId });
    },
  },

  reducers: {
    save(state, { payload }) {
      return payload;
    },
    pop(state, { payload: id }) {
      return { ...state, members: state.members.filter(user => user.id !== id) };
    },
  },
};
