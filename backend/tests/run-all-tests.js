// Master test runner for all test suites
const { runAllTests } = require('./test-questionStorage');
const { runDataTests } = require('./test-dataStorage');

async function runCompleteTestSuite() {
  console.log('Starting Complete Test Suite for AI Trivia Backend\n');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Question Storage and Generation
    console.log('\nPHASE 1: Question Storage & Generation Tests');
    console.log('-'.repeat(50));
    await runAllTests();

    // Test 2: Data Storage (Files & Database)
    console.log('\nPHASE 2: Data Storage Tests');
    console.log('-'.repeat(50));
    await runDataTests();

    // Test 3: API Endpoints (manual testing)
    console.log('\nPHASE 3: API Endpoint Testing');
    console.log('-'.repeat(50));
    console.log('New endpoints are available for manual testing:');
    console.log('  • POST /api/generate-questions (enhanced with caching)');
    console.log('  • POST /api/fetch-questions (cached questions only)');
    console.log('  • GET  /api/topic-stats/:topic (topic statistics)');
    console.log('\nTo test endpoints:');
    console.log('  1. Start server: npm run start');
    console.log('  2. Test with curl, Postman, or your frontend');

    console.log('\n' + '='.repeat(60));
    console.log('COMPLETE TEST SUITE FINISHED!');
    console.log('All available tests have been executed');
    
  } catch (error) {
    console.error('\nTest suite failed:', error);
    process.exit(1);
  }
}

// Summary of what we've implemented
function showImplementationSummary() {
  console.log('\nIMPLEMENTATION SUMMARY:');
  console.log('=' .repeat(60));
  console.log('Question JSON File Storage - questions stored in /data/questions/');
  console.log('Question Metadata - difficulty, timestamps, usage tracking');
  console.log('Question Caching - checks DB before generating new questions');
  console.log('Fetch Questions Endpoint - POST /api/fetch-questions');
  console.log('Random Question Selection - prioritizes less-used questions');
  console.log('Test Suite - comprehensive testing for all components');
  console.log('\nNEW ENDPOINTS:');
  console.log('  • POST /api/generate-questions (enhanced with caching)');
  console.log('  • POST /api/fetch-questions (cached questions only)');
  console.log('  • GET  /api/topic-stats/:topic (topic statistics)');
  console.log('\nDATABASE SCHEMA:');
  console.log('  • questions table with metadata fields');
  console.log('  • indexes for performance');
  console.log('  • usage tracking and timestamps');
  console.log('\nTESTS AVAILABLE:');
  console.log('  • node tests/test-questionStorage.js');
  console.log('  • node tests/test-dataStorage.js');
  console.log('  • node tests/run-all-tests.js (this file)');
}

if (require.main === module) {
  runCompleteTestSuite()
    .then(() => {
      showImplementationSummary();
    })
    .catch(console.error);
}

module.exports = { runCompleteTestSuite, showImplementationSummary };