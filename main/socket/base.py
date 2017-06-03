#!/usr/bin/python
# -*- coding: utf-8 -*-

"""
Socket IO通讯
@author: zhengxiaoyao0716
"""

from functools import wraps

from flask_socketio import (
    SocketIO, join_room, leave_room,
    emit,
    # close_room, disconnect
)
from flask import request, session

from dao.model.base import get_time
from dao.model import User, Message
from dao import db_session
from main.config import Config
from main.util import make_err as _make_err, make_resp as _make_resp

socketio = SocketIO()

namespace = Config.APPLICATION_ROOT + '/socket/project'


def make_resp(data):
    """成功数据"""
    try:
        db_session.commit()
    finally:
        db_session.remove()
    return _make_resp(data)[0]


def make_err(reas):
    """失败数据"""
    try:
        db_session.commit()
    finally:
        db_session.remove()
    return _make_err(reas)[0]


def request_join(func):
    """检查用户是否进入了项目"""
    @wraps(func)
    def _wrapper(*args, **kwargs):
        if 'user' not in session or 'project' not in session:
            return make_err('请先进入项目')
        return func(*args, **kwargs)
    return _wrapper


@socketio.on('join', namespace=namespace)
def join(json):
    """加入"""
    user, err = User.login(None, None, request.cookies.get('user'))
    if err:
        return make_err(err)
    project_id = json['project_id']
    if not db_session.execute(
            'SELECT * FROM project_member WHERE project_id = :project_id AND user_id = :user_id',
            {'project_id': project_id, 'user_id': user.id}).fetchone():
        return make_err('项目ID错误或您不是该项目的成员')
    join_room(str(project_id))
    # socketio.emit('', {}, room=str(project_id), namespace=namespace)
    emit('join', {'who': {
        'id': user.id,
        'account': user.account.code,
        'name': user.account.name,
    }}, room=str(project_id))
    session['user'] = user.id
    session['project'] = project_id
    return make_resp({
        'recent_messages': [{
            'id': message.id,
            'sender': {
                'id': message.sender_id,
                'account':  message.sender.account.code,
                'name':  message.sender.account.name,
            },
            'content': message.content,
            'send_time': message.send_time,
        } for message in Message.query.filter(
            Message.project_id == project_id
        ).order_by(
            Message.send_time.asc()
            # ).limit(json.get('limit') or 100).all()]
        ).all()]
    })


@socketio.on('send', namespace=namespace)
@request_join
def send(content):
    """发送消息"""
    if content.startswith('/'):
        message = Message.append(session['project'], session['user'], content)
        db_session.flush()
        emit('send', {
            'id': message.id,
            'sender': {
                'id': message.sender_id,
                'account':  message.sender.account.code,
                'name':  message.sender.account.name,
            },
            'content': message.content,
            'send_time': message.send_time,
        }, room=str(session['project']))
    else:
        sender = User.query.get(session['user'])
        emit('send', {
            'sender': {
                'id': sender.id,
                'account':  sender.account.code,
                'name':  sender.account.name,
            },
            'content': content,
            'send_time': get_time(),
        }, room=str(session['project']))
    return make_resp('fin')


@socketio.on('leave', namespace=namespace)
@request_join
def leave(_):
    """离开"""
    user = User.query.get(session['user'])
    emit('leave', {'who': {
        'id': user.id,
        'account': user.account.code,
        'name': user.account.name,
    }}, room=str(session['project']))
    leave_room(str(session['project']))
    return make_resp('fin')


# @socketio.on('close', namespace=namespace)
# def close(json):
#     """关闭"""
#     close_room(json['project_id'])
