import React, { useState } from 'react';
import './App.css';

import { TranscriptSegment, SuggestionBatch, ChatMessage, Suggestion } from './types';
import { useMicRecorder } from './hooks/useMicRecorder';
import { transcribeAudio, getSuggestions, sendChat } from './services/api';

import TranscriptPanel from './components/TranscriptPanel/TranscriptPanel';
import SuggestionsPanel from './components/SuggestionsPanel/SuggestionsPanel';
import ChatPanel from './components/ChatPanel/ChatPanel';

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
        newSegments = response.segments.map(seg => {
          const timestamp = startTime + seg.start * 1000;
          return {
            text: seg.text,
            timestamp,
            displayTime: new Date(timestamp).toLocaleTimeString()
          };
        });
      } else if (response.text?.trim()) {
        const timestamp = startTime;
        newSegments = [{
          text: response.text,
          timestamp,
          displayTime: new Date(timestamp).toLocaleTimeString()
        }];
      }

      if (newSegments.length > 0) {
        setTranscript(prev => {
          const updated = [...prev, ...newSegments];
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
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: suggestion.title,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsLoadingChat(true);

    try {
      const response = await sendChat(transcriptText, suggestion.title);
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
          <h1>TwinMind <span>— Live Suggestions Web App (Reference Mockup)</span></h1>
          <div className="header-right">
            <span className="header-subtitle">3-column layout · Transcript · Live Suggestions · Chat</span>
          </div>
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
