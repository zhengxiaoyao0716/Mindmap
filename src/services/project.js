import request from '../utils/request';

const Api = {
  create: '/user/project/create',
  list: '/user/project/list',
  delete: '/user/project/delete',
  getDetail: '/user/project/detail/get',
  invitation: '/user/project/invitation/generate',
  addMember: '/user/project/member/add',
  removeMember: '/user/project/member/remove',
};

export async function create(name, description) {
  return request(Api.create, { name, description });
}

export async function list() {
  return request(Api.list);
}

export async function remove(projectId) {
  return request(Api.removeMember, { project_id: projectId });
}

export async function deleteProject(projectId) {
  return request(Api.delete, { project_id: projectId });
}

export async function getDetail(query) {
  return request(`${Api.getDetail}${query}`);
}

export async function generateInvitation(projectId) {
  return request(`${Api.invitation}?project_id=${projectId}`);
}

export async function addMember(projectId, userId) {
  return request(Api.addMember, { project_id: projectId, user_id: userId });
}

export async function removeMember(projectId, userId) {
  return request(Api.removeMember, { project_id: projectId, user_id: userId });
}

