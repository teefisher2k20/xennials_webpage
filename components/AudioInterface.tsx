import React, { useState, useRef, useEffect, useCallback } from 'react';
import { startLiveSession, stopLiveSession, textToSpeech } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';
import { decodeAudioData, decode } from '../utils/audioUtils';

// The global `window.aistudio` interface is now declared in `global.d.ts`

const AudioInterface: React.FC = () => {
  const [isLiveSessionActive, setIsLiveSessionActive] = useState<boolean>(false);
  const [liveTranscriptInput, setLiveTranscriptInput] = useState<string>('');
  const [liveTranscriptOutput, setLiveTranscriptOutput] = useState<string>('');
  const [fullConversation, setFullConversation] = useState<string[]>([]);
  const [ttsText, setTtsText] = useState<string>('');
  const [ttsLoading, setTtsLoading] = useState<boolean>(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isMicAccessGranted, setIsMicAccessGranted] = useState<boolean>(false);

  // Audio contexts and nodes
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0); // nextStartTime is now managed directly via ref
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const requestMicrophoneAccess = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported on this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setIsMicAccessGranted(true);
      setLiveError(null);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setLiveError(`Failed to access microphone: ${err.message}. Please ensure permissions are granted.`);
      setIsMicAccessGranted(false);
    }
  }, []);

  useEffect(() => {
    requestMicrophoneAccess();
    // Clean up audio resources on unmount
    return () => {
      stopLiveSession();
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      inputAudioContextRef.current?.close();
      outputAudioContextRef.current?.close();
      sourcesRef.current.forEach(source => source.stop());
      sourcesRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleLiveSessionMessage = useCallback(async (message: LiveServerMessage) => {
    if (message.serverContent?.outputTranscription) {
      setLiveTranscriptOutput((prev) => prev + message.serverContent!.outputTranscription!.text);
    }
    if (message.serverContent?.inputTranscription) {
      setLiveTranscriptInput((prev) => prev + message.serverContent!.inputTranscription!.text);
    }
    if (message.serverContent?.turnComplete) {
      setFullConversation((prev) => [
        ...prev,
        `User: ${liveTranscriptInput}`,
        `AI: ${liveTranscriptOutput}`,
      ]);
      setLiveTranscriptInput('');
      setLiveTranscriptOutput('');
    }
  }, [liveTranscriptInput, liveTranscriptOutput]);

  const handleStartLiveSession = async () => {
    if (!mediaStreamRef.current) {
      await requestMicrophoneAccess();
      if (!mediaStreamRef.current) return;
    }
    if (isLiveSessionActive) {
      await stopLiveSession();
      setIsLiveSessionActive(false);
      return;
    }

    setLiveError(null);
    setLiveTranscriptInput('');
    setLiveTranscriptOutput('');
    setFullConversation([]);
    nextStartTimeRef.current = 0; // Reset playback time

    try {
      inputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 16000 }); // Changed from window.webkitAudioContext
      outputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 24000 }); // Changed from window.webkitAudioContext
      inputNodeRef.current = inputAudioContextRef.current.createGain();
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);

      await startLiveSession(
        inputAudioContextRef.current,
        outputAudioContextRef.current,
        inputNodeRef.current,
        outputNodeRef.current,
        mediaStreamRef.current,
        {
          onMessage: handleLiveSessionMessage,
          onError: (e) => {
            console.error('Live session error:', e);
            setLiveError('Live session disconnected due to an error.');
            setIsLiveSessionActive(false);
          },
          onClose: () => {
            console.debug('Live session closed.');
            setIsLiveSessionActive(false);
            setLiveError(null);
          },
        },
        nextStartTimeRef, // Pass the ref directly
        sourcesRef,
      );
      setIsLiveSessionActive(true);
    } catch (err: any) {
      console.error('Error starting live session:', err);
      setLiveError(`Failed to start live session: ${err.message}.`);
      setIsLiveSessionActive(false);
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    }
  };

  const handleTextToSpeech = async () => {
    if (!ttsText.trim()) {
      setTtsError('Please enter text for speech synthesis.');
      return;
    }

    setTtsLoading(true);
    setTtsError(null);

    try {
      await textToSpeech(ttsText);
    } catch (err: any) {
      console.error('TTS error:', err);
      setTtsError(`Failed to generate speech: ${err.message}`);
    } finally {
      setTtsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-y-auto custom-scrollbar p-6">
      <h3 className="text-xl font-bold mb-4 text-teal-800">Live AI Conversation & Text-to-Speech</h3>

      {/* Live Conversation Section */}
      <div className="mb-8 border-b pb-6 border-gray-200">
        <h4 className="text-lg font-semibold mb-3 text-gray-800">Real-time Conversational AI (Gemini Live API)</h4>
        {!isMicAccessGranted && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-bold">Microphone Access Required</p>
            <p>Please grant microphone access to use the live conversation feature.</p>
            <button
              onClick={requestMicrophoneAccess}
              className="mt-2 bg-yellow-600 text-white py-1 px-3 rounded text-sm hover:bg-yellow-700 transition"
            >
              Request Access
            </button>
          </div>
        )}
        <button
          onClick={handleStartLiveSession}
          className={`w-full py-2 px-4 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
            isLiveSessionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } text-white`}
          disabled={!isMicAccessGranted}
        >
          {isLiveSessionActive ? 'Stop Live Session' : 'Start Live Session'}
        </button>
        {liveError && <p className="text-red-500 mt-2">{liveError}</p>}
        {isLiveSessionActive && (
          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Microphone active. Say something!</p>
            <div className="mb-2">
              <p className="font-semibold text-gray-800">You:</p>
              <p className="whitespace-pre-wrap text-gray-700">{liveTranscriptInput}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">AI:</p>
              <p className="whitespace-pre-wrap text-gray-700">{liveTranscriptOutput}</p>
            </div>
          </div>
        )}
        {fullConversation.length > 0 && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto custom-scrollbar text-sm text-gray-700">
            <p className="font-semibold mb-2 text-gray-800">Conversation History:</p>
            {fullConversation.map((line, index) => (
              <p key={index} className="whitespace-pre-wrap mb-1">{line}</p>
            ))}
          </div>
        )}
      </div>

      {/* Text-to-Speech Section */}
      <div>
        <h4 className="text-lg font-semibold mb-3 text-gray-800">Text-to-Speech (Gemini TTS)</h4>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Text to Speak</label>
          <textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            placeholder="e.g., 'Hello, how can I help you today?'"
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
          />
        </div>
        <button
          onClick={handleTextToSpeech}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-full"
          disabled={ttsLoading || !ttsText.trim()}
        >
          {ttsLoading ? 'Generating Speech...' : 'Generate Speech & Play'}
        </button>
        {ttsError && <p className="text-red-500 mt-2">{ttsError}</p>}
      </div>
    </div>
  );
};

export default AudioInterface;