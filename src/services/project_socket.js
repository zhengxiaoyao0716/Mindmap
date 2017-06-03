const socket = { on: () => { } };
export default socket;

export async function join(projectId) {
  // TODO
}
export async function send(message) {
  // TODO
}
export async function leave() {
  // TODO
}

// const socket = io.connect('/Mindmap/socket/project', { 'path': '/Mindmap/socket.io' });
// socket.on('join', (data) => console.info(`${data.who.name}加入了项目`, data));
// socket.on('send', (data) => console.info(`${data.sender.name}说：${data.content}`, data));
// socket.on('leave', (data) => console.info(`${data.who.name}离开了项目`, data));
// socket.emit('join', { 'project_id': 1 }, console.log);
// socket.emit('send', 'Test message', console.log);
// socket.emit('leave', {}, console.log);
