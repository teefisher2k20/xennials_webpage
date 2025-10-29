import React, { useState } from 'react';
import { generateText } from '../services/geminiService';
import { GEMINI_MODEL_TEXT_LITE } from '../constants';

const QuickResponse: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetQuickResponse = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for a quick response.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateText(prompt, GEMINI_MODEL_TEXT_LITE);
      setResult(response.text);
    } catch (err: any) {
      console.error('Quick response error:', err);
      setError(`Failed to get quick response: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-y-auto custom-scrollbar p-6">
      <h3 className="text-xl font-bold mb-4 text-teal-800">Quick Response (Gemini Flash Lite)</h3>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'What is the capital of France?' or 'Define AI in one sentence.'"
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
        />
      </div>

      <button
        onClick={handleGetQuickResponse}
        className="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        disabled={loading || !prompt.trim()}
      >
        {loading ? 'Getting Response...' : 'Get Quick Response'}
      </button>

      {loading && (
        <div className="text-center text-teal-600 mb-4">
          <p>Fetching a speedy response, please wait...</p>
          <div className="animate-pulse rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mt-2"></div>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg flex-1">
          <p className="font-semibold text-gray-800 mb-2">Result:</p>
          <p className="whitespace-pre-wrap text-gray-700">{result}</p>
        </div>
      )}
    </div>
  );
};

export default QuickResponse;