import datetime
from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, BooleanField, DateField, \
    SelectField, TextAreaField, EmailField
from wtforms.validators import DataRequired, Length, ValidationError, Email
from source.extensions import time_choices
from source.models import Reservation


class ReservationForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(min=2, max=16)])
    identity = StringField('Identity', validators=[DataRequired(), Length(min=2, max=32)])
    phone = StringField('Phone', validators=[DataRequired()])
    date = DateField('Date', validators=[DataRequired()])
    time = SelectField('Time', choices=time_choices, validators=[DataRequired()])
    num_peoples = IntegerField('Number of People', validators=[DataRequired()])
    explain = BooleanField('Explanation')
    email = EmailField('Email', validators=[DataRequired(), Email()])
    notes = TextAreaField('Notes', validators=[Length(max=256)])

    def validate_phone(self, field):
        if len(field.data) < 5 or len(field.data) > 12:
            raise ValidationError('长度非法')
        if not field.data.isdigit():
            raise ValidationError('格式错误')

    def validate_date(self, field):
        date = field.data
        if date < datetime.date.today() or date > datetime.date.today() + datetime.timedelta(days=365):
            raise ValidationError('日期非法')

    def validate_time(self, field):
        # Check if there is a reservation for the same date and time
        date = self.date.data
        time = field.data
        existing_reservation = Reservation.query.filter_by(date=date, time=time).first()
        if existing_reservation:
            raise ValidationError('预订冲突：此时时段已被预定')

    def validate_num_peoples(self, field):
        if 1 > field.data or field.data > 40:
            raise ValidationError('人数非法')
