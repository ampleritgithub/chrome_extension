import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  // Set CORS headers for actual request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  if (!configuration.apiKey) {
    return res.status(500).json({
      error: 'OpenAI API key not configured'
    });
  }

  const { action, content, vectorData, query } = req.body;

  if (!action) {
    return res.status(400).json({
      error: 'Missing required parameter: action'
    });
  }

  try {
    let response;

    switch (action) {
      case 'process':
        if (!content) {
          return res.status(400).json({
            error: 'Missing required parameter: content'
          });
        }
        response = await openai.createCompletion({
          model: "text-davinci-002",
          prompt: `Process and summarize the following content for future querying:\n\n${content}`,
          max_tokens: 500,
          temperature: 0.7,
        });
        return res.status(200).json({ 
          vectorData: response.data.choices[0].text.trim() 
        });

      case 'query':
        if (!vectorData || !query) {
          return res.status(400).json({
            error: 'Missing required parameters: vectorData and/or query'
          });
        }
        response = await openai.createCompletion({
          model: "text-davinci-002",
          prompt: `Based on the following processed content:\n\n${vectorData}\n\nAnswer the following question:\n${query}`,
          max_tokens: 150,
          temperature: 0.7,
        });
        return res.status(200).json({ 
          answer: response.data.choices[0].text.trim() 
        });

      default:
        return res.status(400).json({
          error: 'Invalid action',
          allowedActions: ['process', 'query']
        });
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error.message
    });
  }
}
