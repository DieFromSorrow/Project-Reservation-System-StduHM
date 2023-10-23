from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, BooleanField, DateField, SelectField, TextAreaField
from wtforms.validators import DataRequired, Length, ValidationError
from source.models import Reservation
from source.extensions import time_choices


class ReservationForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(max=64)])
    identity = StringField('Identity', validators=[DataRequired(), Length(max=128)])
    phone = StringField('Phone', validators=[DataRequired(), Length(max=64)])
    date = DateField('Date', validators=[DataRequired()])
    time = SelectField('Time', choices=time_choices, validators=[DataRequired()])
    num_peoples = IntegerField('Number of People', validators=[DataRequired()])
    explain = BooleanField('Explanation')
    notes = TextAreaField('Notes')

    def validate_time(self, field):
        # Check if there is a reservation for the same date and time
        date = self.date.data
        time = field.data
        existing_reservation = Reservation.query.filter_by(date=date, time=time).first()
        if existing_reservation:
            raise ValidationError('预订冲突：此时时段已被预定')

    def validate_num_peoples(self, field):
        if field.data > 32767:
            raise ValidationError('人数过多')