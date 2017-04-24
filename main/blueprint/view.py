# -*- coding: utf-8 -*-

"""
页面蓝图
"""

from flask import Blueprint, render_template

blueprint = Blueprint('view', __name__)


@blueprint.before_request
def before_request():
    """请求预处理"""
    pass


@blueprint.route('/')
@blueprint.route('/index.html')
def index():
    """索引页"""
    return render_template('index.html')
