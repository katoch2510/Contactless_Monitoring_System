from flask import Blueprint, request, jsonify
from ..db import get_db
from ..utils import require_auth, euclidean_distance, rows_to_list, row_to_dict
import json
import secrets
import datetime

students_bp = Blueprint('students', __name__)

FACE_THRESHOLD = 0.55  # Match threshold (lower = stricter)


@students_bp.route('/register', methods=['POST'])
@require_auth
def register_student():
    data = request.get_json()
    student_id = data.get('student_id', '').strip()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    face_encoding = data.get('face_encoding', [])
    photo_base64 = data.get('photo_base64')

    db = get_db()
    existing = db.execute('SELECT id FROM students WHERE student_id=?', (student_id,)).fetchone()
    if existing:
        db.close()
        return jsonify({'message': 'Student ID already exists'}), 400

    qr_payload = json.dumps({
        'studentId': student_id,
        'type': 'Student',
        'hash': secrets.token_hex(16)
    })

    db.execute(
        '''INSERT INTO students (student_id, name, email, face_encoding, photo_base64, qr_code)
           VALUES (?, ?, ?, ?, ?, ?)''',
        (student_id, name, email, json.dumps(face_encoding), photo_base64, qr_payload)
    )
    db.commit()
    db.close()
    return jsonify({'message': 'Student registered successfully', 'student': {'name': name}}), 201


@students_bp.route('/match', methods=['POST'])
@require_auth
def match_face():
    data = request.get_json()
    descriptor = data.get('descriptor', [])
    gate_location = data.get('gate_location', 'Main Gate Camera')

    if not descriptor:
        return jsonify({'message': 'Face descriptor is missing'}), 400

    db = get_db()
    students = rows_to_list(db.execute("SELECT * FROM students WHERE face_encoding != '[]'").fetchall())
    visitors = rows_to_list(db.execute("SELECT * FROM visitors WHERE face_encoding != '[]'").fetchall())
    faculties = rows_to_list(db.execute("SELECT * FROM faculty WHERE face_encoding != '[]'").fetchall())

    best_match = None
    min_distance = FACE_THRESHOLD
    person_type = None

    for person, ptype in [(students, 'Student'), (visitors, 'Visitor'), (faculties, 'Faculty')]:
        for p in person:
            enc = json.loads(p['face_encoding'])
            if not enc:
                continue
            dist = euclidean_distance(descriptor, enc)
            if dist < min_distance:
                min_distance = dist
                best_match = p
                person_type = ptype

    if not best_match:
        db.close()
        return jsonify({'message': 'Face not recognized or match distance too high.'}), 401

    # Log entry/exit
    active = db.execute(
        'SELECT * FROM entry_logs WHERE person_id=? AND person_type=? AND exit_time IS NULL',
        (best_match['id'], person_type)
    ).fetchone()

    if active:
        db.execute('UPDATE entry_logs SET exit_time=CURRENT_TIMESTAMP WHERE id=?', (active['id'],))
        db.commit()
        log = row_to_dict(db.execute('SELECT * FROM entry_logs WHERE id=?', (active['id'],)).fetchone())
        db.close()
        return jsonify({
            'message': f"Exit logged for {best_match['name']} ({person_type})",
            'log': log, 'action': 'exit',
            'person': best_match['name'], 'type': person_type
        })
    else:
        cur = db.execute(
            'INSERT INTO entry_logs (person_type, person_id, gate_location) VALUES (?, ?, ?)',
            (person_type, best_match['id'], gate_location)
        )
        db.commit()
        log = row_to_dict(db.execute('SELECT * FROM entry_logs WHERE id=?', (cur.lastrowid,)).fetchone())
        db.close()
        return jsonify({
            'message': f"Entry logged for {best_match['name']} ({person_type})",
            'log': log, 'action': 'entry',
            'person': best_match['name'], 'type': person_type
        }), 201


@students_bp.route('/', methods=['GET'])
@require_auth
def get_students():
    db = get_db()
    rows = rows_to_list(db.execute('SELECT id, student_id, name, email, photo_base64, qr_code, created_at FROM students').fetchall())
    db.close()
    return jsonify(rows)


@students_bp.route('/search', methods=['GET'])
@require_auth
def search_students():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify([])
    db = get_db()
    rows = rows_to_list(db.execute(
        '''SELECT id, student_id, name, email FROM students
           WHERE name LIKE ? OR student_id LIKE ? LIMIT 5''',
        (f'%{q}%', f'%{q}%')
    ).fetchall())
    db.close()
    return jsonify(rows)


@students_bp.route('/manual-log', methods=['POST'])
@require_auth
def manual_log():
    data = request.get_json()
    student_id = data.get('studentId')
    gate_location = data.get('gate_location', 'Main Gate (Manual)')

    db = get_db()
    student = row_to_dict(db.execute('SELECT * FROM students WHERE id=?', (student_id,)).fetchone())
    if not student:
        db.close()
        return jsonify({'message': 'Student not found'}), 404

    active = db.execute(
        "SELECT * FROM entry_logs WHERE person_id=? AND person_type='Student' AND exit_time IS NULL",
        (student_id,)
    ).fetchone()

    if active:
        db.execute('UPDATE entry_logs SET exit_time=CURRENT_TIMESTAMP WHERE id=?', (active['id'],))
        db.commit()
        log = row_to_dict(db.execute('SELECT * FROM entry_logs WHERE id=?', (active['id'],)).fetchone())
        db.close()
        return jsonify({'message': f"Manual Exit logged for {student['name']}", 'log': log, 'action': 'exit', 'person': student['name']})
    else:
        cur = db.execute(
            'INSERT INTO entry_logs (person_type, person_id, gate_location) VALUES (?, ?, ?)',
            ('Student', student_id, gate_location)
        )
        db.commit()
        log = row_to_dict(db.execute('SELECT * FROM entry_logs WHERE id=?', (cur.lastrowid,)).fetchone())
        db.close()
        return jsonify({'message': f"Manual Entry logged for {student['name']}", 'log': log, 'action': 'entry', 'person': student['name']}), 201
