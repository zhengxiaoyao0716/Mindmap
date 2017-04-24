# -*- coding: utf-8 -*-

"""
辅助模块
"""

from flask import json, url_for


def make_resp(body, then=None):
    """创建响应(json)"""
    return json.dumps({
        'flag': True, 'body': body, 'then': then
    }), 200, {'Content-Type': 'application/json'}


def make_err(reas, then=None, status=403):
    """创建响应(json)"""
    return json.dumps({
        'flag': False, 'reas': reas, 'then': then
    }), status, {'Content-Type': 'application/json'}
