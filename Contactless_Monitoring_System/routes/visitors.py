from flask import Blueprint, request, jsonify
from ..db import get_db
from ..utils import require_auth, rows_to_list, row_to_dict
import secrets
import random

visitors_bp = Blueprint('visitors', __name__)


@visitors_bp.route('/register', methods=['POST'])
def register_visitor():
    data = request.get_json()
    visitor_id = str(random.randint(100000, 999999))
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip().lower()
    purpose = data.get('purpose', '').strip()
    visit_date = data.get('visit_date', '')
    face_encoding = data.get('face_encoding', [])
    photo_base64 = data.get('photo_base64', '')

    import json
    qr_payload = json.dumps({
        'visitorId': visitor_id,
        'type': 'Visitor',
        'hash': secrets.token_hex(8)
    })

    db = get_db()
    cur = db.execute(
        '''INSERT INTO visitors (visitor_id, name, phone, email, purpose, visit_date, face_encoding, photo_base64, qr_code)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (visitor_id, name, phone, email, purpose, visit_date,
         json.dumps(face_encoding), photo_base64, qr_payload)
    )
    visitor_db_id = cur.lastrowid
    db.commit()
    db.close()
    return jsonify({'message': 'Visitor booking registered. Entry will be logged at the Gate Terminal.', 'visitorId': visitor_db_id}), 201


@visitors_bp.route('/', methods=['GET'])
@require_auth
def get_visitors():
    db = get_db()
    rows = rows_to_list(db.execute(
        'SELECT id, visitor_id, name, phone, email, purpose, visit_date, photo_base64, created_at FROM visitors ORDER BY created_at DESC'
    ).fetchall())
    db.close()
    return jsonify(rows)
