from flask import Blueprint, jsonify
from db import get_db
from utils import require_auth, rows_to_list
import datetime

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/stats', methods=['GET'])
@require_auth
def get_stats():
    try:
        db = get_db()

        total_visitors = db.execute('SELECT COUNT(*) as c FROM visitors').fetchone()['c']
        total_students = db.execute('SELECT COUNT(*) as c FROM students').fetchone()['c']
        active_entries = db.execute('SELECT COUNT(*) as c FROM entry_logs WHERE exit_time IS NULL').fetchone()['c']

        # Recent entries - last 7 days, grouped by date
        seven_days_ago = (datetime.datetime.utcnow() - datetime.timedelta(days=7)).strftime('%Y-%m-%d')
        recent_raw = db.execute('''
            SELECT
                DATE(entry_time) as date,
                SUM(CASE WHEN person_type='Student' THEN 1 ELSE 0 END) as studentEntries,
                SUM(CASE WHEN person_type='Visitor' THEN 1 ELSE 0 END) as visitorEntries
            FROM entry_logs
            WHERE DATE(entry_time) >= ?
            GROUP BY DATE(entry_time)
            ORDER BY date ASC
        ''', (seven_days_ago,)).fetchall()
        recent_entries = [{'date': r['date'], 'studentEntries': r['studentEntries'], 'visitorEntries': r['visitorEntries']} for r in recent_raw]

        db.close()
        return jsonify({
            'kpis': {
                'totalVisitors': total_visitors,
                'totalStudents': total_students,
                'activeEntries': active_entries
            },
            'charts': {
                'recentEntries': recent_entries
            }
        })
    except Exception as e:
        return jsonify({'message': str(e)}), 500
