export interface TranscriptSegment {
  text: string;
  timestamp: number;
  displayTime: string;
}

export interface Suggestion {
  title: string;
  preview: string;
  type: "question" | "talking_point" | "fact_check" | "clarification" | "answer";
}

export interface SuggestionBatch {
  id: string;
  suggestions: Suggestion[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestionType?: string;
}

export interface AppSettings {
  suggestionPrompt: string;
  chatPrompt: string;
  suggestionContextWindow: number;
  chatContextWindow: number;
}

export interface ApiResponse<T> {
  timestamp: string;
  status: number;
  message: string;
  data: T;
}

export interface TranscribeResponse {
  text: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export interface SuggestionResponse {
  suggestions: Suggestion[];
}

export interface ChatResponse {
  answer: string;
}
