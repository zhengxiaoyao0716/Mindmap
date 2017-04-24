# -*- coding: utf-8 -*-

"""
连接数据库
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

from config import CONNECT_URL

engine = create_engine(
    CONNECT_URL['now'],
    echo=False, encoding='utf8', convert_unicode=True
)

db_session = scoped_session(sessionmaker(
    autocommit=False, autoflush=False, bind=engine))
db_session.commit()
