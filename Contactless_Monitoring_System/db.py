import sqlite3
import os
import json

# Use /tmp on serverless environments where the deployed filesystem is read-only.
DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), 'campus.db')
TMP_DB_PATH = '/tmp/campus.db'

if os.path.isdir('/tmp') and os.access('/tmp', os.W_OK):
    DB_PATH = TMP_DB_PATH
else:
    DB_PATH = DEFAULT_DB_PATH

# Ensure directory for DB path exists
db_dir = os.path.dirname(DB_PATH)
if db_dir and not os.path.isdir(db_dir):
    try:
        os.makedirs(db_dir, exist_ok=True)
    except Exception:
        pass


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()

    # Admins
    c.execute('''CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Students
    c.execute('''CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        face_encoding TEXT DEFAULT '[]',
        photo_base64 TEXT,
        qr_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Faculty
    c.execute('''CREATE TABLE IF NOT EXISTS faculty (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        faculty_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        face_encoding TEXT DEFAULT '[]',
        photo_base64 TEXT,
        qr_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Visitors
    c.execute('''CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visitor_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        purpose TEXT,
        visit_date TEXT,
        face_encoding TEXT DEFAULT '[]',
        photo_base64 TEXT,
        qr_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Entry Logs
    c.execute('''CREATE TABLE IF NOT EXISTS entry_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_type TEXT NOT NULL,
        person_id INTEGER NOT NULL,
        gate_location TEXT DEFAULT 'Main Gate',
        entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        exit_time DATETIME
    )''')

    conn.commit()
    conn.close()
    print("Database initialized successfully.")
