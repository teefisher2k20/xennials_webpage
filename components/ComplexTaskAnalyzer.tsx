import React, { useState } from 'react';
import { generateText } from '../services/geminiService';
import { GEMINI_MODEL_TEXT_COMPLEX } from '../constants';

const ComplexTaskAnalyzer: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeComplexTask = async () => {
    if (!prompt.trim()) {
      setError('Please enter a complex query.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateText(prompt, GEMINI_MODEL_TEXT_COMPLEX, false, false, undefined, 32768);
      setResult(response.text);
    } catch (err: any) {
      console.error('Complex task analysis error:', err);
      setError(`Failed to analyze complex task: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-y-auto custom-scrollbar p-6">
      <h3 className="text-xl font-bold mb-4 text-teal-800">Complex Task Analyzer (Gemini Pro with Thinking Mode)</h3>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Complex Query</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Write Python code for a web application that visualizes real-time stock market data, including a brief explanation of each component.'"
          rows={8}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
        />
      </div>

      <button
        onClick={handleAnalyzeComplexTask}
        className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        disabled={loading || !prompt.trim()}
      >
        {loading ? 'Analyzing...' : 'Analyze Complex Task'}
      </button>

      {loading && (
        <div className="text-center text-teal-600 mb-4">
          <p>Processing your complex query with enhanced thinking, please wait...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mt-2"></div>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg flex-1">
          <p className="font-semibold text-gray-800 mb-2">Result:</p>
          <pre className="whitespace-pre-wrap text-gray-700 p-2 bg-gray-50 rounded-md overflow-x-auto">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default ComplexTaskAnalyzer;