from flask import Flask, send_from_directory, render_template
from flask_cors import CORS
import os
from db import init_db
from routes.auth import auth_bp
from routes.students import students_bp
from routes.faculty import faculty_bp
from routes.visitors import visitors_bp
from routes.dashboard import dashboard_bp
from routes.qr_routes import qr_bp

# Determine template/static folder paths relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'static'),
    static_url_path='/static'
)
CORS(app)

# Register API blueprints
app.register_blueprint(auth_bp,         url_prefix='/api/auth')
app.register_blueprint(students_bp,     url_prefix='/api/students')
app.register_blueprint(faculty_bp,      url_prefix='/api/faculty')
app.register_blueprint(visitors_bp,     url_prefix='/api/visitors')
app.register_blueprint(dashboard_bp,    url_prefix='/api/dashboard')
app.register_blueprint(qr_bp,           url_prefix='/api/qr')


# ─── Serve HTML Pages ────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/visit-register')
def visitor_register_page():
    return render_template('visit-register.html')

@app.route('/scanner')
def scanner_page():
    return render_template('scanner.html')

@app.route('/admin/')
@app.route('/admin')
def admin_dashboard():
    return render_template('admin/index.html')

@app.route('/admin/logs')
def admin_logs():
    return render_template('admin/logs.html')

@app.route('/admin/profiles')
def admin_profiles():
    return render_template('admin/profiles.html')

@app.route('/admin/register-student')
def admin_register_student():
    return render_template('admin/register-student.html')

@app.route('/admin/register-faculty')
def admin_register_faculty():
    return render_template('admin/register-faculty.html')


# ─── Error Handlers ──────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return {'message': 'Not found'}, 404

@app.errorhandler(500)
def server_error(e):
    return {'message': str(e)}, 500


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    print("Starting SmartCampus server at http://127.0.0.1:5000")
    app.run(debug=True, port=5000, host='127.0.0.1')
