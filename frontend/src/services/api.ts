import axios from 'axios';
import {
  TranscribeResponse,
  SuggestionResponse,
  ChatResponse,
  AppSettings
} from '../types';

const BASE_URL = 'http://localhost:8080';

export const transcribeAudio = async (audioBlob: Blob, apiKey: string): Promise<TranscribeResponse> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');

  const response = await axios.post<TranscribeResponse>(`${BASE_URL}/api/transcribe`, formData, {
    headers: {
      'X-Groq-Api-Key': apiKey,
    },
  });
  return response.data;
};

export const getSuggestions = async (transcript: string, apiKey: string): Promise<SuggestionResponse> => {
  const response = await axios.post<SuggestionResponse>(`${BASE_URL}/api/suggestions`, { transcript }, {
    headers: {
      'X-Groq-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const sendChat = async (transcript: string, question: string, apiKey: string): Promise<ChatResponse> => {
  const response = await axios.post<ChatResponse>(`${BASE_URL}/api/chat`, { transcript, question }, {
    headers: {
      'X-Groq-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const getSettings = async (apiKey: string): Promise<AppSettings> => {
  const response = await axios.get<AppSettings>(`${BASE_URL}/api/settings`, {
    headers: {
      'X-Groq-Api-Key': apiKey,
    },
  });
  return response.data;
};
