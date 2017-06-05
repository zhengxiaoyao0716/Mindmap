# -*- coding: utf-8 -*-
"""
数据库基础模板
"""

from datetime import timedelta, datetime

from sqlalchemy.ext.declarative import declarative_base as _base
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship

from dao.connect import db_session


def get_time(delta_day=0, delta_second=0):
    """获取时间"""
    return str(datetime.now() + timedelta(delta_day, delta_second))[0:19]


Base = _base()
Base.query = db_session.query_property()


def simple_model_dict(self):
    """获取实例字典"""
    model_dict = dict(self.__dict__)
    del model_dict['_sa_instance_state']
    return model_dict
Base.simple = simple_model_dict
Base.__repr__ = lambda self: str(simple_model_dict(self))


def append_model_instance(cls, *args, **kwargs):
    """添加新的实例"""
    self = cls(*args, **kwargs)
    db_session.add(self)
    return self
Base.append = classmethod(append_model_instance)
