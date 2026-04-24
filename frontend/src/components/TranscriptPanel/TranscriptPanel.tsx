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
  onStart,
  onStop,
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
      <div className="panel-header">
        <h2>1. MIC & TRANSCRIPT</h2>
        <div className="header-actions">
          {transcript.length > 0 && (
            <button className="btn-icon" onClick={onExport} aria-label="Export Session">
              Export
            </button>
          )}
          <div className={`status-badge ${isRecording ? 'active' : ''}`}>
            {isRecording ? (
              <><span className="status-dot recording"></span> RECORDING</>
            ) : (
              'IDLE'
            )}
          </div>
        </div>
      </div>
      
      <div className="mic-area">
        <button 
          className={`btn-mic ${isRecording ? 'recording' : ''}`} 
          onClick={isRecording ? onStop : onStart}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          <div className="inner-circle"></div>
        </button>
        <div className="mic-text">
          {isRecording 
            ? 'Listening... transcript updates every 30s.' 
            : 'Click mic to start. Transcript appends every ~30s.'}
        </div>
      </div>
      
      <div className="transcript-list" ref={listRef}>
        {transcript.length === 0 ? (
          <div className="empty-state">No transcript yet — start the mic.</div>
        ) : (
           transcript.map((segment, index) => (
            <div key={index} className="transcript-item">
              <span className="timestamp">{segment.displayTime}</span> <span className="text">{segment.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TranscriptPanel;
