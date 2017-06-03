import request from '../utils/request';

const Api = {
  login: '/guide/user/login',
  getVerifyCode: '/guide/verify_code/get',
  resetPassword: '/guide/password/reset',
  logout: '/user/logout',
};

export async function login(account, password) {
  return request(Api.login, { account, password });
}

export async function getVerifyCode(email, account) {
  // TODO 后端支持
  return request(Api.getVerifyCode, { email, account }).catch(e => e);
}

export async function resetPasseord(code, password) {
  // TODO 后端支持
  return request(Api.resetPassword, { code, password }).catch(e => e);
}

export async function logout() {
  return request(Api.logout);
}
