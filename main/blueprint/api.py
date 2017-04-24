# -*- coding: utf-8 -*-

"""
接口蓝图
"""

import datetime
from flask import Blueprint

from main.util import make_resp, make_err

blueprint = Blueprint('api', __name__)


@blueprint.before_request
def before_request():
    """请求预处理"""
    pass


@blueprint.route('/time/pull')
def pull_time():
    """拉取当前时间"""
    if False:
        return make_err("Error reason.")
    return make_resp(str(datetime.datetime.now()))
