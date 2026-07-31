from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SelectField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo, Optional


class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Sign In')


class RegistrationForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(min=2, max=100)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Create Account')


class InterviewForm(FlaskForm):
    interview_type = SelectField('Interview Type', choices=[
        ('MIXED', 'Mixed (Behavioral + Technical)'),
        ('BEHAVIORAL', 'Behavioral Only'),
        ('TECHNICAL', 'Technical Only'),
        ('CASE_STUDY', 'Case Study')
    ], validators=[DataRequired()])
    
    difficulty = SelectField('Difficulty Level', choices=[
        ('ENTRY', 'Entry Level'),
        ('MID', 'Mid Level'),
        ('SENIOR', 'Senior Level'),
        ('STAFF', 'Staff/Principal')
    ], validators=[DataRequired()])
    
    question_count = SelectField('Number of Questions', choices=[
        ('5', '5 Questions (Quick)'),
        ('10', '10 Questions (Standard)'),
        ('15', '15 Questions (Comprehensive)'),
        ('20', '20 Questions (Full)')
    ], validators=[DataRequired()])
    
    mode = SelectField('Mode', choices=[
        ('TEXT', 'Text Mode')
    ], validators=[DataRequired()])
    
    job_description = TextAreaField('Job Description (Optional)', validators=[Optional()])
    
    submit = SubmitField('Start Interview')
