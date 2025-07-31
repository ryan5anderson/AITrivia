const { generateTriviaQuestion } = require('../utils/questionGenerator');

async function testQuestionGenerator() {
  console.log('Testing Question Generator...\n');
  
  const testTopics = [
    'cats',
    'famous basketball players',
    'world foods',
    'movies',
    'flowers'
  ];
  
  for (const topic of testTopics) {
    console.log(`Testing topic: "${topic}"`);
    
    try {
      console.log(`\nGenerating question...`);
      const question = await generateTriviaQuestion(topic);
      console.log(`Generated question:\n${question}\n`);
      
      // delay for rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error generating question for "${topic}":`, error.message);
    }
    
    console.log('─'.repeat(50));
  }
  
  console.log('\nTesting dine');
}

// Run the test
testQuestionGenerator().catch(console.error); 