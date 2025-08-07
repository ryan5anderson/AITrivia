const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const env = require('../env.json');

const pool = new Pool(env);

class QuestionStorage {
    constructor() {
        this.questionsDir = path.join(__dirname, '../data/questions');
        this.ensureDirectoryExists();
    }

    async ensureDirectoryExists() {
        try {
            await fs.mkdir(this.questionsDir, { recursive: true });
        } catch (error) {
            console.error('Error creating questions directory:', error);
        }
    }

    // Store questions in both database and JSON file
    async storeQuestions(topic, questions, difficulty = 'medium') {
        const timestamp = new Date().toISOString();
        const topicNormalized = topic.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        try {
            // Store in database
            const dbPromises = questions.map(q => 
                pool.query(
                    `INSERT INTO questions (topic, question_text, choices, correct_answer, difficulty) 
                     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                    [topic, q.question, JSON.stringify(q.choices), q.correctAnswer, difficulty]
                )
            );
            
            const dbResults = await Promise.all(dbPromises);
            
            // Store in JSON file
            const questionsWithMetadata = questions.map((q, index) => ({
                id: dbResults[index].rows[0].id,
                topic,
                question: q.question,
                choices: q.choices,
                correctAnswer: q.correctAnswer,
                difficulty,
                createdAt: timestamp,
                usageCount: 0,
                lastUsed: null
            }));
            
            const filename = `${topicNormalized}_${Date.now()}.json`;
            const filepath = path.join(this.questionsDir, filename);
            
            await fs.writeFile(filepath, JSON.stringify({
                topic,
                difficulty,
                createdAt: timestamp,
                questions: questionsWithMetadata
            }, null, 2));
            
            console.log(`Stored ${questions.length} questions for topic "${topic}" in database and file: ${filename}`);
            return questionsWithMetadata;
            
        } catch (error) {
            console.error('Error storing questions:', error);
            throw error;
        }
    }

    // Check if questions exist for a topic (caching check)
    async hasQuestionsForTopic(topic, minQuestions = 5) {
        try {
            const result = await pool.query(
                'SELECT COUNT(*) FROM questions WHERE LOWER(topic) = LOWER($1)',
                [topic]
            );
            const count = parseInt(result.rows[0].count);
            return count >= minQuestions;
        } catch (error) {
            console.error('Error checking questions for topic:', error);
            return false;
        }
    }

    // Get cached questions for a topic
    async getQuestionsForTopic(topic, limit = 5) {
        try {
            const result = await pool.query(
                `SELECT id, question_text, choices, correct_answer, difficulty, usage_count 
                 FROM questions 
                 WHERE LOWER(topic) = LOWER($1) 
                 ORDER BY usage_count ASC, RANDOM() 
                 LIMIT $2`,
                [topic, limit]
            );
            
            return result.rows.map(row => ({
                id: row.id,
                question: row.question_text,
                choices: row.choices,
                correctAnswer: row.correct_answer,
                difficulty: row.difficulty,
                usageCount: row.usage_count
            }));
        } catch (error) {
            console.error('Error getting questions for topic:', error);
            throw error;
        }
    }

    // Mark questions as used (for usage tracking)
    async markQuestionsAsUsed(questionIds) {
        try {
            await pool.query(
                `UPDATE questions 
                 SET usage_count = usage_count + 1, last_used = CURRENT_TIMESTAMP 
                 WHERE id = ANY($1)`,
                [questionIds]
            );
        } catch (error) {
            console.error('Error marking questions as used:', error);
        }
    }

    // Random question selection algorithm
    async getRandomQuestions(topic, count = 5) {
        try {
            // Prefer less-used questions for better variety
            const result = await pool.query(
                `SELECT id, question_text, choices, correct_answer, difficulty, usage_count 
                 FROM questions 
                 WHERE LOWER(topic) = LOWER($1) 
                 ORDER BY 
                    CASE WHEN usage_count = 0 THEN 0 ELSE 1 END,
                    usage_count ASC,
                    RANDOM() 
                 LIMIT $2`,
                [topic, count]
            );
            
            const questions = result.rows.map(row => ({
                id: row.id,
                question: row.question_text,
                choices: row.choices,
                correctAnswer: row.correct_answer,
                difficulty: row.difficulty
            }));
            
            // Mark as used
            const questionIds = questions.map(q => q.id);
            await this.markQuestionsAsUsed(questionIds);
            
            return questions;
        } catch (error) {
            console.error('Error getting random questions:', error);
            throw error;
        }
    }

    // Get question statistics
    async getTopicStats(topic) {
        try {
            const result = await pool.query(
                `SELECT 
                    COUNT(*) as total_questions,
                    AVG(usage_count) as avg_usage,
                    MAX(usage_count) as max_usage,
                    MIN(created_at) as first_created,
                    MAX(created_at) as last_created
                 FROM questions 
                 WHERE LOWER(topic) = LOWER($1)`,
                [topic]
            );
            
            return result.rows[0];
        } catch (error) {
            console.error('Error getting topic stats:', error);
            return null;
        }
    }
}

module.exports = new QuestionStorage();