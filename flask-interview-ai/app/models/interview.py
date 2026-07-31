from app import db
from datetime import datetime


class InterviewSession(db.Model):
    __tablename__ = 'interview_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    interview_type = db.Column(db.String(50), default='MIXED')
    difficulty = db.Column(db.String(20), default='MID')
    mode = db.Column(db.String(20), default='TEXT')
    status = db.Column(db.String(20), default='IN_PROGRESS')
    job_description = db.Column(db.Text, nullable=True)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    overall_score = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    questions = db.relationship('Question', backref='session', lazy='dynamic', cascade='all, delete-orphan', order_by='Question.sequence_number')
    feedback = db.relationship('Feedback', backref='session', uselist=False, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<InterviewSession {self.id}>'


class Question(db.Model):
    __tablename__ = 'questions'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('interview_sessions.id'), nullable=False)
    sequence_number = db.Column(db.Integer, nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(50), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    responses = db.relationship('Response', backref='question', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Question {self.id}>'


class Response(db.Model):
    __tablename__ = 'responses'
    
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    response_text = db.Column(db.Text, nullable=False)
    word_count = db.Column(db.Integer, nullable=True)
    response_time_ms = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Response {self.id}>'


class Feedback(db.Model):
    __tablename__ = 'feedbacks'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('interview_sessions.id'), unique=True, nullable=False)
    overall_score = db.Column(db.Float, nullable=True)
    clarity_score = db.Column(db.Float, nullable=True)
    relevance_score = db.Column(db.Float, nullable=True)
    depth_score = db.Column(db.Float, nullable=True)
    impact_score = db.Column(db.Float, nullable=True)
    strengths = db.Column(db.Text, nullable=True)
    weaknesses = db.Column(db.Text, nullable=True)
    summary = db.Column(db.Text, nullable=True)
    improvement_tips = db.Column(db.Text, nullable=True)
    raw_ai_output = db.Column(db.Text, nullable=True)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Feedback {self.id}>'
