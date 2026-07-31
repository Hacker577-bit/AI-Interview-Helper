from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user
from app import db
from app.models.interview import InterviewSession, Feedback
from datetime import datetime

api_bp = Blueprint('api', __name__)


@api_bp.route('/sessions/all')
@login_required
def all_sessions():
    sessions = InterviewSession.query.filter_by(user_id=current_user.id).order_by(InterviewSession.created_at.desc()).all()
    
    return render_template('api/sessions.html', sessions=sessions)
