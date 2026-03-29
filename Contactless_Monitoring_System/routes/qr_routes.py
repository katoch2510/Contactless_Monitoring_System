from flask import Blueprint, request, jsonify
from db import get_db
from utils import require_auth, rows_to_list, row_to_dict
import json
import secrets

qr_bp = Blueprint('qr', __name__)


@qr_bp.route('/scan', methods=['POST'])
@require_auth
def scan_qr():
    data = request.get_json()
    qr_payload_str = data.get('qr_payload', '')
    gate_location = data.get('gate_location', 'Main Gate')

    if not qr_payload_str:
        return jsonify({'message': 'No QR code provided'}), 400

    try:
        payload = json.loads(qr_payload_str)
        ptype = payload.get('type')

        db = get_db()

        if ptype == 'Visitor':
            visitor_id = payload.get('visitorId')
            person = row_to_dict(db.execute(
                "SELECT * FROM visitors WHERE visitor_id=? AND qr_code=?",
                (visitor_id, qr_payload_str)
            ).fetchone())
            if not person:
                db.close()
                return jsonify({'message': 'Invalid or expired Visitor QR code'}), 404
            pid = person['id']
        elif ptype == 'Student':
            student_id = payload.get('studentId')
            person = row_to_dict(db.execute(
                "SELECT * FROM students WHERE student_id=? AND qr_code=?",
                (student_id, qr_payload_str)
            ).fetchone())
            if not person:
                db.close()
                return jsonify({'message': 'Invalid Student QR code'}), 404
            pid = person['id']
        else:
            return jsonify({'message': 'Invalid QR format'}), 400

        active = db.execute(
            'SELECT * FROM entry_logs WHERE person_id=? AND person_type=? AND exit_time IS NULL',
            (pid, ptype)
        ).fetchone()

        if active:
            db.execute('UPDATE entry_logs SET exit_time=CURRENT_TIMESTAMP WHERE id=?', (active['id'],))
            db.commit()
            log = row_to_dict(db.execute('SELECT * FROM entry_logs WHERE id=?', (active['id'],)).fetchone())
            db.close()
            return jsonify({'message': f'{ptype} exit logged successfully', 'log': log, 'action': 'exit'})
        else:
            cur = db.execute(
                'INSERT INTO entry_logs (person_type, person_id, gate_location) VALUES (?, ?, ?)',
                (ptype, pid, gate_location)
            )
            db.commit()
            log = row_to_dict(db.execute('SELECT * FROM entry_logs WHERE id=?', (cur.lastrowid,)).fetchone())
            db.close()
            return jsonify({'message': f'{ptype} entry logged successfully', 'log': log, 'action': 'entry'}), 201

    except Exception as e:
        return jsonify({'message': 'Failed to process QR code.'}), 400


@qr_bp.route('/logs', methods=['GET'])
@require_auth
def get_logs():
    db = get_db()
    # Join with students + visitors + faculty to get person name/email
    rows = []
    logs = rows_to_list(db.execute(
        'SELECT * FROM entry_logs ORDER BY entry_time DESC'
    ).fetchall())

    for log in logs:
        ptype = log['person_type']
        pid = log['person_id']
        person = None
        if ptype == 'Student':
            person = row_to_dict(db.execute('SELECT name, email FROM students WHERE id=?', (pid,)).fetchone())
        elif ptype == 'Faculty':
            person = row_to_dict(db.execute('SELECT name, email FROM faculty WHERE id=?', (pid,)).fetchone())
        elif ptype == 'Visitor':
            person = row_to_dict(db.execute('SELECT name, email FROM visitors WHERE id=?', (pid,)).fetchone())
        log['person_id'] = person or {'name': 'Unknown', 'email': 'N/A'}
        rows.append(log)

    db.close()
    return jsonify(rows)
