import { GoogleGenAI, GenerateContentResponse, LiveServerMessage, Modality, Blob, Type, FunctionDeclaration } from '@google/genai';
import React from 'react'; // Added for React.MutableRefObject
import { FilePart, GeminiModel } from '../types';
import { blobToBase64, decode, decodeAudioData, encode } from '../utils/audioUtils';

// The global `window.aistudio` interface is now declared in `global.d.ts`

let ai: GoogleGenAI | null = null;
let currentSessionPromise: Promise<Awaited<ReturnType<GoogleGenAI['live']['connect']>>> | null = null;

function getGeminiClient(): GoogleGenAI {
  // Ensure the API key is always fresh from the environment.
  if (!process.env.API_KEY) {
    console.error('API_KEY environment variable is not set.');
    throw new Error('API Key is not configured. Please select an API key.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export async function hasApiKeySelected(): Promise<boolean> {
  if (typeof window !== 'undefined' && window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
    return await window.aistudio.hasSelectedApiKey();
  }
  return !!process.env.API_KEY; // Fallback for environments without window.aistudio
}

export async function openApiKeySelection(): Promise<void> {
  if (typeof window !== 'undefined' && window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
    await window.aistudio.openSelectKey();
  } else {
    alert('API Key selection is not available in this environment. Please ensure process.env.API_KEY is set.');
  }
}

export async function generateText(prompt: string, model: GeminiModel = 'gemini-2.5-flash', useGoogleSearch: boolean = false, useGoogleMaps: boolean = false, userLocation?: GeolocationCoordinates | null, thinkingBudget?: number): Promise<{ text: string; groundingUrls: { uri: string; title?: string }[] }> {
  ai = getGeminiClient();
  const config: {
    tools?: any[];
    toolConfig?: any;
    thinkingConfig?: { thinkingBudget: number };
  } = {};

  if (useGoogleSearch) {
    config.tools = [{ googleSearch: {} }];
  } else if (useGoogleMaps) {
    config.tools = [{ googleMaps: {} }];
    if (userLocation) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
        },
      };
    }
  }

  if (thinkingBudget !== undefined) {
    config.thinkingConfig = { thinkingBudget };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });

    const groundingUrls: { uri: string; title?: string }[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      for (const chunk of response.candidates[0].groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          groundingUrls.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
        if (chunk.maps?.uri) {
          groundingUrls.push({ uri: chunk.maps.uri, title: chunk.maps.title });
        }
        if (chunk.maps?.placeAnswerSources) {
          for (const source of chunk.maps.placeAnswerSources) {
            if (source.reviewSnippets) {
              for (const snippet of source.reviewSnippets) {
                if (snippet.uri) {
                  groundingUrls.push({ uri: snippet.uri, title: `Review: ${snippet.review}` });
                }
              }
            }
          }
        }
      }
    }
    return { text: response.text, groundingUrls };
  } catch (error) {
    console.error('Error generating text:', error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      await openApiKeySelection(); // Prompt user to re-select key
    }
    throw error;
  }
}

export async function* streamChat(prompt: string, chatHistory: string[] = [], model: GeminiModel = 'gemini-2.5-flash', useGoogleSearch: boolean = false): AsyncGenerator<string> {
  ai = getGeminiClient();
  const config: { tools?: any[] } = {};
  if (useGoogleSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const chat = ai.chats.create({
    model,
    config,
  });

  // Pre-seed chat history
  for (let i = 0; i < chatHistory.length; i += 2) {
    await chat.sendMessage({ message: chatHistory[i] });
    await chat.sendMessage({ message: chatHistory[i + 1] });
  }

  try {
    const response = await chat.sendMessageStream({ message: prompt });
    for await (const chunk of response) {
      yield chunk.text;
    }
  } catch (error) {
    console.error('Error streaming chat:', error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      await openApiKeySelection();
    }
    throw error;
  }
}

export async function analyzeImage(imagePart: FilePart, prompt: string, model: GeminiModel = 'gemini-2.5-flash'): Promise<string> {
  ai = getGeminiClient();
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] },
    });
    return response.text;
  } catch (error) {
    console.error('Error analyzing image:', error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      await openApiKeySelection();
    }
    throw error;
  }
}

export async function generateImage(prompt: string, numberOfImages: number = 1, aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '1:1'): Promise<string[]> {
  ai = getGeminiClient();
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages,
        outputMimeType: 'image/jpeg',
        aspectRatio,
      },
    });
    return response.generatedImages.map((img) => `data:image/jpeg;base64,${img.image.imageBytes}`);
  } catch (error) {
    console.error('Image generation error:', error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      await openApiKeySelection();
    }
    throw error;
  }
}

