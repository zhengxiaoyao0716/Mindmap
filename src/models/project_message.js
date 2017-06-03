import socket, { join, send, leave } from './../services/project_socket';
import { event } from './../components/Page';

export default {
  namespace: 'projectMessage',

  state: {
  },

  subscriptions: {
    setup({ dispatch }) {
      return event.on('/project/edit', (location) => {
        dispatch({ type: 'join', payload: location.search });
      });
    },
    join({ dispatch }) {
      return socket.on('join', (data) => {
        console.log(data, dispatch);
      });
    },
    send({ dispatch }) {
      return socket.on('send', (data) => {
        console.log(data, dispatch);
      });
    },
    leave({ dispatch }) {
      return socket.on('leave', (data) => {
        console.log(data, dispatch);
      });
    },
  },

  effects: {
    *join({ payload }, { call, put }) {  // eslint-disable-line
      const data = yield call(join, payload);
      // yield put({ type: 'save', payload: data });
    },
    *send({ payload }, { call, put }) {  // eslint-disable-line
      const data = yield call(send, payload);
      // yield put({ type: 'save', payload: data });
    },
    *leave({ payload }, { call, put }) {  // eslint-disable-line
      const data = yield call(leave, payload);
      // yield put({ type: 'save', payload: data });
    },
  },

  reducers: {
    save(state, { payload }) {
      return payload;
    },
    // TODO 接收消息类型，聊天、绘制等等
  },
};
