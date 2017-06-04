# -*- coding: utf-8 -*-

"""
接口蓝图
"""

import datetime
from random import randint
from flask import Blueprint, g, request, session, make_response
from sqlalchemy import or_

from main.util import make_resp, make_err
from dao.model import User, Account
from dao import db_session

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


@blueprint.route('/verify_code/get', methods=['POST'])
def get_verify_code():
    """获取验证码（副作用为创建Account）"""
    code = g.data['account']
    email = g.data['email']
    account = Account.query \
        .filter(Account.code == code) \
        .filter(Account.email == email) \
        .first()
    if not account:
        if Account.query.filter(or_(Account.code == code, Account.email == email)).first():
            return make_err('账户已存在且账号邮箱不匹配')
        account = Account.append(
            code, '%06d' % randint(0, 999999), code, email)
        db_session.flush()
    # TODO 发送验证码到邮箱
    resp = make_response(make_resp('fin'))
    resp.set_cookie('verify_account', str(account.id))
    return resp


@blueprint.route('/password/reset', methods=['POST'])
def reset_password():
    """重置密码（副作用可以创建User）"""
    account = Account.query.get(request.cookies.get('verify_account'))
    if not account:
        return make_err('设置密码失败，无效的cookie或已过期')
    # if not account.check_password(g.data['code']):
    #     return make_err('设置密码失败，验证码无效或已过期')
    User.append(
        account.code,
        g.data['password'],
        g.data.get('name', account.name),
        g.data.get('email', account.email),
        g.data.get('phone', account.phone))
    resp = make_response(make_resp('fin'))
    resp.delete_cookie('verify_account')
    return resp
