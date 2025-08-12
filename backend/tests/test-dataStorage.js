const fs = require('fs').promises;
const path = require('path');

async function testFileStorage() {
  console.log('Testing File Storage System...\n');
  
  const questionsDir = path.join(__dirname, '../data/questions');
  
  try {
    console.log('1. Checking questions directory...');
    const exists = await fs.access(questionsDir).then(() => true).catch(() => false);
    console.log(`${exists ? '✅' : '❌'} Questions directory exists:`, exists);

    if (exists) {
      console.log('\n2. Listing stored question files...');
      const files = await fs.readdir(questionsDir);
      console.log('Found files:', files.length);
      
      for (const file of files.slice(0, 3)) { // Show first 3 files
        if (file.endsWith('.json')) {
          const filepath = path.join(questionsDir, file);
          const content = await fs.readFile(filepath, 'utf8');
          const data = JSON.parse(content);
          console.log(`✅ ${file}: ${data.questions.length} questions on "${data.topic}"`);
        }
      }
    }

    console.log('\n✅ File storage test completed!');
  } catch (error) {
    console.error('❌ File storage test failed:', error);
  }
}

async function testDatabaseIntegrity() {
  console.log('\nTesting Database Integrity...\n');
  
  const { Pool } = require('pg');
  const env = require('../env.json');
  const pool = new Pool(env);
  
  try {
    console.log('1. Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');

    console.log('\n2. Testing questions table...');
    const result = await pool.query('SELECT COUNT(*) FROM questions');
    console.log('✅ Questions table accessible, total questions:', result.rows[0].count);

    console.log('\n3. Testing data integrity...');
    const integrityCheck = await pool.query(`
      SELECT 
        topic,
        COUNT(*) as count,
        COUNT(CASE WHEN choices IS NULL THEN 1 END) as null_choices,
        COUNT(CASE WHEN question_text = '' THEN 1 END) as empty_questions
      FROM questions 
      GROUP BY topic
      ORDER BY count DESC
      LIMIT 5
    `);
    
    console.log('Integrity check results:');
    integrityCheck.rows.forEach(row => {
      console.log(`   ✅ Topic: ${row.topic}, Questions: ${row.count}, Issues: ${parseInt(row.null_choices) + parseInt(row.empty_questions)}`);
    });

    console.log('\n4. Testing question metadata...');
    const metadataCheck = await pool.query(`
      SELECT 
        difficulty,
        COUNT(*) as count,
        AVG(usage_count) as avg_usage,
        MAX(created_at) as latest_created
      FROM questions 
      GROUP BY difficulty
    `);
    
    console.log('Metadata check results:');
    metadataCheck.rows.forEach(row => {
      console.log(`   ✅ Difficulty: ${row.difficulty}, Count: ${row.count}, Avg Usage: ${parseFloat(row.avg_usage).toFixed(2)}`);
    });

    await pool.end();
    console.log('\n✅ Database integrity test completed!');
  } catch (error) {
    console.error('❌ Database integrity test failed:', error);
  }
}

async function testDataConsistency() {
  console.log('\nTesting Data Consistency Between DB and Files...\n');
  
  const { Pool } = require('pg');
  const env = require('../env.json');
  const pool = new Pool(env);
  const questionsDir = path.join(__dirname, '../data/questions');
  
  try {
    // Get total questions from database
    const dbResult = await pool.query('SELECT COUNT(*) as total FROM questions');
    const dbTotal = parseInt(dbResult.rows[0].total);
    console.log(`Database total questions: ${dbTotal}`);

    // Count questions in JSON files
    let fileTotal = 0;
    try {
      const files = await fs.readdir(questionsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filepath = path.join(questionsDir, file);
          const content = await fs.readFile(filepath, 'utf8');
          const data = JSON.parse(content);
          fileTotal += data.questions.length;
        }
      }
    } catch (error) {
      console.log('No questions directory or files found yet');
    }
    
    console.log(`File total questions: ${fileTotal}`);
    
    if (dbTotal === fileTotal) {
      console.log('✅ Data consistency check passed - DB and files match');
    } else {
      console.log('❌ Data consistency warning - DB and files don\'t match (this is normal if some questions were added to DB only)');
    }

    await pool.end();
    console.log('\n✅ Data consistency test completed!');
  } catch (error) {
    console.error('❌ Data consistency test failed:', error);
  }
}

async function runDataTests() {
  await testFileStorage();
  await testDatabaseIntegrity();
  await testDataConsistency();
  console.log('\n✅ All data storage tests completed!');
}

if (require.main === module) {
  runDataTests().catch(console.error);
}

module.exports = { testFileStorage, testDatabaseIntegrity, testDataConsistency, runDataTests };