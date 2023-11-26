import os

base_dir = os.path.abspath(os.path.dirname(__name__))


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'secret_string')

    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USERNAME = os.getenv('QQ_ACCOUNT')
    MAIL_PASSWORD = os.getenv('QQMAIL_API_KEY')
    MAIL_DEFAULT_SENDER = os.getenv('Thousand_Sails_Race_Admin', MAIL_USERNAME)

    HOSTNAME = '127.0.0.1'
    # mysql监听的端口号
    PORT = 3306
    # 数据库名称
    DATABASE = os.getenv('DATABASE_NAME')
    # 连接mysql的用户名
    USERNAME = os.getenv('DB_USERNAME')
    # 连接密码
    PASSWORD = os.getenv('DB_PASSWORD')
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
