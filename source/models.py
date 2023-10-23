from source.extensions import db
from flask_sqlalchemy import SQLAlchemy
from source.extensions import time_choices


db: SQLAlchemy = db


class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    identity = db.Column(db.String(128), nullable=False)
    phone = db.Column(db.String(64), nullable=False)
    date = db.Column(db.Date, nullable=False)  # Change to Date type
    time = db.Column(db.Enum(*time_choices), nullable=False)  # Change to Enum type
    num_peoples = db.Column(db.SmallInteger, nullable=False)  # Change to SmallInteger type
    explain = db.Column(db.Boolean, nullable=False)
    notes = db.Column(db.Text)
    time_submitted = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f"<Reservation {self.id}>\n" \
               f"   :name {self.name}\n" \
               f"   :identity {self.identity}\n" \
               f"   :phone {self.phone}\n" \
               f"   :date {self.date}\n" \
               f"   :time {self.time}\n" \
               f"   :num_peoples {self.num_peoples}\n" \
               f"   :explain {self.explain}\n" \
               f"   :notes {self.notes if len(self.notes) < 53 else self.notes[:50] + '...'}" \
               f"   :time_submitted {self.time_submitted}\n"

