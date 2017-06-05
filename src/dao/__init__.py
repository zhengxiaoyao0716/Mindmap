# -*- coding: utf-8 -*-

"""
数据库模块
"""

from .connect import engine, db_session
from .model import *

def create_all():
    """创建所有表"""
    Base.metadata.create_all(bind=engine)

def drop_all():
    """清空所有表"""
    Base.metadata.drop_all(bind=engine)
