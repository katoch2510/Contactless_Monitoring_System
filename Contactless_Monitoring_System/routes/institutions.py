from flask import Blueprint, request, jsonify
from db import get_db
from utils import require_auth, rows_to_list, row_to_dict
import json
import secrets
import math

institutions_bp = Blueprint('institutions', __name__)


def _colleges(db):
    return rows_to_list(db.execute('SELECT * FROM colleges ORDER BY name').fetchall())

def _departments(db, college_id):
    return rows_to_list(db.execute('SELECT * FROM departments WHERE college_id=? ORDER BY name', (college_id,)).fetchall())

def _courses(db, department_id):
    return rows_to_list(db.execute('SELECT * FROM courses WHERE department_id=? ORDER BY name', (department_id,)).fetchall())

def _sections(db, course_id):
    return rows_to_list(db.execute('SELECT * FROM sections WHERE course_id=? ORDER BY name', (course_id,)).fetchall())


@institutions_bp.route('/colleges', methods=['GET'])
@require_auth
def get_colleges():
    db = get_db()
    data = _colleges(db)
    db.close()
    return jsonify(data)


@institutions_bp.route('/departments/<int:college_id>', methods=['GET'])
@require_auth
def get_departments(college_id):
    db = get_db()
    data = _departments(db, college_id)
    db.close()
    return jsonify(data)


@institutions_bp.route('/courses/<int:department_id>', methods=['GET'])
@require_auth
def get_courses(department_id):
    db = get_db()
    data = _courses(db, department_id)
    db.close()
    return jsonify(data)


@institutions_bp.route('/sections/<int:course_id>', methods=['GET'])
@require_auth
def get_sections(course_id):
    db = get_db()
    data = _sections(db, course_id)
    db.close()
    return jsonify(data)


@institutions_bp.route('/colleges', methods=['POST'])
@require_auth
def create_college():
    name = request.get_json().get('name', '').strip()
    db = get_db()
    cur = db.execute('INSERT INTO colleges (name) VALUES (?)', (name,))
    db.commit()
    row = row_to_dict(db.execute('SELECT * FROM colleges WHERE id=?', (cur.lastrowid,)).fetchone())
    db.close()
    return jsonify(row), 201


@institutions_bp.route('/departments', methods=['POST'])
@require_auth
def create_department():
    data = request.get_json()
    db = get_db()
    cur = db.execute('INSERT INTO departments (name, college_id) VALUES (?, ?)', (data['name'], data['college_id']))
    db.commit()
    row = row_to_dict(db.execute('SELECT * FROM departments WHERE id=?', (cur.lastrowid,)).fetchone())
    db.close()
    return jsonify(row), 201


@institutions_bp.route('/courses', methods=['POST'])
@require_auth
def create_course():
    data = request.get_json()
    db = get_db()
    cur = db.execute('INSERT INTO courses (name, department_id) VALUES (?, ?)', (data['name'], data['department_id']))
    db.commit()
    row = row_to_dict(db.execute('SELECT * FROM courses WHERE id=?', (cur.lastrowid,)).fetchone())
    db.close()
    return jsonify(row), 201


@institutions_bp.route('/sections', methods=['POST'])
@require_auth
def create_section():
    data = request.get_json()
    db = get_db()
    cur = db.execute('INSERT INTO sections (name, course_id) VALUES (?, ?)', (data['name'], data['course_id']))
    db.commit()
    row = row_to_dict(db.execute('SELECT * FROM sections WHERE id=?', (cur.lastrowid,)).fetchone())
    db.close()
    return jsonify(row), 201


@institutions_bp.route('/<string:itype>/<int:item_id>', methods=['PUT'])
@require_auth
def edit_institution(itype, item_id):
    table_map = {'college': 'colleges', 'department': 'departments', 'course': 'courses', 'section': 'sections'}
    table = table_map.get(itype)
    if not table:
        return jsonify({'message': 'Invalid type'}), 400
    name = request.get_json().get('name', '').strip()
    db = get_db()
    db.execute(f'UPDATE {table} SET name=? WHERE id=?', (name, item_id))
    db.commit()
    row = row_to_dict(db.execute(f'SELECT * FROM {table} WHERE id=?', (item_id,)).fetchone())
    db.close()
    return jsonify(row)


@institutions_bp.route('/<string:itype>/<int:item_id>', methods=['DELETE'])
@require_auth
def delete_institution(itype, item_id):
    db = get_db()
    try:
        if itype == 'college':
            # Cascade: depts -> courses -> sections -> students
            depts = db.execute('SELECT id FROM departments WHERE college_id=?', (item_id,)).fetchall()
            for d in depts:
                courses = db.execute('SELECT id FROM courses WHERE department_id=?', (d['id'],)).fetchall()
                for c in courses:
                    db.execute('DELETE FROM sections WHERE course_id=?', (c['id'],))
                db.execute('DELETE FROM courses WHERE department_id=?', (d['id'],))
            db.execute('DELETE FROM departments WHERE college_id=?', (item_id,))
            db.execute('DELETE FROM students WHERE college_id=?', (item_id,))
            db.execute('DELETE FROM colleges WHERE id=?', (item_id,))
        elif itype == 'department':
            courses = db.execute('SELECT id FROM courses WHERE department_id=?', (item_id,)).fetchall()
            for c in courses:
                db.execute('DELETE FROM sections WHERE course_id=?', (c['id'],))
            db.execute('DELETE FROM courses WHERE department_id=?', (item_id,))
            db.execute('DELETE FROM students WHERE department_id=?', (item_id,))
            db.execute('DELETE FROM departments WHERE id=?', (item_id,))
        elif itype == 'course':
            db.execute('DELETE FROM sections WHERE course_id=?', (item_id,))
            db.execute('DELETE FROM students WHERE course_id=?', (item_id,))
            db.execute('DELETE FROM courses WHERE id=?', (item_id,))
        elif itype == 'section':
            db.execute('DELETE FROM students WHERE section_id=?', (item_id,))
            db.execute('DELETE FROM sections WHERE id=?', (item_id,))
        else:
            return jsonify({'message': 'Invalid type'}), 400

        db.commit()
        db.close()
        return jsonify({'message': 'Deleted successfully'})
    except Exception as e:
        db.close()
        return jsonify({'message': str(e)}), 500
