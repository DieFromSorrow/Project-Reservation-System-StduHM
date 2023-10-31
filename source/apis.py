import json
from datetime import datetime

from flask import request, jsonify, url_for
from flask.blueprints import Blueprint
from flask.views import MethodView
from flask_socketio import emit
from sqlalchemy import desc
from werkzeug.datastructures import MultiDict

from source.extensions import db
from source.forms import ReservationForm
from source.models import Reservation

api = Blueprint('api', __name__)


def reservation_schema(reservation: Reservation):
    return reservation.to_json()


def reservations_schema(reservations):
    return {
        'reservations': [reservation_schema(reservation)
                         for reservation in reservations]
    }


def url_schema(url):
    return {
        'url': url
    }


class IndexAPI(MethodView):
    def get(self):
        return jsonify({
            'api_version': '1.0'
        })


class UrlAPI(MethodView):
    def get(self, endpoint):
        url = url_for(endpoint)
        return url_schema(url)


class GuidersAPI(MethodView):
    def get(self):
        json_path = 'source/guiders.json'
        with open(json_path, 'r', encoding='utf-8') as file:
            guilders = json.load(file)
        weekday = request.args.get('weekday')
        if weekday:
            guilders = guilders[weekday]
        return jsonify(guilders)

    def post(self):
        json_path = 'source/guiders.json'
        with open(json_path, 'w', encoding='utf-8') as file:
            # print(request.json)
            file.write(str(request.json).replace("'", '"'))
        return {'success': True}


class ReservationAPI(MethodView):
    def get(self, item_id):
        reservation = Reservation.query.get_or_404(item_id)
        return reservation_schema(reservation)


class ReservationsAPI(MethodView):
    def get(self):
        args_dict = request.args.to_dict()
        limit_dict = {}
        for key in ['limit', 'begin_id', 'end_id']:
            if args_dict.get(key):
                limit_dict[key] = args_dict.pop(key)
        reservations = Reservation.query.filter_by(**args_dict).order_by(desc(Reservation.id))
        if limit_dict.get('begin_id'):
            reservations = reservations.filter(Reservation.id >= limit_dict.get('begin_id'))
        if limit_dict.get('end_id'):
            reservations = reservations.filter(Reservation.id <= limit_dict.get('end_id'))
        if limit_dict.get('limit'):
            reservations = reservations.limit(limit_dict.get('limit'))

        return reservations_schema(reservations)

    def post(self):
        form_json = request.json
        # print(form_json)
        form = ReservationForm(MultiDict(form_json))  # 使用 ReservationForm 进行表单验证

        if form.validate():  # 如果表单验证通过
            data = form.data
            # Create a new reservation entry in the database
            now = datetime.now()
            reservation = Reservation(
                name=data['name'],
                identity=data['identity'],
                phone=data['phone'],
                date=data['date'],  # 使用表单中的已验证数据
                time=data['time'],
                num_peoples=data['num_peoples'],
                explain=data['explain'],
                notes=data['notes'],
                time_submitted=now
            )

            db.session.add(reservation)
            db.session.commit()

            form_json['id'] = Reservation.query.order_by(desc(Reservation.id)).first().id
            form_json['time_submitted'] = str(now)

            emit('new_reservation', form_json, namespace='', broadcast=True)

            return jsonify({'success': True, 'message': '预约成功！'})
        else:
            # print(form.errors)
            return jsonify({'success': False, 'errors': form.errors})


api.add_url_rule('/',
                 view_func=IndexAPI.as_view('index'),
                 methods=['GET'])

api.add_url_rule('/url/<string:endpoint>',
                 view_func=UrlAPI.as_view('url'),
                 methods=['GET'])

api.add_url_rule('/guiders',
                 view_func=GuidersAPI.as_view('guiders'),
                 methods=['GET', 'POST'])

api.add_url_rule('/reservation',
                 view_func=ReservationsAPI.as_view('reservations'),
                 methods=['GET', 'POST'])

api.add_url_rule('/reservation/<int:item_id>',
                 view_func=ReservationAPI.as_view('reservation'),
                 methods=['GET'])
