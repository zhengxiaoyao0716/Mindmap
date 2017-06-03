import request from '../utils/request';

const Api = {
  create: '/user/project/create',
  list: '/user/project/list',
  delete: '/user/project/delete',
  remove: '/user/project/remove',
  getDetail: '/user/project/detail/get',
  invitation: '/user/project/invitation/generate',
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

export async function getDetail(query) {
  return request(`${Api.getDetail}${query}`);
}

export async function generateInvitation(projectId) {
  return request(`${Api.invitation}?project_id=${projectId}`);
}
