import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { IMAGE_ASPECT_RATIOS, DEFAULT_ASPECT_RATIO_IMAGE } from '../constants';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>(DEFAULT_ASPECT_RATIO_IMAGE);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for image generation.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const images = await generateImage(prompt, 1, aspectRatio);
      setGeneratedImages(images);
    } catch (err: any) {
      console.error('Image generation error:', err);
      setError(`Failed to generate image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-y-auto custom-scrollbar p-6">
      <h3 className="text-xl font-bold mb-4 text-teal-800">Image Generation (Imagen 4.0)</h3>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Image Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'A robot holding a red skateboard in a futuristic city'"
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Aspect Ratio</label>
        <select
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as '1:1' | '3:4' | '4:3' | '9:16' | '16:9')}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
        >
          {IMAGE_ASPECT_RATIOS.map((ratio) => (
            <option key={ratio.value} value={ratio.value}>
              {ratio.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerateImage}
        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        disabled={loading || !prompt.trim()}
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </button>

      {loading && (
        <div className="text-center text-teal-600 mb-4">
          <p>Generating your image, please wait...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mt-2"></div>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {generatedImages.length > 0 && (
        <div className="bg-gray-100 p-4 rounded-lg flex-1">
          <p className="font-semibold text-gray-800 mb-2">Generated Image:</p>
          <div className="grid grid-cols-1 gap-4">
            {generatedImages.map((src, index) => (
              <div key={index} className="flex flex-col items-center">
                <img src={src} alt={`Generated result ${index + 1}`} className="max-w-full h-auto rounded-lg shadow-md" />
                <a
                  href={src}
                  download={`generated_image_${index + 1}.jpeg`}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;