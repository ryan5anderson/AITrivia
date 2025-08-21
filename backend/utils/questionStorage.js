const fs = require('fs').promises;
const path = require('path');
let pool = null;
try {
  // Prefer shared db module which reads DATABASE_URL from env
  pool = require('../db');
} catch (_) {
  pool = null;
}

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
    async storeQuestions(topic, questions, difficulty = 'medium', userId) {
        const timestamp = new Date().toISOString();
        const topicNormalized = topic.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        try {
            let ids = [];
            if (pool) {
                try {
                    console.log(`DB: inserting ${questions.length} questions for topic "${topic}" (difficulty=${difficulty})`);
                    const dbPromises = questions.map(q => 
                        pool.query(
                            `INSERT INTO questions (topic, question_text, choices, correct_answer, difficulty, created_by) 
                             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                            [topic, q.question, JSON.stringify(q.choices), q.correctAnswer, difficulty, userId] // Pass userId here
                        )
                    );
                    const dbResults = await Promise.all(dbPromises);
                    ids = dbResults.map(r => r.rows[0].id);
                    console.log(`DB: successfully inserted ${ids.length} questions for topic "${topic}"`);
                } catch (dbErr) {
                    console.warn('DB unavailable when storing questions; falling back to file-only storage.', dbErr.message);
                }
            } else {
                console.warn('DB pool not available; storing questions to file only.');
            }

            // Store in JSON file (always)
            const questionsWithMetadata = questions.map((q, index) => ({
                id: ids[index] ?? `${Date.now()}_${index}`,
                topic,
                question: q.question,
                choices: q.choices,
                correctAnswer: q.correctAnswer,
                difficulty,
                createdAt: timestamp,
                usageCount: 0,
                lastUsed: null,
                createdBy: 'local' // or 'supabase' based on the source
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
        // Try DB first
        if (pool) {
            try {
                const result = await pool.query(
                    'SELECT COUNT(*) FROM questions WHERE LOWER(topic) = LOWER($1)',
                    [topic]
                );
                const count = parseInt(result.rows[0].count);
                if (count >= minQuestions) return true;
            } catch (error) {
                console.warn('DB unavailable when checking topic; falling back to file cache.', error.message);
            }
        }

        // Fallback to file cache
        try {
            const files = await fs.readdir(this.questionsDir);
            let total = 0;
            for (const file of files) {
                if (!file.endsWith('.json')) continue;
                const content = JSON.parse(await fs.readFile(path.join(this.questionsDir, file), 'utf-8'));
                if (content.topic && content.topic.toLowerCase() === topic.toLowerCase()) {
                    total += Array.isArray(content.questions) ? content.questions.length : 0;
                    if (total >= minQuestions) return true;
                }
            }
        } catch (e) {
            // ignore
        }
        return false;
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
        // Try DB first
        if (pool) {
            try {
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
                // Mark as used (best-effort)
                try { await this.markQuestionsAsUsed(questions.map(q => q.id)); } catch (_) {}
                return questions;
            } catch (error) {
                console.warn('DB unavailable when fetching random questions; falling back to file cache.', error.message);
            }
        }

        // Fallback: read from file cache (most recent first)
        try {
            const files = await fs.readdir(this.questionsDir);
            // Sort by modified time desc
            const filesWithStats = await Promise.all(
                files.filter(f => f.endsWith('.json')).map(async f => ({
                    file: f,
                    stat: await fs.stat(path.join(this.questionsDir, f))
                }))
            );
            filesWithStats.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

            const picked = [];
            for (const { file } of filesWithStats) {
                const content = JSON.parse(await fs.readFile(path.join(this.questionsDir, file), 'utf-8'));
                if (content.topic && content.topic.toLowerCase() === topic.toLowerCase() && Array.isArray(content.questions)) {
                    for (const q of content.questions) {
                        picked.push({
                            id: q.id,
                            question: q.question,
                            choices: q.choices,
                            correctAnswer: q.correctAnswer,
                            difficulty: q.difficulty ?? 'medium',
                            createdBy: 'local' // or 'supabase' based on the source
                        });
                        if (picked.length >= count) return picked;
                    }
                }
            }
            return picked;
        } catch (e) {
            console.error('File cache unavailable for random questions:', e);
            throw e;
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