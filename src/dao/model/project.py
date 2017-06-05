#!/usr/bin/python
# -*- coding: utf-8 -*-

"""
项目
@author: zhengxiaoyao0716
"""

from itsdangerous import \
    TimedJSONWebSignatureSerializer as Serializer, \
    SignatureExpired, BadSignature

from .base import *


project_member = Table(
    'project_member', Base.metadata,
    Column('project_id', Integer, ForeignKey('project.id')),
    Column('user_id', Integer, ForeignKey('user.id')),
)


class Project(Base):
    """项目"""
    __tablename__ = 'project'
    SECRET_KEY = 'Example secret key for Mindmap.Project, gen@2017-04-24'

    id = Column(Integer, primary_key=True)
    owner_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    owner = relationship('User', uselist=False)
    name = Column(String(50), nullable=False)
    describe = Column(String(255))
    create_time = Column(String(20))
    _state = Column(Integer)

    members = relationship(
        'User', secondary=project_member, backref='projects')
    messages = relationship('Message', backref='project')

    STATUS_TEXTS = (
        '正在进行',
        '已结束',
        # '已归档',
    )

    def simple(self, user_id):
        """字典化"""
        return {
            'id': self.id,
            'name': self.name,
            'owner': self.owner.account.name,
            'is_owner': self.owner.id == user_id,
            'create_time': self.create_time,
            'status': self.status,
        }

    def gen_invitation(self, member_id, expiration=10 * 60):
        """生成邀请券"""
        serializer = Serializer(self.SECRET_KEY, expires_in=expiration)
        return serializer.dumps({
            'project': self.id,
            'from': {'user': member_id},
            'secret': self.create_time,
        }).decode('utf-8')

    @classmethod
    def check_invitation(cls, invitation):
        """检查邀请券"""
        serializer = Serializer(cls.SECRET_KEY)
        try:
            data = serializer.loads(invitation)
        except SignatureExpired:
            return None  # valid token, but expired
        except BadSignature:
            return None  # invalid token
        if not data:
            return None
        self = cls.query.get(data['project'])
        return self.create_time == data['secret'] and self

    @property
    def status(self):
        """项目状态"""
        return self.STATUS_TEXTS[int(self._state)]

    @status.setter
    def status(self, status_text):
        """设置项目状态"""
        if status_text in self.STATUS_TEXTS:
            self._state = self.STATUS_TEXTS.index(status_text)
            return True
        return '失败，无效的状态'

    def __init__(self, owner_id, name, describe=None):
        self.owner_id = owner_id
        self.name = name
        self.describe = describe
        self.create_time = get_time()
        self._state = 0


class Message(Base):
    """消息"""
    __tablename__ = 'message'

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey('project.id'), nullable=False)
    sender_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    sender = relationship('User', uselist=False)
    content = Column(String(500), nullable=False)
    send_time = Column(String(20))

    @classmethod
    def clean(cls, project_id, expiration=3 * 24 * 3600):
        """清理（过期）消息"""
        db_session.execute(
            'DELETE FROM message WHERE project_id = :project_id AND send_time < :expires',
            {'project_id': project_id, 'expires': get_time(0, -expiration)})
        db_session.flush()

    def __init__(self, project_id, sender_id, content):
        self.project_id = project_id
        self.sender_id = sender_id
        self.content = content
        self.send_time = get_time()
