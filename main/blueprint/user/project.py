# -*- coding: utf-8 -*-

"""
用户接口
"""

from flask import g, session, make_response

from main.util import make_resp, make_err
from dao.model import Project, User
from dao import db_session
from dao.model.base import get_time
from .base import Route

route = Route('/project')


@route('/create', methods=['POST'])
def create_project():
    """创建项目"""
    if g.user.projects and g.user.projects[-1].create_time > get_time(0, -60):
        return make_err('您的操作太频繁')
    project = Project.append(g.user.id, g.data['name'], g.data.get('describe'))
    project.members.append(g.user)
    db_session.flush()
    return make_resp({
        'id': project.id,
        'name': project.name,
        'describe': project.describe,
        'create_time': project.create_time,
        'status': project.status,
    })


@route('/invitation/generate')
def generate_invitation():
    """生成邀请券"""
    project = Project.query.get(g.data['project_id'])
    return make_resp(project.gen_invitation(g.user.id))


@route('/join', methods=['POST'])
def join_project():
    """加入项目"""
    project = Project.check_invitation(g.data['invitation'])
    if not project:
        return make_err('邀请券无效或已过期')
    project.members.append(g.user)
    return make_resp({
        'id': project.id,
        'name': project.name,
        'describe': project.describe,
        'create_time': project.create_time,
        'status': project.status,
    })


@route('/list')
def list_project():
    """列出项目"""
    return make_resp([{
        'id': project.id,
        'owner': {
            'id': project.owner.account.id,
            'account': project.owner.account.code,
            'name': project.owner.account.name,
            # 'email': project.owner.account.email,
            # 'phone': project.owner.account.phone,
        },
        'name': project.name,
        # 'describe': project.describe,
        'create_time': project.create_time,
        'status': project.status,
    } for project in g.user.projects])


@route('/detail/get')
def get_project_detail():
    """获取项目详情"""
    project = Project.query.get(g.data['project_id'])
    if not project:
        return make_err('项目不存在或已删除')
    return make_resp({
        'id': project.id,
        'owner': project.owner.simple(),
        'name': project.name,
        'describe': project.describe,
        'create_time': project.create_time,
        'status': project.status,
        'members': [member.simple() for member in project.members]
    })


@route('/delete')
def delete_project():
    """删除项目"""
    project = Project.query.get(g.data['project_id'])
    if not project:
        return make_err('项目不存在或已删除')
    if project.owner != g.user:
        return make_err('项目所有者才有权删除项目')
    db_session.delete(project)
    return 'fin'


@route('/member/add')
def add_member():
    """添加项目成员"""
    project = Project.query.get(g.data['project_id'])
    if not project:
        return make_err('项目不存在或已删除')
    if g.user not in project.members:
        return make_err('项目的成员才有权添加新成员')
    user = User.query.get(g.data['user_id'])
    if not user:
        return make_err('无效的用户ID')
    project.members.append(user)
    return 'fin'


@route('/member/remove')
def remove_member():
    """移除项目成员"""
    project = Project.query.get(g.data['project_id'])
    if not project:
        return make_err('项目不存在或已删除')
    if project.owner != g.user:
        return make_err('项目所有者才有权移除成员')
    user_id = g.data['user_id']
    if int(user_id) == g.user.id:
        return make_err('身为项目所有者，你不能退出')
    db_session.execute(
        'DELETE FROM project_member WHERE project_id = :project_id AND user_id = :user_id',
        {'project_id': project.id, 'user_id': user_id})
    return 'fin'
