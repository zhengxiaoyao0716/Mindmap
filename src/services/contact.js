import request from '../utils/request';

const Api = {
  add: '/user/contact/add',
  list: '/user/contact/list',
  delete: '/user/contact/delete',
};

export async function addContact(userId) {
  return request(Api.add, { user_id: userId });
}

export async function listContact() {
  return request(Api.list);
}

export async function deleteContact(userId) {
  return request(Api.delete, { user_id: userId });
}
