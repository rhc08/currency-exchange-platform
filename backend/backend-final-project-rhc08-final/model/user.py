from . import db, ma, bcrypt


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(30), unique=True)
    hashed_password = db.Column(db.String(128))

    def __init__(self, user_name, password):
        super(User, self).__init__(user_name=user_name)
        self.hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")


class UserSchema(ma.Schema):
    id = ma.Integer(dump_only=True)
    user_name = ma.String()


user_schema = UserSchema()