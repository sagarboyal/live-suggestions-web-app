import axios from 'axios';
import {
  ApiResponse,
  TranscribeResponse,
  SuggestionResponse,
  ChatResponse,
  AppSettings
} from '../types';

const BASE_URL = 'http://localhost:8080';

export const transcribeAudio = async (audioBlob: Blob): Promise<TranscribeResponse> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');

  const response = await axios.post<ApiResponse<TranscribeResponse>>(`${BASE_URL}/api/transcribe`, formData);
  return response.data.data;
};

export const getSuggestions = async (transcript: string): Promise<SuggestionResponse> => {
  const response = await axios.post<ApiResponse<SuggestionResponse>>(`${BASE_URL}/api/suggestions`, { transcript }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data.data;
};

export const sendChat = async (transcript: string, question: string): Promise<ChatResponse> => {
  const response = await axios.post<ApiResponse<ChatResponse>>(`${BASE_URL}/api/chat`, { transcript, question }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data.data;
};

export const getSettings = async (): Promise<AppSettings> => {
  const response = await axios.get<ApiResponse<AppSettings>>(`${BASE_URL}/api/settings`);
  return response.data.data;
};
