from . import db, ma
from sqlalchemy import CheckConstraint
import datetime


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usd_amount = db.Column(db.Float, nullable=False)
    lbp_amount = db.Column(db.Float, nullable=False)
    usd_to_lbp = db.Column(db.Boolean, nullable=False)
    added_date = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)

    __table_args__ = (
        CheckConstraint("usd_amount > 0", name="check_usd_amount_positive"),
        CheckConstraint("lbp_amount > 0", name="check_lbp_amount_positive"),
    )

    def __init__(self, usd_amount, lbp_amount, usd_to_lbp, user_id=None):
        super(Transaction, self).__init__(
            usd_amount=usd_amount,
            lbp_amount=lbp_amount,
            usd_to_lbp=usd_to_lbp,
            user_id=user_id,
            added_date=datetime.datetime.now()
        )


class TransactionSchema(ma.Schema):
    id = ma.Integer(dump_only=True)
    usd_amount = ma.Float()
    lbp_amount = ma.Float()
    usd_to_lbp = ma.Boolean()
    added_date = ma.DateTime()
    user_id = ma.Integer(allow_none=True)

    class Meta:
        fields = ("id", "usd_amount", "lbp_amount", "usd_to_lbp", "added_date", "user_id")


transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)