# -*- coding: utf-8 -*-

"""
思维导图在线协作
@author: zhengxiaoyao0716
"""

import os
import time

from flask import Flask, json, redirect, request, g, session

from dao import db_session
from dao.model import User
from .config import Config
from .socket import socketio


app = Flask(__name__)
Config.init(app)
URL_PREFIX = Config.APPLICATION_ROOT
socketio.init_app(app, path=Config.APPLICATION_ROOT + '/socket.io')


@app.before_request
def bind_data():
    """绑定请求数据"""
    g.data = request.json or request.form or request.args


@app.teardown_appcontext
def shutdown_session(response_or_exc):
    """请求结束时或者应用关闭时删除数据库会话"""
    try:
        if not response_or_exc:
            db_session.commit()
    finally:
        db_session.remove()
    return response_or_exc


def reg_blueprints():
    """注册蓝图"""
    for bp_name in ['api', 'guide', 'user', 'view']:
        main = __import__('main.blueprint.' + bp_name)
        blueprint = main.blueprint.__dict__[bp_name].blueprint
        blueprint.static_folder = '../../html/static'
        app.register_blueprint(
            blueprint, url_prefix=URL_PREFIX + '/' + bp_name)
reg_blueprints()
