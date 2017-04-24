# -*- coding: utf-8 -*-

"""
用户接口
"""

from flask import Blueprint, g, session, make_response

from main.util import make_resp, make_err
from dao.model import User

blueprint = Blueprint('user', __name__)

Route = lambda prefix: lambda rule, *args, **kwargs: \
    blueprint.route(prefix + rule, *args, **kwargs)


@blueprint.before_request
def before_request():
    """请求预处理"""
    if 'user' in session:
        user = User.query.get(session['user'])
        if not user:
            return make_err(u'身份过期，请重新登录', '/guide/login', 401)
        g.user = user
    else:
        return make_err(u'请先登录', '/guide/login', 401)


@blueprint.route('/logout')
def logout():
    """登出"""
    session.pop('user')
    resp = make_response(make_resp('fin'))
    resp.delete_cookie('user')
    return resp


@blueprint.route('/password/update', methods=['POST'])
def update_password():
    """修改密码"""
    _, err = g.user.change_password(
        g.data['oldPasswd'], g.data['newPasswd'])
    if err:
        return make_err(err)
    return make_resp('fin')


@blueprint.route('/user/search')
def search_user():
    """查询用户"""
    return make_resp([user.simple() for user in User.search(g.data['keyword'])])
