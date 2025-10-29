import React from 'react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingUrls?: Array<{ uri: string; title?: string }>;
}

export type GeminiModel =
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash-lite'
  | 'gemini-2.5-flash-image'
  | 'imagen-4.0-generate-001'
  | 'veo-3.1-fast-generate-preview'
  | 'veo-3.1-generate-preview'
  | 'gemini-2.5-flash-native-audio-preview-09-2025'
  | 'gemini-2.5-flash-preview-tts';

export interface FilePart {
  inlineData: {
    mimeType: string;
    data: string; // Base64 encoded string
  };
}

export interface TabConfig {
  id: string;
  name: string;
  component: React.FC;
}