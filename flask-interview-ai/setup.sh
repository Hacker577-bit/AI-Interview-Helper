#!/bin/bash

echo "=== AI Interview Prep - Flask Setup ==="
echo ""

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create database
echo "Initializing database..."
python -c "from run import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Edit .env and add your OPENAI_API_KEY"
echo "2. Run: source venv/bin/activate"
echo "3. Run: flask run"
echo "4. Open: http://localhost:5000"
echo ""
