from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.interview import InterviewSession, Question, Response, Feedback
from app.services.openai_service import generate_interview_questions, generate_feedback
from datetime import datetime

interviews_bp = Blueprint('interviews', __name__)


@interviews_bp.route('/interviews/new', methods=['GET', 'POST'])
@login_required
def create():
    if request.method == 'POST':
        interview_type = request.form.get('interview_type', 'MIXED')
        difficulty = request.form.get('difficulty', 'MID')
        question_count = int(request.form.get('question_count', 10))
        mode = request.form.get('mode', 'TEXT')
        job_description = request.form.get('job_description')
        
        session = InterviewSession(
            user_id=current_user.id,
            interview_type=interview_type,
            difficulty=difficulty,
            mode=mode,
            job_description=job_description
        )
        db.session.add(session)
        db.session.commit()
        
        questions = generate_interview_questions(
            interview_type=interview_type,
            difficulty=difficulty,
            count=question_count,
            job_description=job_description
        )
        
        for idx, q in enumerate(questions):
            question = Question(
                session_id=session.id,
                sequence_number=idx + 1,
                question_text=q.get('question', ''),
                question_type=q.get('type', interview_type),
                category=q.get('category', 'General')
            )
            db.session.add(question)
        
        db.session.commit()
        flash('Interview created successfully!', 'success')
        return redirect(url_for('interviews.start', session_id=session.id))
    
    return render_template('interviews/create.html')


@interviews_bp.route('/interviews/<int:session_id>')
@login_required
def start(session_id):
    session = InterviewSession.query.get_or_404(session_id)
    
    if session.user_id != current_user.id:
        flash('Access denied', 'error')
        return redirect(url_for('dashboard.index'))
    
    unanswered = Question.query.filter_by(session_id=session_id).order_by(Question.sequence_number).first()
    
    if not unanswered:
        return redirect(url_for('interviews.complete', session_id=session_id))
    
    answered = Question.query.join(Response).filter(
        Question.session_id == session_id,
        Response.question_id == Question.id
    ).all()
    
    return render_template('interviews/start.html', session=session, current_question=unanswered, answered=answered)


@interviews_bp.route('/interviews/<int:session_id>/submit/<int:question_id>', methods=['POST'])
@login_required
def submit_response(session_id, question_id):
    session = InterviewSession.query.get_or_404(session_id)
    question = Question.query.get_or_404(question_id)
    
    if session.user_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    response_text = request.form.get('response_text', '')
    response_time = request.form.get('response_time_ms', 0) or 0

    response = Response(
        question_id=question.id,
        response_text=response_text,
        word_count=len(response_text.split()),
        response_time_ms=int(response_time) if str(response_time).isdigit() else 0
    )
    db.session.add(response)
    db.session.commit()
    
    next_question = Question.query.filter_by(
        session_id=session_id
    ).filter(
        ~Question.responses.any()
    ).order_by(Question.sequence_number).first()
    
    if next_question:
        return jsonify({
            'success': True,
            'next_question': {
                'id': next_question.id,
                'text': next_question.question_text,
                'type': next_question.question_type,
                'sequence': next_question.sequence_number
            }
        })
    else:
        return jsonify({
            'success': True,
            'complete': True,
            'redirect_url': url_for('interviews.complete', session_id=session_id)
        })


@interviews_bp.route('/interviews/<int:session_id>/complete')
@login_required
def complete(session_id):
    session = InterviewSession.query.get_or_404(session_id)
    
    if session.user_id != current_user.id:
        flash('Access denied', 'error')
        return redirect(url_for('dashboard.index'))
    
    questions = Question.query.filter_by(session_id=session_id).order_by(Question.sequence_number).all()
    has_unanswered = any(q.responses.count() == 0 for q in questions)
    
    if has_unanswered:
        flash('Please answer all questions before completing', 'warning')
        return redirect(url_for('interviews.start', session_id=session_id))
    
    session.status = 'COMPLETED'
    session.completed_at = datetime.utcnow()
    db.session.commit()
    
    return render_template('interviews/complete.html', session=session)


@interviews_bp.route('/interviews/<int:session_id>/generate-feedback', methods=['POST'])
@login_required
def generate_session_feedback(session_id):
    session = InterviewSession.query.get_or_404(session_id)
    
    if session.user_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    existing_feedback = Feedback.query.filter_by(session_id=session_id).first()
    if existing_feedback:
        return redirect(url_for('interviews.feedback', session_id=session_id))
    
    qa_pairs = []
    for question in session.questions.order_by(Question.sequence_number).all():
        response = question.responses.first()
        if response:
            qa_pairs.append({
                'question': question.question_text,
                'answer': response.response_text
            })
    
    feedback_data = generate_feedback(qa_pairs, session.interview_type)
    
    feedback = Feedback(
        session_id=session.id,
        overall_score=feedback_data.get('overallScore', 0),
        clarity_score=feedback_data.get('dimensionScores', {}).get('clarity', 0),
        relevance_score=feedback_data.get('dimensionScores', {}).get('relevance', 0),
        depth_score=feedback_data.get('dimensionScores', {}).get('depth', 0),
        impact_score=feedback_data.get('dimensionScores', {}).get('impact', 0),
        strengths=' | '.join(feedback_data.get('strengths', [])),
        weaknesses=' | '.join(feedback_data.get('weaknesses', [])),
        summary=feedback_data.get('summary', ''),
        improvement_tips=' | '.join(feedback_data.get('improvementTips', [])),
        raw_ai_output=str(feedback_data)
    )
    db.session.add(feedback)
    session.overall_score = feedback_data.get('overallScore', 0)
    db.session.commit()
    
    return redirect(url_for('interviews.feedback', session_id=session_id))


@interviews_bp.route('/interviews/<int:session_id>/feedback')
@login_required
def feedback(session_id):
    session = InterviewSession.query.get_or_404(session_id)
    
    if session.user_id != current_user.id:
        flash('Access denied', 'error')
        return redirect(url_for('dashboard.index'))
    
    feedback_record = Feedback.query.filter_by(session_id=session_id).first()
    
    if not feedback_record:
        flash('Feedback not yet generated', 'info')
        return redirect(url_for('interviews.complete', session_id=session_id))
    
    return render_template('interviews/feedback.html', session=session, feedback=feedback_record)
