from flask_cors import CORS
from flask import Flask, request, jsonify, abort
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy.exc import IntegrityError
import jwt
import datetime
import os
from db_config import DB_CONFIG
from model import db, ma, bcrypt

# -----------------------
# ENV + CONFIG
# -----------------------
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise Exception("Missing SECRET_KEY in .env")

JWT_SECRET_KEY = SECRET_KEY

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = DB_CONFIG
app.config["SECRET_KEY"] = SECRET_KEY
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# init extensions
db.init_app(app)
ma.init_app(app)
bcrypt.init_app(app)

from model.user import User, user_schema
from model.transaction import Transaction, transaction_schema, transactions_schema


# Rate limiting
limiter = Limiter(app=app, key_func=get_remote_address, default_limits=[])



# -----------------------
# AUTH HELPERS (STEP 35)
# -----------------------
def create_token(user_id):
    payload = {
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=4),
        "iat": datetime.datetime.utcnow(),
        "sub": str(user_id)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")


def extract_auth_token(authenticated_request):
    auth_header = authenticated_request.headers.get("Authorization")
    if not auth_header:
        return None

    # remove accidental leading/trailing whitespace
    auth_header = auth_header.strip()

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    # token sometimes has whitespace/newlines when copied
    return parts[1].strip()


def decode_token(token):
    print("TOKEN RECEIVED:", repr(token))
    print("SECRET KEY USED:", repr(JWT_SECRET_KEY))
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        print("PAYLOAD:", payload)
        return int(payload["sub"])
    except Exception as e:
        print("JWT ERROR:", repr(e))
        abort(403)


# -----------------------
# ROUTES
# -----------------------
@app.route("/transaction", methods=["POST"])
@limiter.limit("10 per minute")
def add_transaction():
    data = request.get_json() or {}

    token = extract_auth_token(request)
    user_id = None
    if token is not None:
        user_id = decode_token(token)

    usd_amount = float(data.get("usd_amount", 0))
    lbp_amount = float(data.get("lbp_amount", 0))
    usd_to_lbp = data.get("usd_to_lbp")

    if usd_amount <= 0 or lbp_amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400

    if usd_to_lbp is None or type(usd_to_lbp) is not bool:
        return jsonify({"error": "Invalid usd_to_lbp"}), 400

    t = Transaction(
        usd_amount=usd_amount,
        lbp_amount=lbp_amount,
        usd_to_lbp=usd_to_lbp,
        user_id=user_id
    )

    db.session.add(t)
    db.session.commit()

    return jsonify(transaction_schema.dump(t)), 201


@app.route("/transaction", methods=["GET"])
def get_transactions():
    token = extract_auth_token(request)
    if token is None:
        abort(403)

    user_id = decode_token(token)

    transactions = Transaction.query.filter_by(user_id=user_id) \
        .order_by(Transaction.added_date.desc()).all()

    return jsonify(transactions_schema.dump(transactions)), 200


@app.route("/user", methods=["POST"])
def create_user_route():
    data = request.get_json() or {}

    user_name = data.get("user_name")
    password = data.get("password")

    if not user_name or not password:
        return jsonify({"error": "Missing fields"}), 400

    user = User(user_name=user_name, password=password)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Username already exists"}), 409

    return jsonify(user_schema.dump(user)), 201


@app.route("/authentication", methods=["POST"])
def authenticate():
    data = request.get_json() or {}

    user_name = data.get("user_name")
    password = data.get("password")

    if not user_name or not password:
        abort(400)

    user = User.query.filter_by(user_name=user_name).first()
    if user is None:
        abort(403)

    if not bcrypt.check_password_hash(user.hashed_password, password):
        abort(403)

    token = create_token(user.id)
    return jsonify({"token": token}), 200


@app.route("/exchangeRate", methods=["GET"])
def get_exchange_rate():
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(hours=72)

    usd_to_lbp_transactions = Transaction.query.filter(
        Transaction.added_date.between(start_date, end_date),
        Transaction.usd_to_lbp == True
    ).all()

    lbp_to_usd_transactions = Transaction.query.filter(
        Transaction.added_date.between(start_date, end_date),
        Transaction.usd_to_lbp == False
    ).all()

    avg_usd_to_lbp = None
    if len(usd_to_lbp_transactions) > 0:
        total_usd = sum(t.usd_amount for t in usd_to_lbp_transactions)
        total_lbp = sum(t.lbp_amount for t in usd_to_lbp_transactions)
        if total_usd != 0:
            avg_usd_to_lbp = total_lbp / total_usd

    avg_lbp_to_usd = None
    if len(lbp_to_usd_transactions) > 0:
        total_usd = sum(t.usd_amount for t in lbp_to_usd_transactions)
        total_lbp = sum(t.lbp_amount for t in lbp_to_usd_transactions)
        if total_lbp != 0:
            avg_lbp_to_usd = total_usd / total_lbp

    return jsonify({
        "usd_to_lbp_rate": avg_usd_to_lbp,
        "lbp_to_usd_rate": avg_lbp_to_usd
    }), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=False)