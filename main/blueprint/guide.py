# -*- coding: utf-8 -*-

"""
接口蓝图
"""

import datetime
from flask import Blueprint, g, request, session, make_response

from main.util import make_resp, make_err
from dao.model import User

blueprint = Blueprint('guide', __name__)


@blueprint.route('/user/login', methods=['POST'])
def login_user():
    """用户登录"""
    user, err = User.login(
        g.data.get('account'),
        g.data.get('password'),
        request.cookies.get('user'),
    )
    if err:
        return make_err(err)
    session['user'] = user.id
    token = user.account.create_token()
    user_dict = user.simple()
    user_dict['token'] = token
    resp = make_response(make_resp(user_dict))
    resp.set_cookie('user', token)
    return resp
