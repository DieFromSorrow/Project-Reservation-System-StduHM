import os

base_dir = os.path.abspath(os.path.dirname(__name__))


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'secret_string')

    HOSTNAME = '127.0.0.1'
    # mysql监听的端口号
    PORT = 3306
    # 数据库名称
    DATABASE = 'rsshm'
    # 连接mysql的用户名
    USERNAME = os.getenv('DATABASE_USERNAME')
    # 连接密码
    PASSWORD = os.getenv('DATABASE_PASSWORD')
    DB_URI = 'mysql+pymysql://{}:{}@{}:{}/{}?charset=utf8'.format(USERNAME, PASSWORD, HOSTNAME, PORT, DATABASE)
    SQLALCHEMY_DATABASE_URI = DB_URI
    pass


class DevelopmentConfig(Config):
    HOSTNAME = '127.0.0.1'
    # mysql监听的端口号
    PORT = 3306
    # 数据库名称
    DATABASE = 'rsshm'
    # 连接mysql的用户名
    USERNAME = 'root'
    # 连接密码
    PASSWORD = '123456'
    DB_URI = 'mysql+pymysql://{}:{}@{}:{}/{}?charset=utf8'.format(USERNAME, PASSWORD, HOSTNAME, PORT, DATABASE)
    SQLALCHEMY_DATABASE_URI = DB_URI
