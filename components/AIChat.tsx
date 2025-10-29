import React, { useState, useRef, useEffect, useCallback } from 'react';
import { streamChat, generateText } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GEMINI_MODEL_TEXT_FAST } from '../constants';

interface AIChatProps {
  useGoogleSearch?: boolean;
  useGoogleMaps?: boolean;
  title: string;
}

const AIChat: React.FC<AIChatProps> = ({ useGoogleSearch = false, useGoogleMaps = false, title }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getUserLocation = useCallback(() => {
    if (useGoogleMaps && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position.coords);
          setLocationError(null);
        },
        (err) => {
          console.error('Geolocation Error:', err);
          setLocationError(`Geolocation error: ${err.message}. Maps grounding may be less accurate.`);
          setUserLocation(null);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, [useGoogleMaps]);

  useEffect(() => {
    getUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useGoogleMaps]); // Re-fetch location if maps grounding is enabled/disabled

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      if (useGoogleSearch || useGoogleMaps) {
        // For grounding tools, use generateText as it supports grounding and returns all at once
        const historyText = messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
        const fullPrompt = `${historyText}\nuser: ${input}`; // Include current message for context
        const response = await generateText(fullPrompt, GEMINI_MODEL_TEXT_FAST, useGoogleSearch, useGoogleMaps, userLocation);
        const modelResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'model',
          text: response.text,
          timestamp: new Date(),
          groundingUrls: response.groundingUrls,
        };
        setMessages((prev) => [...prev, modelResponse]);
      } else {
        // For general chat, stream the response
        const chatHistory = messages.flatMap(msg => [msg.text]); // Simple history for streaming chat
        let fullResponse = '';
        const stream = streamChat(input, chatHistory, GEMINI_MODEL_TEXT_FAST, useGoogleSearch);
        const modelMessageId = (Date.now() + 1).toString();

        setMessages((prev) => [
          ...prev,
          { id: modelMessageId, sender: 'model', text: '', timestamp: new Date() },
        ]);

        for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === modelMessageId ? { ...msg, text: fullResponse } : msg
            )
          );
        }
      }
    } catch (err: any) {
      console.error('API Error:', err);
      setError(`Failed to get response: ${err.message}`);
      setMessages((prev) => prev.filter(msg => msg.id !== (Date.now() + 1).toString())); // Remove empty model message if error occurs
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <h3 className="text-xl font-bold p-4 bg-gray-100 text-teal-800 border-b border-gray-200">{title}</h3>
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center py-4">Start a conversation!</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-semibold">Sources:</p>
                  <ul className="list-disc list-inside">
                    {msg.groundingUrls.map((url, index) => (
                      <li key={index} className="truncate">
                        <a
                          href={url.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                          title={url.title || url.uri}
                        >
                          {url.title || url.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800">
              <span className="animate-pulse">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && <p className="text-red-500 p-4">{error}</p>}
      {locationError && useGoogleMaps && <p className="text-yellow-600 p-4 text-sm">{locationError}</p>}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-teal-600 text-white p-3 rounded-r-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AIChat;