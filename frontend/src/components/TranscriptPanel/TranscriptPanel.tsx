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
        <div className={`status-badge ${isRecording ? 'active' : ''}`}>
          {isRecording ? (
            <><span className="pulse-dot"></span> RECORDING</>
          ) : (
            'IDLE'
          )}
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
          Click mic to start. Transcript appends every ~30s.
        </div>
      </div>

      <div className="info-card">
        The transcript scrolls and appends new chunks every ~30 seconds while recording. 
        Use the mic button to start/stop. Include an export button (not shown) so we can pull the full session.
        <div style={{ marginTop: '0.75rem' }}>
          <button className="btn-settings" onClick={onExport} disabled={transcript.length === 0}>
            Export Session
          </button>
        </div>
      </div>
      
      <div className="transcript-list" ref={listRef}>
        {transcript.length === 0 ? (
          <div className="empty-state">No transcript yet — start the mic.</div>
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
