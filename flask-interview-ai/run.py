from flask import Flask
from app import db, login_manager, migrate, csrf
from dotenv import load_dotenv
import os

load_dotenv()


def get_database_config():
    """Return (database_uri, turso_url, turso_token).
    
    Priority:
    1. TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN) -> serverless SQLite via Turso
    2. DATABASE_URL -> whatever is provided
    3. Fallback -> local SQLite file
    """
    turso_url = os.getenv('TURSO_DATABASE_URL')
    turso_token = os.getenv('TURSO_AUTH_TOKEN')
    
    if turso_url:
        host = turso_url.replace('libsql://', '').replace('http://', '').replace('https://', '')
        return f'sqlite+libsql://{host}?secure=1', turso_url, turso_token
    
    return os.getenv('DATABASE_URL', 'sqlite:///interview_ai.db'), None, None


def create_app():
    app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
    
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    
    database_uri, turso_url, turso_token = get_database_config()
    app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
    
    if turso_url:
        # The sqlalchemy-libsql driver (0.2.0) does not pass auth_token to
        # libsql.connect, so we provide a custom engine creator.
        import libsql_experimental as libsql
        
        def libsql_creator():
            return libsql.connect(turso_url, auth_token=turso_token or '')
        
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
            'creator': libsql_creator,
            'connect_args': {'check_same_thread': False},
        }
    
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    
    from app.models.user import User
    from app.models.interview import InterviewSession, Question, Response, Feedback
    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.interviews import interviews_bp
    from app.routes.api import api_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(interviews_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    @app.route('/')
    def index():
        from flask import redirect, url_for
        return redirect(url_for('auth.login'))
    
    @app.route('/health')
    def health():
        try:
            from sqlalchemy import text
            db.session.execute(text('SELECT 1'))
            return {'status': 'healthy', 'database': 'connected'}
        except Exception as e:
            return {'status': 'degraded', 'database': str(e)[:200]}, 500
    
    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
