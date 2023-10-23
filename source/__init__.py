from flask import Flask, render_template, url_for, redirect
from source.extensions import db
from source.models import Reservation
from source.forms import ReservationForm
from source.commands import register_initdb
from source.apis import api
from source.settings import Config, DevelopmentConfig


def create_app(config=DevelopmentConfig):
    app = Flask('source')
    app.config.from_object(config)
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

    app.register_blueprint(api, url_prefix='/api/v1')


def register_extensions(app: Flask):
    db.init_app(app)


def register_commands(app: Flask):
    register_initdb(app)

