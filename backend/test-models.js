const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI('AIzaSyD3FQK7joArDRwWsbTwl9QF6tAM6GWR8L0');
    
    console.log('Testing different model names...');
    
    const models = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      'gemini-pro-vision'
    ];
    
    for (const modelName of models) {
      try {
        console.log(`\nTesting model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Try a simple text generation
        const result = await model.generateContent("Hello");
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}...`);
        break; // Stop at first working model
        
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message.split('\n')[0]}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();

