import { GoogleGenerativeAI } from '@google/generative-ai';

export async function testGeminiModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    return { error: 'No GOOGLE_API_KEY found' };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // List of models to test
  const modelsToTest = [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
  ];

  const results: any = {};

  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "hello" in one word');
      const text = result.response.text();
      results[modelName] = { status: 'success', response: text };
    } catch (error: any) {
      results[modelName] = { status: 'failed', error: error.message };
    }
  }

  return results;
}

