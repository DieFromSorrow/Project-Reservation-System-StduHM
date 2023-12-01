from flask import Flask, render_template, redirect

from source.apis import api
from source.commands import register_initdb
from source.extensions import db
from source.extensions import socketio
from source.extensions import mail
from source.forms import ReservationForm
from source.models import Reservation
from source.settings import Config, DevelopmentConfig


def create_app(config=DevelopmentConfig):
    app = Flask('source')
    app.config.from_object(config)
    register_socketio(app)
    register_blueprints(app)
    register_extensions(app)
    register_commands(app)
    return app


def register_blueprints(app: Flask):
    @app.route('/')
    def index():
        return redirect(location='user')

    @app.route('/user')
    def user():
        return render_template('user.html', form=ReservationForm())

    @app.route('/admin')
    def admin():
        return render_template('admin.html')

    @app.route('/guider')
    def guider():
        return render_template('guiders.html')

    @app.route('/admin_password', methods=['INTERNAL'])
    def admin_password():
        return {'success': True, 'password': app.config.get('ADMIN_PASSWORD')}

    app.register_blueprint(api, url_prefix='/api/v1')


def register_socketio(app: Flask):
    socketio.init_app(app)

    @socketio.on('connect')
    def handle_connect():
        print('A client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('A client disconnected')


def register_extensions(app: Flask):
    db.init_app(app)
    mail.init_app(app)


def register_commands(app: Flask):
    register_initdb(app)


if __name__ == "__main__":
    socketio.run(create_app())
