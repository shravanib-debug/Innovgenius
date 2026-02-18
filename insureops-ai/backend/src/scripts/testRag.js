const ragService = require('../services/ragService');

async function test() {
    console.log('Initializing RAG Service...');
    await ragService.initialize();

    console.log('\n--- Test 1: Query for "cyber liability" ---');
    const result1 = await ragService.query("What does the cyber liability coverage include?");
    console.log('Result:', result1.substring(0, 500) + '...');

    console.log('\n--- Test 2: Query for "deductible" ---');
    const result2 = await ragService.query("What is the deductible for property damage?");
    console.log('Result:', result2.substring(0, 500) + '...');
}

test().catch(console.error);
