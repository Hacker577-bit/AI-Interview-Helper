from openai import OpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = None


def get_openai_client():
    global client
    if client is None:
        api_key = os.getenv('OPENAI_API_KEY')
        if api_key:
            client = OpenAI(api_key=api_key)
        else:
            client = None
    return client


def generate_interview_questions(interview_type, difficulty, count, job_description=None):
    """Generate interview questions using OpenAI"""
    
    difficulty_map = {
        'ENTRY': 'entry-level',
        'MID': 'mid-level',
        'SENIOR': 'senior-level',
        'STAFF': 'staff/principal-level'
    }
    
    type_map = {
        'BEHAVIORAL': 'behavioral questions about past experiences',
        'TECHNICAL': 'technical questions about system design and problem-solving',
        'CASE_STUDY': 'case study questions with business scenarios',
        'MIXED': 'a balanced mix of behavioral and technical questions'
    }
    
    prompt = f"""You are an expert technical interviewer. Generate {count} interview questions for a {difficulty_map.get(difficulty, 'mid-level')} candidate.
    
Interview Type: {type_map.get(interview_type, 'general questions')}
{f'Job Context: {job_description}' if job_description else ''}

Return ONLY a valid JSON array in this exact format:
[
    {{
        "question": "question text here",
        "type": "TECHNICAL|BEHAVIORAL|CASE_STUDY",
        "category": "Category name"
    }}
]

Ensure questions are appropriate for the difficulty level and require thoughtful answers."""

    try:
        client = get_openai_client()
        if not client:
            raise ValueError('OPENAI_API_KEY not configured')
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert technical interviewer. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        
        data = json.loads(content)
        questions = data if isinstance(data, list) else data.get('questions', [])
        
        return questions[:count]
    except Exception as e:
        print(f"Error generating questions: {e}")
        return generate_fallback_questions(interview_type, difficulty, count)


def generate_feedback(qa_pairs, interview_type):
    """Generate interview feedback using OpenAI"""
    
    qa_text = "\n\n".join([
        f"Q{idx+1}: {qa['question']}\nA{idx+1}: {qa['answer']}"
        for idx, qa in enumerate(qa_pairs)
    ])
    
    prompt = f"""You are an expert interview coach. Analyze this {interview_type} interview and provide detailed feedback.

{qa_text}

Score each dimension from 1-10:
- clarity: How clear and well-structured are the answers?
- relevance: Do answers directly address the questions?
- depth: Are specific examples and details provided?
- impact: Do answers demonstrate results and outcomes?

Return ONLY valid JSON in this exact format:
{{
    "overallScore": 7.5,
    "dimensionScores": {{
        "clarity": 8,
        "relevance": 9,
        "depth": 7,
        "impact": 8
    }},
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "summary": "Overall assessment paragraph",
    "improvementTips": ["tip 1", "tip 2"]
}}"""

    try:
        client = get_openai_client()
        if not client:
            raise ValueError('OPENAI_API_KEY not configured')
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert interview coach. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Error generating feedback: {e}")
        return generate_fallback_feedback()


def generate_fallback_questions(interview_type, difficulty, count):
    """Fallback question generator when AI is unavailable"""
    fallback_questions = {
        'BEHAVIORAL': [
            "Tell me about a time you faced a difficult challenge at work.",
            "Describe a situation where you had to work with a difficult team member.",
            "How do you handle conflicting priorities?",
            "Tell me about a time you made a mistake and how you handled it.",
            "Describe a project where you showed leadership."
        ],
        'TECHNICAL': [
            "Explain the difference between SQL and NoSQL databases.",
            "How would you design a URL shortening service?",
            "What is the CAP theorem?",
            "Explain microservices architecture.",
            "How do you optimize slow database queries?"
        ],
        'MIXED': [
            "Tell me about yourself.",
            "What's your greatest strength?",
            "Explain RESTful API design.",
            "Describe a challenging project you worked on.",
            "How do you handle stress and pressure?"
        ]
    }
    
    questions = fallback_questions.get(interview_type, fallback_questions['MIXED'])
    return [
        {"question": q, "type": interview_type, "category": "General"}
        for q in questions[:count]
    ]


def generate_fallback_feedback():
    """Fallback feedback when AI is unavailable"""
    return {
        "overallScore": 6.5,
        "dimensionScores": {
            "clarity": 7,
            "relevance": 7,
            "depth": 6,
            "impact": 6
        },
        "strengths": ["Good communication", "Relevant examples"],
        "weaknesses": ["Could add more metrics", "Some answers lacked depth"],
        "summary": "Solid performance with room for improvement. Focus on adding quantifiable results.",
        "improvementTips": ["Add specific metrics to your answers", "Use the STAR method consistently"]
    }
