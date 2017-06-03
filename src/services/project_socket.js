import io from 'socket.io-client';
import { message } from 'antd';

const socket = io.connect('/Mindmap/socket/project', { path: '/Mindmap/socket.io' });
export default socket;

function emit(event, data) {
  return new Promise(resolve => socket.emit(event, data, resolve))
    .then(d => JSON.parse(d))
    .then(d => (d.flag ? d.body : Promise.reject(d.reas)))
    .catch((e) => {
      message.error(e);
      throw e;
    });
}

export async function join(projectId) {
  return emit('join', { project_id: projectId });
}
export async function send(content) {
  return emit('send', content);
}
export async function leave() {
  return emit('leave', {});
}
