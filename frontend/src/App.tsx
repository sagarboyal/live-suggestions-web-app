import React, { useState } from 'react';
import './App.css';

import { TranscriptSegment, SuggestionBatch, ChatMessage, Suggestion } from './types';
import { useMicRecorder } from './hooks/useMicRecorder';
import { transcribeAudio, getSuggestions, sendChat } from './services/api';

import TranscriptPanel from './components/TranscriptPanel/TranscriptPanel';
import SuggestionsPanel from './components/SuggestionsPanel/SuggestionsPanel';
import ChatPanel from './components/ChatPanel/ChatPanel';

const MIN_TRANSCRIPT_CHARS = 12;
const MIN_TRANSCRIPT_WORDS = 3;

const normalizeTranscriptText = (text: string) => text.replace(/\s+/g, ' ').trim();

const isMeaningfulTranscript = (text: string) => {
  const normalized = normalizeTranscriptText(text);
  if (!normalized) return false;

  const words = normalized.split(' ').filter(Boolean);
  return normalized.length >= MIN_TRANSCRIPT_CHARS && words.length >= MIN_TRANSCRIPT_WORDS;
};

function App() {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [suggestionBatches, setSuggestionBatches] = useState<SuggestionBatch[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const handleChunkReady = async (blob: Blob, startTime: number) => {
    try {
      const response = await transcribeAudio(blob);
      
      let newSegments: TranscriptSegment[] = [];
      if (response.segments && response.segments.length > 0) {
        newSegments = response.segments
          .map(seg => {
            const normalizedText = normalizeTranscriptText(seg.text);
            const timestamp = startTime + seg.start * 1000;
            return {
              text: normalizedText,
              timestamp,
              displayTime: new Date(timestamp).toLocaleTimeString()
            };
          })
          .filter(seg => isMeaningfulTranscript(seg.text));
      } else if (response.text?.trim()) {
        const normalizedText = normalizeTranscriptText(response.text);
        if (isMeaningfulTranscript(normalizedText)) {
          newSegments = [{
            text: normalizedText,
            timestamp: startTime,
            displayTime: new Date(startTime).toLocaleTimeString()
          }];
        }
      }

      if (newSegments.length > 0) {
        setTranscript(prev => {
          const lastExistingText = prev[prev.length - 1]?.text;
          const filteredSegments = newSegments.filter((segment, index) => {
            const previousIncomingText = index > 0 ? newSegments[index - 1].text : lastExistingText;
            return segment.text !== previousIncomingText;
          });

          if (filteredSegments.length === 0) {
            return prev;
          }

          const updated = [...prev, ...filteredSegments];
          handleGetSuggestions(updated); // call immediately with updated
          return updated;
        });
      }
    } catch (error) {
      console.error("Transcription error:", error);
    }
  };

  const { isRecording, startRecording, stopRecording, stream } = useMicRecorder(handleChunkReady);

  const handleGetSuggestions = async (updatedTranscript: TranscriptSegment[]) => {
    const fullText = updatedTranscript.map(s => s.text).join(" ");
    if (!fullText.trim()) return;

    setIsLoadingSuggestions(true);
    try {
      const response = await getSuggestions(fullText);
      if (response.suggestions && response.suggestions.length > 0) {
        const newBatch: SuggestionBatch = {
          id: Date.now().toString(),
          suggestions: response.suggestions,
          timestamp: new Date().toLocaleTimeString()
        };
        setSuggestionBatches(prev => [newBatch, ...prev]);
      }
    } catch (error) {
      console.error("Suggestions error:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleRefreshSuggestions = () => {
    handleGetSuggestions(transcript);
  };

  const transcriptText = transcript.map(s => s.text).join(" ");

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    const suggestionPrompt = `${suggestion.title}: ${suggestion.preview}`;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: suggestionPrompt,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsLoadingChat(true);

    try {
      const response = await sendChat(transcriptText, suggestionPrompt);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleChatSend = async (question: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsLoadingChat(true);

    try {
      const response = await sendChat(transcriptText, question);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      transcript,
      suggestionBatches,
      chatHistory
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meetassist-session.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="app">
        <header className="app-header">
          <h1>Live Suggestions Web App</h1>
        </header>

        <main className="app-main">
          <TranscriptPanel 
            transcript={transcript}
            isRecording={isRecording}
            stream={stream}
            isLoadingSuggestions={isLoadingSuggestions}
            onStart={startRecording}
            onStop={stopRecording}
            onRefresh={handleRefreshSuggestions}
            onExport={handleExport}
          />
          <SuggestionsPanel 
            suggestionBatches={suggestionBatches}
            isLoading={isLoadingSuggestions}
            onSuggestionClick={handleSuggestionClick}
            onRefresh={handleRefreshSuggestions}
          />
          <ChatPanel 
            chatHistory={chatHistory}
            isLoading={isLoadingChat}
            onSend={handleChatSend}
          />
        </main>
      </div>
    </>
  );
}

export default App;
