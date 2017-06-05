# -*- coding: utf-8 -*-

"""
app配置
"""

import json


class Config(object):
    """基本配置类"""

    SECRET_KEY = "Example secret key, gen@2017-04-24."
    APPLICATION_ROOT = '/Mindmap'

    @classmethod
    def init(cls, app, config_name='Config'):
        """初始化配置类"""
        app.config.from_object('main.config.' + config_name)
        app.template_folder = '../html'
        app.static_folder = '../html/static'
        cls.open = app.open_instance_resource

    @classmethod
    def get_config(cls):
        """读取配置"""
        config = None
        with cls.open('config.json') as config_file:
            config = json.load(config_file)
        return config


class DevelopConfig(Config):
    """开发过程配置"""
    DEBUG = True
    PORT = 5000


def get_config():
    """读取配置"""
    return Config.get_config()
