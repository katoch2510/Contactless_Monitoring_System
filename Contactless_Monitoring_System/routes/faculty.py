from flask import Blueprint, request, jsonify
from db import get_db
from utils import require_auth, rows_to_list, row_to_dict
import json
import secrets

faculty_bp = Blueprint('faculty', __name__)


@faculty_bp.route('/register', methods=['POST'])
@require_auth
def register_faculty():
    data = request.get_json()
    faculty_id = data.get('faculty_id', '').strip()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    face_encoding = data.get('face_encoding', [])
    photo_base64 = data.get('photo_base64')

    db = get_db()
    existing = db.execute('SELECT id FROM faculty WHERE faculty_id=?', (faculty_id,)).fetchone()
    if existing:
        db.close()
        return jsonify({'message': 'Faculty ID already exists'}), 400

    qr_payload = json.dumps({
        'facultyId': faculty_id,
        'type': 'Faculty',
        'hash': secrets.token_hex(16)
    })

    db.execute(
        'INSERT INTO faculty (faculty_id, name, email, face_encoding, photo_base64, qr_code) VALUES (?, ?, ?, ?, ?, ?)',
        (faculty_id, name, email, json.dumps(face_encoding), photo_base64, qr_payload)
    )
    db.commit()
    db.close()
    return jsonify({'message': 'Faculty registered successfully', 'faculty': {'name': name}}), 201


@faculty_bp.route('/', methods=['GET'])
@require_auth
def get_faculty():
    db = get_db()
    rows = rows_to_list(db.execute(
        '''SELECT f.id, f.faculty_id, f.name, f.email, f.photo_base64, f.qr_code, f.created_at
           FROM faculty f'''
    ).fetchall())
    db.close()
    return jsonify(rows)


@faculty_bp.route('/search', methods=['GET'])
@require_auth
def search_faculty():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify([])
    db = get_db()
    rows = rows_to_list(db.execute(
        'SELECT id, faculty_id, name, email FROM faculty WHERE name LIKE ? OR faculty_id LIKE ? LIMIT 5',
        (f'%{q}%', f'%{q}%')
    ).fetchall())
    db.close()
    return jsonify(rows)
