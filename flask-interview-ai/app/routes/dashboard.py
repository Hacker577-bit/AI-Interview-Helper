from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app import db
from app.models.interview import InterviewSession, Feedback

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard')
@login_required
def index():
    sessions = InterviewSession.query.filter_by(user_id=current_user.id).order_by(InterviewSession.created_at.desc()).limit(10).all()
    
    completed_sessions = InterviewSession.query.filter_by(user_id=current_user.id, status='COMPLETED').all()
    total_interviews = len(completed_sessions)
    
    avg_score = 0
    if completed_sessions:
        feedbacks = Feedback.query.join(InterviewSession).filter(
            InterviewSession.user_id == current_user.id,
            InterviewSession.status == 'COMPLETED'
        ).all()
        if feedbacks:
            avg_score = sum(f.overall_score or 0 for f in feedbacks) / len(feedbacks)
    
    in_progress = InterviewSession.query.filter_by(user_id=current_user.id, status='IN_PROGRESS').first()
    
    return render_template('dashboard/index.html', 
                         sessions=sessions,
                         total_interviews=total_interviews,
                         average_score=round(avg_score, 1),
                         in_progress=in_progress)


@dashboard_bp.route('/dashboard/history')
@login_required
def history():
    sessions = InterviewSession.query.filter_by(user_id=current_user.id, status='COMPLETED').order_by(InterviewSession.completed_at.desc()).all()
    return render_template('dashboard/history.html', sessions=sessions)


@dashboard_bp.route('/dashboard/settings')
@login_required
def settings():
    return render_template('dashboard/settings.html')
