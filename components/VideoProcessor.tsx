import React, { useState } from 'react';
import { generateVideo, analyzeVideo, hasApiKeySelected, openApiKeySelection } from '../services/geminiService';
import { blobToBase64 } from '../utils/audioUtils';
import { VIDEO_ASPECT_RATIOS, DEFAULT_ASPECT_RATIO_VIDEO } from '../constants';
import { FilePart } from '../types';

// The global `window.aistudio` interface is now declared in `global.d.ts`

const VideoProcessor: React.FC = () => {
  const [videoPrompt, setVideoPrompt] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>(DEFAULT_ASPECT_RATIO_VIDEO);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const [analyzeVideoFile, setAnalyzeVideoFile] = useState<File | null>(null);
  const [analyzePrompt, setAnalyzePrompt] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);

  // Check API key status on component mount
  React.useEffect(() => {
    const checkKey = async () => {
      const selected = await hasApiKeySelected();
      setApiKeyMissing(!selected);
    };
    checkKey();
  }, []);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleAnalyzeVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnalyzeVideoFile(file);
    } else {
      setAnalyzeVideoFile(null);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      setError('Please enter a prompt for video generation.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      let imagePart: FilePart | undefined = undefined;
      if (imageFile) {
        const base64Data = await blobToBase64(imageFile);
        imagePart = {
          inlineData: {
            mimeType: imageFile.type,
            data: base64Data,
          },
        };
      }

      const videoUrl = await generateVideo(videoPrompt, imagePart, videoAspectRatio);
      setGeneratedVideoUrl(videoUrl);
    } catch (err: any) {
      console.error('Video generation error:', err);
      if (err.message.includes("Requested entity was not found.")) {
        setApiKeyMissing(true);
      }
      setError(`Failed to generate video: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeVideo = async () => {
    if (!analyzeVideoFile || !analyzePrompt.trim()) {
      setError('Please upload a video and provide a prompt for analysis.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeVideo(analyzeVideoFile, analyzePrompt);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Video analysis error:', err);
      if (err.message.includes("Requested entity was not found.")) {
        setApiKeyMissing(true);
      }
      setError(`Failed to analyze video: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const requestApiKey = async () => {
    setLoading(true);
    setError(null);
    try {
      await openApiKeySelection();
      // Assume success after opening dialog
      setApiKeyMissing(false);
    } catch (err: any) {
      console.error('API key selection error:', err);
      setError(`Could not open API key selection: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (apiKeyMissing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-white rounded-lg shadow-lg text-center">
        <h3 className="text-xl font-bold mb-4 text-red-600">API Key Required for Video Operations</h3>
        <p className="mb-4 text-gray-700">
          The Veo Video Generation model requires an API key to be selected.
          Please click the button below to select your Google Gemini API key.
        </p>
        <p className="mb-6 text-sm text-gray-500">
          Billing information can be found at{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            ai.google.dev/gemini-api/docs/billing
          </a>.
        </p>
        <button
          onClick={requestApiKey}
          className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Opening...' : 'Select API Key'}
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-y-auto custom-scrollbar p-6">
      <h3 className="text-xl font-bold mb-4 text-teal-800">Video Generation & Understanding (Veo 3.1 & Gemini Pro)</h3>

      {/* Video Generation Section */}
      <div className="mb-8 border-b pb-6 border-gray-200">
        <h4 className="text-lg font-semibold mb-3 text-gray-800">Generate Video from Prompt & Image</h4>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Video Prompt</label>
          <textarea
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            placeholder="e.g., 'A neon hologram of a cat driving at top speed'"
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Upload Starting Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
          />
          {imagePreview && (
            <div className="mt-2 flex justify-center">
              <img src={imagePreview} alt="Starting Image Preview" className="max-w-[100px] max-h-[100px] object-contain rounded-lg shadow" />
            </div>
          )}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Aspect Ratio</label>
          <select
            value={videoAspectRatio}
            onChange={(e) => setVideoAspectRatio(e.target.value as '16:9' | '9:16')}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
          >
            {VIDEO_ASPECT_RATIOS.map((ratio) => (
              <option key={ratio.value} value={ratio.value}>
                {ratio.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerateVideo}
          className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-full"
          disabled={loading || !videoPrompt.trim()}
        >
          {loading ? 'Generating Video...' : 'Generate Video'}
        </button>
        {generatedVideoUrl && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold mb-2 text-gray-800">Generated Video:</p>
            <video controls src={generatedVideoUrl} className="w-full rounded-lg shadow-md mb-2"></video>
            <a href={generatedVideoUrl} download="generated_video.mp4" className="text-blue-600 hover:underline text-sm">Download Video</a>
          </div>
        )}
      </div>

      {/* Video Understanding Section */}
      <div className="mb-8 border-b pb-6 border-gray-200">
        <h4 className="text-lg font-semibold mb-3 text-gray-800">Analyze Video for Key Information</h4>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Upload Video for Analysis</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleAnalyzeVideoFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
          />
          {analyzeVideoFile && (
            <p className="mt-2 text-gray-600 text-sm">Selected: {analyzeVideoFile.name}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Analysis Prompt</label>
          <textarea
            value={analyzePrompt}
            onChange={(e) => setAnalyzePrompt(e.target.value)}
            placeholder="e.g., 'Summarize the key events in this video' or 'Identify all objects present.'"
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
          />
        </div>
        <button
          onClick={handleAnalyzeVideo}
          className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-full"
          disabled={loading || !analyzeVideoFile || !analyzePrompt.trim()}
        >
          {loading ? 'Analyzing Video...' : 'Analyze Video'}
        </button>
        {analysisResult && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold mb-2 text-gray-800">Analysis Result:</p>
            <p className="whitespace-pre-wrap text-gray-700">{analysisResult}</p>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center text-teal-600 mt-6">
          <p>Processing request, please wait...</p>
          <p className="text-sm italic">Video operations can take a few minutes.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mt-2"></div>
        </div>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default VideoProcessor;