from flask import current_app
from source.extensions import mail
from flask_mail import Message
from threading import Thread
import random, string


def _send_async_mail(_app, _message):
    with _app.app_context():
        mail.send(message=_message)


def send_async_mail(subject, to, body):
    message = Message(subject=subject, recipients=[to], html=body)
    _app = current_app._get_current_object()
    thr = Thread(target=_send_async_mail, args=[_app, message])
    thr.start()
    return thr


def send_captcha(receptions):
    _captcha = ''.join(random.choices(string.digits, k=6))
    send_async_mail(subject='石铁大校史馆团体预约参观验证码', to=receptions,
                    body='<p>石铁大校史馆团体预约参观验证码为：</p>' + '<h1>' + _captcha + '</h1>'
                         + '<p>验证码在120s内有效，请勿泄露给他人</p>')
    return _captcha
