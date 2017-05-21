import request from '../utils/request';

const Api = {
  create: '/user/project/create',
  list: '/user/project/list',
  delete: '/user/project/delete',
  remove: '/user/project/remove',
};

export async function create(name, description) {
  return request(Api.create, { name, description });
}

export async function list() {
  return request(Api.list);
}

export async function deleteProject(projectId) {
  return request(Api.delete, { project_id: projectId });
}

export async function remove(projectId) {
  return request(Api.remove, { project_id: projectId });
}

/* eslint-disable */
/*
{
  function fetchJson(url, data = undefined) {
    return fetch('/Mindmap' + url, {
      method: data ? 'POST' : 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': data ? 'application/json; charset="UTF-8"' : 'application/x-www-form-urlencoded',
      },
      body: data && JSON.stringify(data),
      credentials: 'include',
    }).then(
      r => r.status >= 200 && r.status < 300 ? Promise.resolve(r.json()) : Promise.reject((r.statusText, r.text()))
      ).catch(console.error);
  }
  fetchJson('/guide/user/login', { 'account': 'zhengxiaoyao0716', 'password': '18101301995', }).then(d => JSON.stringify(d)).then(console.log)
    // 登录
    .then(() => fetchJson('/user/user/search?keyword=18101301995')).then(d => JSON.stringify(d)).then(console.log)
    // 项目
    .then(() =>
      fetchJson(
        '/user/project/create', { 'name': 'Test' }
      ).then(d => d.body).then(project => {
        console.log(project);
        return fetchJson('/user/project/invitation/generate?project_id=' + project.id);
      }).then(d => d.body).then(invitation => {
        console.log(invitation);
        return fetchJson('/user/project/join', { 'invitation': invitation });
      }).then(d => JSON.stringify(d)).then(console.log).catch(console.error)
    )
    // 长链接
    .then(() => {
      const socket = io.connect('/Mindmap/socket/project', { 'path': '/Mindmap/socket.io' });
      socket.on('join', (data) => console.info(`${data.who.name}加入了项目`, data));
      socket.on('send', (data) => console.info(`${data.sender.name}说：${data.content}`, data));
      socket.on('leave', (data) => console.info(`${data.who.name}离开了项目`, data));
      socket.emit('join', { 'project_id': 1 }, console.log);
      socket.emit('send', 'Test message', console.log);
      socket.emit('leave', {}, console.log);
    });
}
*/
