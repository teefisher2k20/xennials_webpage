import { GeminiModel } from './types';

export const GEMINI_MODEL_TEXT_FAST: GeminiModel = 'gemini-2.5-flash';
export const GEMINI_MODEL_TEXT_COMPLEX: GeminiModel = 'gemini-2.5-pro';
export const GEMINI_MODEL_TEXT_LITE: GeminiModel = 'gemini-2.5-flash-lite';
export const GEMINI_MODEL_IMAGE_GEN: GeminiModel = 'imagen-4.0-generate-001';
export const GEMINI_MODEL_IMAGE_UNDERSTANDING: GeminiModel = 'gemini-2.5-flash';
export const GEMINI_MODEL_IMAGE_EDITING: GeminiModel = 'gemini-2.5-flash-image';
export const GEMINI_MODEL_VEO_VIDEO_GEN_FAST: GeminiModel = 'veo-3.1-fast-generate-preview';
export const GEMINI_MODEL_VEO_VIDEO_GEN_HQ: GeminiModel = 'veo-3.1-generate-preview';
export const GEMINI_MODEL_VIDEO_UNDERSTANDING: GeminiModel = 'gemini-2.5-pro';
export const GEMINI_MODEL_LIVE_AUDIO: GeminiModel = 'gemini-2.5-flash-native-audio-preview-09-2025';
export const GEMINI_MODEL_TTS: GeminiModel = 'gemini-2.5-flash-preview-tts';

export const DEFAULT_ASPECT_RATIO_IMAGE = '1:1';
export const DEFAULT_ASPECT_RATIO_VIDEO = '16:9';

export const IMAGE_ASPECT_RATIOS = [
  { label: 'Square (1:1)', value: '1:1' },
  { label: 'Portrait (3:4)', value: '3:4' },
  { label: 'Landscape (4:3)', value: '4:3' },
  { label: 'Tall Portrait (9:16)', value: '9:16' },
  { label: 'Wide Landscape (16:9)', value: '16:9' },
];

export const VIDEO_ASPECT_RATIOS = [
  { label: 'Landscape (16:9)', value: '16:9' },
  { label: 'Portrait (9:16)', value: '9:16' },
];

// Placeholder image URLs
export const HERO_VISUAL_URL = "https://picsum.photos/1920/1080?random=1";
export const ABOUT_ILLUSTRATION_URL = "https://picsum.photos/400/300?random=2";
export const CASE_ACME_LOGO = "https://picsum.photos/80/80?random=3";
export const CASE_MED_LOGO = "https://picsum.photos/80/80?random=4";
export const CASE_BANK_LOGO = "https://picsum.photos/80/80?random=5";
export const LOGO_N8N = "https://picsum.photos/80/40?random=6";
export const LOGO_ODOO = "https://picsum.photos/80/40?random=7";
export const LOGO_FASTAPI = "https://picsum.photos/80/40?random=8";
export const LOGO_SUPABASE = "https://picsum.photos/80/40?random=9";
export const LOGO_DOCKER = "https://picsum.photos/80/40?random=10";
export const LOGO_OPENAI = "https://picsum.photos/80/40?random=11";
export const USER1_PHOTO = "https://picsum.photos/100/100?random=12";
export const USER2_PHOTO = "https://picsum.photos/100/100?random=13";
