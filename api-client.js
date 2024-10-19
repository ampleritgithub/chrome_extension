// api-client.js
const API_BASE_URL = 'https://chrome-extension-khaki-iota.vercel.app/api';

class ApiClient {
  static async processContent(content) {
    try {
      const response = await fetch(`${API_BASE_URL}/openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action: 'process',
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Process content error:', error);
      throw error;
    }
  }

  static async queryContent(vectorData, query) {
    try {
      const response = await fetch(`${API_BASE_URL}/openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action: 'query',
          vectorData: vectorData,
          query: query,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Query content error:', error);
      throw error;
    }
  }
}

export default ApiClient;