import axios from 'axios';
import {
  TranscribeResponse,
  SuggestionResponse,
  ChatResponse,
  AppSettings
} from '../types';

const BASE_URL = 'http://localhost:8080';

export const transcribeAudio = async (audioBlob: Blob): Promise<TranscribeResponse> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');

  const response = await axios.post<TranscribeResponse>(`${BASE_URL}/api/transcribe`, formData);
  return response.data;
};

export const getSuggestions = async (transcript: string): Promise<SuggestionResponse> => {
  const response = await axios.post<SuggestionResponse>(`${BASE_URL}/api/suggestions`, { transcript }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const sendChat = async (transcript: string, question: string): Promise<ChatResponse> => {
  const response = await axios.post<ChatResponse>(`${BASE_URL}/api/chat`, { transcript, question }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const getSettings = async (): Promise<AppSettings> => {
  const response = await axios.get<AppSettings>(`${BASE_URL}/api/settings`);
  return response.data;
};
