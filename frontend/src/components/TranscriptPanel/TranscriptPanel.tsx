import React, { useEffect, useRef } from 'react';
import { TranscriptSegment } from '../../types';
import './TranscriptPanel.css';

interface TranscriptPanelProps {
  transcript: TranscriptSegment[];
  isRecording: boolean;
  isLoadingSuggestions: boolean;
  onStart: () => void;
  onStop: () => void;
  onRefresh: () => void;
  onExport: () => void;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  transcript,
  isRecording,
  isLoadingSuggestions,
  onStart,
  onStop,
  onRefresh,
  onExport,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="transcript-panel">
      <div className="transcript-header">
        <h2>
          Transcript
          {isRecording && (
            <span className="badge-listening">
              <span className="dot"></span> Listening...
            </span>
          )}
        </h2>
        <div className="controls">
          {isRecording ? (
            <button className="btn btn-stop" onClick={onStop}>Stop Recording</button>
          ) : (
            <button className="btn btn-start" onClick={onStart}>Start Recording</button>
          )}
          <button className="btn btn-secondary" onClick={onRefresh} disabled={isLoadingSuggestions}>
            {isLoadingSuggestions ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-secondary" onClick={onExport} disabled={transcript.length === 0}>
            Export
          </button>
        </div>
      </div>
      
      <div className="transcript-list" ref={listRef}>
        {transcript.length === 0 ? (
          <div className="empty-state">Click Start Recording to begin...</div>
        ) : (
           transcript.map((segment, index) => (
            <div key={index} className="transcript-item">
              <div className="timestamp">{segment.displayTime}</div>
              <div className="text">{segment.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TranscriptPanel;
