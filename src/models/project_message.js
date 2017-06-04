import socket, { join, send, leave } from './../services/project_socket';
import { event } from './../components/Page';
import { onMessage } from './../components/ChatRoom';
import { helper } from './../components/Mindmap';

export default {
  namespace: 'projectMessage',

  state: {
    commands: [],
  },

  subscriptions: {
    setup({ dispatch }) {
      return event.on('/project/edit', (location) => {
        dispatch({ type: 'join', payload: (r => r && r[1])(location.search.match(/project_id=(\d)/)) });
      });
    },
    join() {
      socket.removeListener('join');
      return socket.on('join', data =>
        event.ready('/project/edit#join', () => {
          onMessage.addKnownUser(data.who);
          onMessage('系统通知', `@${data.who.account} 加入编辑`);
        }));
    },
    send({ dispatch }) {
      socket.removeListener('send');
      return socket.on('send', (data) => {
        onMessage.addKnownUser(data.sender);
        if (data.content.startsWith('/')) {
          dispatch({ type: 'pushCommands', payload: data });
        } else if (data.content.startsWith('./')) {
          helper.onCommand(data.sender, data.content, data.send_time);
        } else {
          onMessage(data.sender, data.content, data.send_time);
        }
      });
    },
    leave() {
      socket.removeListener('leave');
      return socket.on('leave', (data) => {
        onMessage.addKnownUser(data.who);
        onMessage('系统通知', `@${data.who.account} 退出编辑`);
      });
    },
  },

  effects: {
    *join({ payload }, { call, put }) {  // eslint-disable-line
      const data = yield call(join, payload);
      yield put({ type: 'saveCommands', payload: data.recent_messages });
    },
    *send({ payload }, { call, put }) {  // eslint-disable-line
      yield call(send, payload);
    },
    *leave({ payload }, { call, put }) {  // eslint-disable-line
      yield call(leave, payload);
      // yield put({ type: 'save', payload: data });
    },
  },

  reducers: {
    save(state, { payload }) {
      return payload;
    },
    saveCommands(state, { payload }) {
      return { ...state, commands: payload };
    },
    pushCommands(state, { payload }) {
      return { ...state, commands: [...state.commands, payload] };
    },
  },
};
