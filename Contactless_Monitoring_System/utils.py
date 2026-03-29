import os
import json
import jwt
import bcrypt
from datetime import datetime, timezone
from functools import wraps
from flask import request, jsonify

SECRET_KEY = os.environ.get('JWT_SECRET', 'supersecretjwtsecretkey123')
JWT_EXPIRE_DAYS = 30


def generate_token(user_id, role):
    payload = {
        'sub': user_id,
        'role': role,
        'iat': datetime.now(timezone.utc).timestamp(),
        'exp': datetime.now(timezone.utc).timestamp() + (JWT_EXPIRE_DAYS * 86400)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def decode_token(token):
    return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        try:
            payload = decode_token(token)
            request.user_id = payload['sub']
            request.user_role = payload.get('role', 'admin')
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated


def hash_password(plain):
    return bcrypt.hashpw(plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(plain, hashed):
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


def euclidean_distance(desc1, desc2):
    """Pure Python Euclidean distance between two float lists."""
    if len(desc1) != len(desc2):
        return float('inf')
    return sum((a - b) ** 2 for a, b in zip(desc1, desc2)) ** 0.5


def row_to_dict(row):
    """Convert sqlite3.Row to plain dict."""
    if row is None:
        return None
    return dict(row)


def rows_to_list(rows):
    return [dict(r) for r in rows]
