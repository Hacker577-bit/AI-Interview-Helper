"""Create all database tables.

Usage:
  Local SQLite:  python init_db.py
  Remote Turso:  export TURSO_DATABASE_URL=libsql://... && export TURSO_AUTH_TOKEN=eyJ... && python init_db.py
"""
import os
from dotenv import load_dotenv

load_dotenv()

from run import create_app
from app import db
from app.models.user import User
from app.models.interview import InterviewSession, Question, Response, Feedback


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
        print(f"Tables created at: {app.config['SQLALCHEMY_DATABASE_URI'].split('?')[0]}")
