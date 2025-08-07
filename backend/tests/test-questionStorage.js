const questionStorage = require('../utils/questionStorage');

async function testQuestionStorage() {
  console.log('Testing Question Storage System...\n');
  
  const testTopic = 'Test Animals';
  const testQuestions = [
    {
      question: "What sound does a cat make?",
      choices: ["Meow", "Bark", "Moo", "Roar"],
      correctAnswer: "Meow"
    },
    {
      question: "How many legs does a spider have?",
      choices: ["6", "8", "10", "12"],
      correctAnswer: "8"
    },
    {
      question: "What is the largest mammal?",
      choices: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
      correctAnswer: "Blue Whale"
    }
  ];

  try {
    console.log('1. Testing question storage...');
    const stored = await questionStorage.storeQuestions(testTopic, testQuestions, 'easy');
    console.log('Successfully stored questions');
    console.log('Stored questions:', stored.length);

    console.log('\n2. Testing cache check...');
    const hasQuestions = await questionStorage.hasQuestionsForTopic(testTopic);
    console.log('Cache check result:', hasQuestions);

    console.log('\n3. Testing question retrieval...');
    const retrieved = await questionStorage.getQuestionsForTopic(testTopic, 2);
    console.log('Retrieved questions:', retrieved.length);
    console.log('Questions:', retrieved.map(q => q.question));

    console.log('\n4. Testing random selection...');
    const random = await questionStorage.getRandomQuestions(testTopic, 2);
    console.log('Random questions:', random.length);

    console.log('\n5. Testing topic statistics...');
    const stats = await questionStorage.getTopicStats(testTopic);
    console.log('Topic stats:', stats);

    console.log('\nAll storage tests passed!');
  } catch (error) {
    console.error('Storage test failed:', error);
  }
}

async function testQuestionGeneration() {
  console.log('\nTesting Question Generation with Caching...\n');
  
  const { generateTriviaQuestions } = require('../utils/questionGenerator');
  
  try {
    console.log('1. Testing first generation (should create new)...');
    const questions1 = await generateTriviaQuestions('Ancient Rome', 'medium');
    console.log('Generated questions:', questions1.length);

    console.log('\n2. Testing second generation (should use cache)...');
    const questions2 = await generateTriviaQuestions('Ancient Rome', 'medium');
    console.log('Retrieved questions:', questions2.length);

    console.log('\n3. Testing forced generation...');
    const questions3 = await generateTriviaQuestions('Ancient Rome', 'medium', true);
    console.log('Force generated questions:', questions3.length);

    console.log('\nAll generation tests passed!');
  } catch (error) {
    console.error('Generation test failed:', error);
  }
}

async function testRandomSelection() {
  console.log('\nTesting Random Selection Algorithm...\n');
  
  try {
    console.log('1. Testing selection preferences (less-used first)...');
    const topic = 'Math Basics';
    
    // Get questions multiple times to test usage tracking
    for (let i = 1; i <= 3; i++) {
      console.log(`\nRound ${i}:`);
      const questions = await questionStorage.getRandomQuestions(topic, 2);
      if (questions.length > 0) {
        console.log(`  Selected questions: ${questions.map(q => `"${q.question}" (used: ${q.usageCount || 0})`).join(', ')}`);
      } else {
        console.log('  No questions available for this topic');
        break;
      }
    }

    console.log('\nRandom selection test completed!');
  } catch (error) {
    console.error('Random selection test failed:', error);
  }
}

async function runAllTests() {
  await testQuestionStorage();
  await testQuestionGeneration();
  await testRandomSelection();
  console.log('\n🎉 All tests completed!');
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testQuestionStorage, testQuestionGeneration, testRandomSelection, runAllTests };