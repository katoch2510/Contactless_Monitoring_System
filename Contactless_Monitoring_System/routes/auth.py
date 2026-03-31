from flask import Blueprint, request, jsonify
from ..db import get_db
from ..utils import hash_password, check_password, generate_token, require_auth, row_to_dict

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    db = get_db()
    row = db.execute('SELECT * FROM admins WHERE email = ?', (email,)).fetchone()
    db.close()

    if row and check_password(password, row['password']):
        token = generate_token(row['id'], row['role'])
        return jsonify({
            '_id': row['id'],
            'name': row['name'],
            'email': row['email'],
            'role': row['role'],
            'token': token
        })
    return jsonify({'message': 'Invalid email or password'}), 401


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'admin')

    db = get_db()
    existing = db.execute('SELECT id FROM admins WHERE email = ?', (email,)).fetchone()
    if existing:
        db.close()
        return jsonify({'message': 'Admin already exists'}), 400

    hashed = hash_password(password)
    cur = db.execute(
        'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
        (name, email, hashed, role)
    )
    db.commit()
    admin_id = cur.lastrowid
    db.close()

    token = generate_token(admin_id, role)
    return jsonify({
        '_id': admin_id,
        'name': name,
        'email': email,
        'role': role,
        'token': token
    }), 201


@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'})
