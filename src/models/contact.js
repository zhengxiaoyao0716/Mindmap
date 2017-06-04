import {
  listContact, addContact, deleteContact,
} from './../services/contact';
import { event } from './../components/Page';

export default {
  namespace: 'contact',

  state: [],

  subscriptions: {
    setup({ dispatch }) {
      return event.on('/contact', () => {
        dispatch({ type: 'list' });
      });
    },
  },

  effects: {
    *list({ payload }, { call, put }) {  // eslint-disable-line
      const data = yield call(listContact);
      yield put({ type: 'save', payload: data });
    },
    *add({ payload: user }, { call, put }) {
      yield call(addContact, user.id);
      yield put({ type: 'push', payload: user });
    },
    *delete({ payload: id }, { call, put }) {
      yield call(deleteContact, id);
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
