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
  return request(Api.getVerifyCode, { email, account });
}

export async function resetPassword(code, password) {
  return request(Api.resetPassword, { code, password });
}

export async function logout() {
  return request(Api.logout);
}
