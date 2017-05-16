// import request from '../utils/request';
import fetch from 'dva/fetch';
import { message } from 'antd';

const Api = {
  login: '/guide/user/login',
  getVerifyCode: '/guide/verify_code/get',
  resetPassword: '/guide/password/reset',
  logout: '/user/logout',
};

// function request(url, data = undefined) {
//   return _request(`/Mindmap${url}`, {
//     method: data ? 'POST' : 'GET',
//     body: data && JSON.stringify(data),
//     credentials: 'include',
//   });
// }
function request(url, data = undefined) {
  return fetch(`/Mindmap${url}`, {
    method: data ? 'POST' : 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': data ? 'application/json; charset="UTF-8"' : 'application/x-www-form-urlencoded',
    },
    body: data && JSON.stringify(data),
    credentials: 'include',
  }).then(
    r => r.json().catch(
      () => Promise.reject(new Error(r.statusText)),
    ).then(
      (json) => {
        if (r.status >= 200 && r.status < 300) {
          return json.body;
        }
        message.error(json.reas);
        throw new Error(json.reas);
      },
    ),
  );
}

export async function login(account, password) {
  return request(Api.login, { account, password });
}

export async function getVerifyCode(email, account) {
  return request(Api.getVerifyCode, { email, account }).catch(e => e);
  return request(Api.getVerifyCode, { email, account });
}

export async function resetPasseord(code, password) {
  return request(Api.resetPassword, { code, password }).catch(e => e);
  return request(Api.resetPassword, { code, password });
}

export async function logout() {
  return request(Api.logout);
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
