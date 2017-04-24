# -*- coding: utf-8 -*-

"""
用户接口
"""

from flask import g, session, make_response

from main.util import make_resp, make_err
from dao.model import Project
from dao import db_session
from .base import Route

route = Route('/contact')


@route('/add', methods=['POST'])
def add_contact():
    """添加联系人"""
    err = g.user.add_contact(g.data['user_id'])
    if err:
        return make_err(err)
    return make_resp('fin')


@route('/list')
def list_contact():
    """列出联系人"""
    return make_resp([{
        'id': contact.account.id,
        'account': contact.account.code,
        'name': contact.account.name,
    } for contact in g.user.contacts])


@route('/delete', methods=['POST'])
def delete_contact():
    """删除联系人"""
    db_session.execute(
        'DELETE FROM user_contact WHERE user_id = :user_id AND contact_id = :contact_id',
        {'user_id': g.user.id, 'contact_id': g.data['user_id']})
    return 'fin'
