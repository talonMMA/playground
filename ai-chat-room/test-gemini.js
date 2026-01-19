const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
    const key = process.env.GOOGLE_API_KEY;
    console.log('Key length:', key ? key.length : 'Missing');
    if (!key) {
        console.error('Error: GOOGLE_API_KEY is missing');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        // List models
        // Note: SDK doesn't expose listModels directly on genAI instance usually, 
        // need to use the model manager if available, or just try to just use the one we have.
        // Actually, let's just use the API, but the SDK hides the HTTP calls.

        // Let's try 1.5-flash again but check the error detail.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('Sending message to gemini-1.5-flash...');
        const result = await model.generateContent("Test");
        console.log('Success:', result.response.text());

    } catch (error) {
        console.error('Gemini Error:', error.message);
        if (error.response) {
            console.error('Error Response:', JSON.stringify(error.response, null, 2));
        }
    }
}

testGemini();
