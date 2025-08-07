DROP DATABASE IF EXISTS trivia_db;
CREATE DATABASE trivia_db;
\c trivia_db
DROP TABLE IF EXISTS users;
CREATE TABLE users(
	id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(100)
);

-- Questions table for caching and metadata
DROP TABLE IF EXISTS questions;
CREATE TABLE questions(
    id SERIAL PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    question_text TEXT NOT NULL,
    choices JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP
);

-- Index for faster topic lookups
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_created_at ON questions(created_at); 