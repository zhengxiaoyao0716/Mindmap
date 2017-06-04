#!/usr/bin/python
# -*- coding: utf-8 -*-

"""
账户
@author: zhengxiaoyao0716
"""


from passlib.apps import custom_app_context as pwd_context
from itsdangerous import \
    TimedJSONWebSignatureSerializer as Serializer, \
    SignatureExpired, BadSignature

from sqlalchemy import or_

from .base import *


class Account(Base):
    """账户"""
    __tablename__ = 'account'
    SECRET_KEY = 'Example secret key for Mindmap.Account, gen@2017-04-24'

    id = Column(Integer, primary_key=True)
    code = Column(String(25), unique=True, nullable=False)
    secret = Column(String(255))
    name = Column(String(50), nullable=False)
    email = Column(String(255), unique=True)
    phone = Column(String(25), unique=True)

    @property
    def user(self):
        """获取绑定的用户"""
        return User.query.filter(User.account_id == self.id).first()

    def create_token(self, expiration=3 * 24 * 60 * 60):
        """生成token"""
        serializer = Serializer(self.SECRET_KEY, expires_in=expiration)
        return serializer.dumps({'id': self.id, 'secret': self.secret[-1:-7:-1]}).decode('utf-8')

    @classmethod
    def parse_token(cls, token):
        """解析token"""
        serializer = Serializer(cls.SECRET_KEY)
        try:
            data = serializer.loads(token)
        except SignatureExpired:
            return None  # valid token, but expired
        except BadSignature:
            return None  # invalid token
        if not data:
            return None
        self = cls.query.get(data['id'])
        return self.secret[-1:-7:-1] == data['secret'] and self

    def set_password(self, password):
        """设置密码"""
        self.secret = pwd_context.encrypt(password)

    def check_password(self, password):
        """检查密码"""
        return pwd_context.verify(password, self.secret)

    @classmethod
    def login(cls, code, password, token=''):
        """登入"""
        if code and password:
            self = cls.query.filter(cls.code == code).first()
            if not self:
                return None, u'帐号不存在'
            if not self.user:
                return None, u'帐号未激活'
            if not self.check_password(password):
                return None, u'密码错误'
        else:
            if not token:
                return None, u'缺少参数'
            self = cls.parse_token(token)
            if not self:
                return None, u'token无效或已过期'
        return self, None

    def change_password(self, old_passwd, new_passwd):
        """修改密码"""
        if not self.check_password(old_passwd):
            return None, u'原密码错误'
        self.set_password(new_passwd)
        return new_passwd, None

    def __init__(self, code, password, name, email=None, phone=None):
        self.code = code
        self.set_password(password)
        self.name = name
        self.email = email
        self.phone = phone


user_contact = Table(
    'user_contact', Base.metadata,
    Column('user_id', Integer, ForeignKey('user.id')),
    Column('contact_id', Integer, ForeignKey('user.id')),
)


class User(Base):
    """用户"""
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey('account.id'), nullable=False)
    account = relationship('Account', uselist=False)
    contacts = relationship('User',
                            secondary=user_contact,
                            primaryjoin=user_contact.c.user_id == id,
                            secondaryjoin=user_contact.c.contact_id == id)

    @classmethod
    def login(cls, code, password, token=''):
        """登入"""
        account, err = Account.login(code, password, token)
        self = account.user if account else None
        return self, err

    def change_password(self, old_passwd, new_passwd):
        """修改密码"""
        return self.account.change_password(old_passwd, new_passwd)

    @classmethod
    def search(cls, keyword):
        """查找用户（精确查询）"""
        return User.query.filter(or_(
            Account.code == keyword,
            Account.name == keyword,
            Account.phone == keyword,
            Account.email == keyword,
        )).all()

    def add_contact(self, user_id):
        """添加联系人"""
        user = User.query.get(user_id)
        if not user:
            return '无效的用户ID'
        if user in self.contacts:
            return '该用户已经是联系人了'
        self.contacts.append(user)
        return None

    @classmethod
    def append(cls, code, password, name, email=None, phone=None):
        """添加新用户"""
        account = Account.query.filter(Account.code == code).first()
        if account:
            account.set_password(password)
            account.name = name
            account.email = email
            account.phone = phone
        else:
            account = Account.append(code, password, name, email, phone)
            db_session.flush()
        return append_model_instance(cls, account.id)

    def simple(self):
        """字典化"""
        return {
            'id': self.id,
            'account': self.account.code,
            'name': self.account.name,
            'email': self.account.email,
            'phone': self.account.phone,
        }

    def __init__(self, account_id):
        self.account_id = account_id


class Manager(Base):
    """管理员"""
    __tablename__ = 'manager'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)

    def __init__(self, user_id):
        self.user_id = user_id
