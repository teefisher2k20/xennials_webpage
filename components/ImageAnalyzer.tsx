import React, { useState } from 'react';
import { analyzeImage, editImage } from '../services/geminiService';
import { blobToBase64 } from '../utils/audioUtils';
import { GEMINI_MODEL_IMAGE_EDITING, GEMINI_MODEL_IMAGE_UNDERSTANDING } from '../constants';
import { FilePart } from '../types';

const ImageAnalyzer: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [editedImages, setEditedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
        setEditedImages([]);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
      setResult(null);
      setEditedImages([]);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile || !prompt.trim()) {
      setError('Please upload an image and provide a prompt.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setEditedImages([]);

    try {
      const base64Data = await blobToBase64(imageFile);
      const imagePart: FilePart = {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Data,
        },
      };
      const response = await analyzeImage(imagePart, prompt, GEMINI_MODEL_IMAGE_UNDERSTANDING);
      setResult(response);
    } catch (err: any) {
      console.error('Image analysis error:', err);
      setError(`Failed to analyze image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!imageFile || !prompt.trim()) {
      setError('Please upload an image and provide an editing prompt.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setEditedImages([]);

    try {
      const base64Data = await blobToBase64(imageFile);
      const imagePart: FilePart = {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Data,
        },
      };
      const response = await editImage(imagePart, prompt, GEMINI_MODEL_IMAGE_EDITING);
      setEditedImages(response);
    } catch (err: any) {
      console.error('Image editing error:', err);
      setError(`Failed to edit image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-y-auto custom-scrollbar p-6">
      <h3 className="text-xl font-bold mb-4 text-teal-800">Image Understanding & Editing</h3>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
        />
        {imagePreview && (
          <div className="mt-4 flex justify-center">
            <img src={imagePreview} alt="Image Preview" className="max-w-xs max-h-64 object-contain rounded-lg shadow" />
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Describe this image in detail' or 'Add a retro filter'"
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
        />
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleAnalyzeImage}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !imageFile || !prompt.trim()}
        >
          {loading ? 'Analyzing...' : 'Analyze Image'}
        </button>
        <button
          onClick={handleEditImage}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !imageFile || !prompt.trim()}
        >
          {loading ? 'Editing...' : 'Edit Image'}
        </button>
      </div>

      {loading && (
        <div className="text-center text-teal-600 mb-4">
          <p>Processing request, please wait...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mt-2"></div>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {(result || editedImages.length > 0) && (
        <div className="bg-gray-100 p-4 rounded-lg flex-1">
          <p className="font-semibold text-gray-800">Result:</p>
          {result && <p className="whitespace-pre-wrap text-gray-700">{result}</p>}
          {editedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {editedImages.map((src, index) => (
                <div key={index} className="flex flex-col items-center">
                  <p className="text-sm text-gray-600 mb-1">Edited Image {index + 1}</p>
                  <img src={src} alt={`Edited result ${index + 1}`} className="max-w-full h-auto rounded-lg shadow-md" />
                  <a
                    href={src}
                    download={`edited_image_${index + 1}.jpeg`}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;