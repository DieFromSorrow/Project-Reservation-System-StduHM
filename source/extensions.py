# 存放扩展文件--解决循环引用的问题
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


tl_am = [str(i) + j for i in range(8, 13) for j in [':00', ':30']][1:-1]
tl_pm = [str(i) + j for i in range(2, 7) for j in [':00', ':30']][:-1]

time_choices = [tl_am[i] + '-' + tl_am[i + 1] + 'am' for i in range(len(tl_am) - 1)] + \
               [tl_pm[i] + '-' + tl_pm[i + 1] + 'pm' for i in range(len(tl_pm) - 1)]
