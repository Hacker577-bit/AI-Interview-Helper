# Flask AI Interview Prep

A Flask-based AI interview preparation application using SQLite and OpenAI.

## Features

- User authentication (signup/login)
- Create custom AI-generated interview sessions
- Multiple interview types: Behavioral, Technical, Case Study, Mixed
- Difficulty levels: Entry, Mid, Senior, Staff
- Real-time AI feedback with scoring
- Interview history tracking
- Clean, responsive Bootstrap UI

## Tech Stack

- **Backend**: Flask 3.0
- **Database**: SQLite with Flask-SQLAlchemy
- **AI**: OpenAI GPT-4o-mini API
- **Auth**: Flask-Login with bcrypt password hashing
- **Forms**: Flask-WTF

## Quick Start

### 1. Setup Environment

```bash
cd flask-interview-ai

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

Edit `.env` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_secret_key
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### 3. Initialize Database

```bash
flask db upgrade  # Or create manually
python -c "from run import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

### 4. Run Application

```bash
flask run
```

Visit: http://localhost:5000

## Project Structure

```
flask-interview-ai/
├── app/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User model
│   │   └── interview.py     # InterviewSession, Question, Response, Feedback models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py          # Login/register routes
│   │   ├── dashboard.py     # Dashboard routes
│   │   ├── interviews.py    # Interview management routes
│   │   ├── api.py           # API endpoints
│   │   └── forms.py         # WTForms classes
│   ├── services/
│   │   └── openai_service.py    # OpenAI integration
│   ├── templates/
│   │   ├── base.html
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   └── register.html
│   │   ├── dashboard/
│   │   │   ├── index.html
│   │   │   ├── history.html
│   │   │   └── settings.html
│   │   └── interviews/
│   │       ├── create.html
│   │       ├── start.html
│   │       ├── complete.html
│   │       └── feedback.html
│   └── static/
├── migrations/
├── run.py
├── requirements.txt
└── .env
```

## Database Schema

### Users
- id, email (unique), password_hash, name
- avatar_url, target_role, experience_level
- plan_tier (FREE/PRO), created_at, updated_at

### InterviewSessions
- id, user_id (FK), interview_type, difficulty, mode
- status, job_description, started_at, completed_at
- overall_score, created_at

### Questions
- id, session_id (FK), sequence_number
- question_text, question_type, category, created_at

### Responses
- id, question_id (FK), response_text
- word_count, response_time_ms, created_at

### Feedback
- id, session_id (unique FK)
- overall_score, clarity_score, relevance_score, depth_score, impact_score
- strengths (text), weaknesses (text), summary (text)
- improvement_tips (text), raw_ai_output, generated_at

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | User login |
| POST | /auth/register | User registration |
| POST | /auth/logout | User logout |
| GET | /dashboard | Dashboard overview |
| GET | /dashboard/history | Interview history |
| POST | /interviews/new | Create interview session |
| GET | /interviews/<id> | Start interview |
| POST | /interviews/<id>/submit/<question_id> | Submit answer |
| GET | /interviews/<id>/complete | Complete interview |
| POST | /interviews/<id>/generate-feedback | Generate AI feedback |
| GET | /interviews/<id>/feedback | View feedback |

## AI Integration

The application uses OpenAI's GPT-4o-mini model for:
1. **Question Generation**: Context-aware interview questions based on type, difficulty, and job description
2. **Feedback Generation**: Detailed scoring and improvement suggestions based on user responses

### Fallback Mode
If OpenAI API key is not configured, the system falls back to predefined question banks and sample feedback.

## Development

### Run Migrations
```bash
flask db migrate -m "Initial migration"
flask db upgrade
```

### Test Locally
```bash
export FLASK_ENV=development
flask run --debug
```

## Production Deployment

### Using Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Environment Variables for Production
```bash
FLASK_ENV=production
SECRET_KEY=<strong-random-key>
DATABASE_URL=sqlite:///production.db
OPENAI_API_KEY=<your-key>
```

## License

MIT License
