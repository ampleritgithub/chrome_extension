import ApiClient from './api-client.js';

document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyze-btn');
  const sendBtn = document.getElementById('send-btn');
  const userInput = document.getElementById('user-input');
  const chatOutput = document.getElementById('chat-output');
  const analysisStatus = document.getElementById('analysis-status');

  chrome.runtime.sendMessage({ action: 'wake_up' }, (response) => {
    if (response && response.success) {
      console.log('Service worker is active.');
    } else {
      console.log('Failed to wake up service worker.');
    }
  });

  analyzeBtn.addEventListener('click', async () => {
    analyzeBtn.disabled = true;
    analysisStatus.textContent = 'Analyzing...';
    analysisStatus.classList.remove('hidden');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText,
      });

      if (result && result[0] && result[0].result) {
        const pageContent = result[0].result;
        try {
          const data = await ApiClient.processContent(pageContent);
          await chrome.storage.local.set({ vectorData: data.vectorData });
          analysisStatus.textContent = 'Analyzed';
          chatOutput.textContent = 'Content analyzed and stored. You can now ask questions.';
        } catch (error) {
          console.error('Error processing content:', error);
          chatOutput.textContent = `Error: ${error.message}`;
        }
      } else {
        analysisStatus.textContent = 'Not Analyzed';
        chatOutput.textContent = 'Failed to extract page content.';
      }
    } catch (error) {
      console.error('Error during analysis:', error);
      analysisStatus.textContent = 'Not Analyzed';
      chatOutput.textContent = `Error: ${error.message}. Try again.`;
    } finally {
      analyzeBtn.disabled = false;
    }
  });

  sendBtn.addEventListener('click', async () => {
    const query = userInput.value.trim();
    if (!query) return;

    chatOutput.textContent = 'Thinking...';

    try {
      const storedData = await chrome.storage.local.get('vectorData');

      if (!storedData.vectorData) {
        throw new Error('No analyzed content available. Please analyze a webpage first.');
      }

      const data = await ApiClient.queryContent(storedData.vectorData, query);
      chatOutput.textContent = data.answer;
    } catch (error) {
      console.error('Error querying:', error);
      chatOutput.textContent = `Error: ${error.message}`;
    }

    userInput.value = '';
  });
});