export async function editImage(imagePart: FilePart, prompt: string, model: GeminiModel = 'gemini-2.5-flash-image'): Promise<string[]> {
  ai = getGeminiClient();
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: {
        parts: [imagePart, { text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imageUrls: string[] = [];
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrls.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
      }
    }
    return imageUrls;
  } catch (error) {
    console.error('Error editing image:', error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      await openApiKeySelection();
    }
    throw error;
  }
}

export async function generateVideo(prompt: string, imagePart?: FilePart, aspectRatio: '16:9' | '9:16' = '16:9', resolution: '720p' | '1080p' = '1080p'): Promise<string> {
  ai = getGeminiClient();
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: imagePart ? imagePart.inlineData : undefined,
      config: {
        numberOfVideos: 1,
        resolution,
        aspectRatio,
      },
    });

    // Poll for operation completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error('No video URI found in the response.');
    }

    // Append API key to the download link
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch video: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating video:', error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      await openApiKeySelection();
    }
    throw error;
  }
}

export async function analyzeVideo(videoFile: File, prompt: string, model: GeminiModel = 'gemini-2.5-pro'): Promise<string> {
  ai = getGeminiClient();
  try {
    const videoBase64 = await blobToBase64(videoFile);
    const videoPart: FilePart = {
      inlineData: {
        mimeType: videoFile.type,
        data: videoBase64,
      },
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: { parts: [videoPart, { text: prompt }] },
      config: {
        thinkingConfig: { thinkingBudget: 32768 } // Max for Pro model
      }
    });
    return response.text;
  } catch (error) {
    console.error('Error analyzing video:', error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      await openApiKeySelection();
    }
    throw error;
  }
}

export async function textToSpeech(text: string, voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Zephyr'): Promise<void> {
  ai = getGeminiClient();
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data received from TTS.');
    }

    const outputAudioContext = new (window.AudioContext)({ sampleRate: 24000 }); // Changed from window.webkitAudioContext
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );

    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
  } catch (error) {
    console.error('Error during text-to-speech:', error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      await openApiKeySelection();
    }
    throw error;
  }
}

interface LiveSessionCallbacks {
  onMessage: (message: LiveServerMessage) => void;
  onError: (event: Event) => void;
  onClose: (event: Event) => void;
}

export async function startLiveSession(
  inputAudioContext: AudioContext,
  outputAudioContext: AudioContext,
  inputNode: GainNode,
  outputNode: GainNode,
  stream: MediaStream,
  callbacks: LiveSessionCallbacks,
  nextStartTimeRef: React.MutableRefObject<number>, // Changed parameter from setNextStartTime
  sources: React.MutableRefObject<Set<AudioBufferSourceNode>>,
) {
  ai = getGeminiClient();
  if (currentSessionPromise) {
    console.warn('Live session already in progress. Closing previous session.');
    const session = await currentSessionPromise;
    session.close();
    currentSessionPromise = null;
  }

  currentSessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: () => {
        console.debug('Live session opened.');
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          currentSessionPromise?.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        callbacks.onMessage(message);

        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64EncodedAudioString) {
          // Calculate scheduledStartTime based on the current value of nextStartTimeRef.current
          // This ensures that the audio starts playing from the correct time.
          const currentScheduledStartTime = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);

          decodeAudioData(decode(base64EncodedAudioString), outputAudioContext, 24000, 1)
            .then((audioBuffer) => {
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => {
                sources.current.delete(source);
              });
              source.start(currentScheduledStartTime);
              sources.current.add(source);

              // Update nextStartTimeRef.current AFTER the audioBuffer is decoded and its duration is known.
              // This is crucial for maintaining the correct playback sequence.
              nextStartTimeRef.current = currentScheduledStartTime + audioBuffer.duration;
            })
            .catch((err) => console.error('Error decoding or playing audio:', err));
        }

        const interrupted = message.serverContent?.interrupted;
        if (interrupted) {
          for (const source of sources.current.values()) {
            source.stop();
            sources.current.delete(source);
          }
          nextStartTimeRef.current = 0; // Directly reset the ref value
        }
      },
      onerror: (e: Event) => {
        console.error('Live session error:', e);
        callbacks.onError(e);
        currentSessionPromise = null;
      },
      onclose: (e: Event) => {
        console.debug('Live session closed.');
        callbacks.onClose(e);
        currentSessionPromise = null;
      },
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: 'You are a friendly and helpful AI assistant for Xennials. You can answer questions about AI automation, the services Xennials offers, or general inquiries.',
      outputAudioTranscription: {},
      inputAudioTranscription: {},
      // tools: [{ functionDeclarations: [controlLightFunctionDeclaration] }], // Example for function calling
    },
  });

  // Return the resolved session object for immediate use if needed elsewhere
  return await currentSessionPromise;
}

export async function stopLiveSession() {
  if (currentSessionPromise) {
    const session = await currentSessionPromise;
    session.close();
    currentSessionPromise = null;
  }
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}