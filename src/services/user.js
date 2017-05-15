import request from '../utils/request';

const Api = {
  logout: '/Mindmap/user/logout',
};

export async function logout() {
  return request(Api.logout);
}
