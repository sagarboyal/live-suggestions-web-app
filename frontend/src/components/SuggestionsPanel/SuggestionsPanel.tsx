import React from 'react';
import { SuggestionBatch, Suggestion } from '../../types';
import './SuggestionsPanel.css';

interface SuggestionsPanelProps {
  suggestionBatches: SuggestionBatch[];
  isLoading: boolean;
  onSuggestionClick: (suggestion: Suggestion) => void;
  onRefresh?: () => void;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  suggestionBatches,
  isLoading,
  onSuggestionClick,
  onRefresh
}) => {

  const chunkIntervalMs = process.env.REACT_APP_CHUNK_INTERVAL_MS
    ? parseInt(process.env.REACT_APP_CHUNK_INTERVAL_MS, 10)
    : 5000;
  const chunkIntervalSec = Math.round(chunkIntervalMs / 1000);

  const formatType = (type: string) => {
    switch (type) {
      case 'question': return 'QUESTION TO ASK';
      case 'talking_point': return 'TALKING POINT';
      case 'fact_check': return 'FACT-CHECK';
      case 'clarification': return 'CLARIFICATION';
      case 'answer': return 'ANSWER';
      default: return type.replace('_', ' ').toUpperCase();
    }
  };

  return (
    <div className="suggestions-panel">
      <div className="panel-header">
        <h2>2. LIVE SUGGESTIONS</h2>
        <div className="header-status">{suggestionBatches.length} BATCHES</div>
      </div>
      
      <div className="action-area">
        <button className="btn-reload" onClick={onRefresh} disabled={isLoading}>
          <svg className={isLoading ? "icon-spin" : ""} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          Reload suggestions
        </button>
        <div className="action-hint">auto-refresh in {chunkIntervalSec}s</div>
      </div>
      <div className="info-card">
        On reload (or auto every ~{chunkIntervalSec}s), generate <strong>3 fresh suggestions</strong> from recent transcript context. 
        New batch appears at the top; older batches push down (faded). Each is a tappable card: a <span className="txt-question">question to ask</span>, 
        a <span className="txt-talking-point">talking point</span>, an <span className="txt-answer">answer</span>, 
        or a <span className="txt-fact-check">fact-check</span>. The preview alone should already be useful.
      </div>
      <div className="suggestions-list">
        {suggestionBatches.length === 0 ? (
          <div className="empty-state">
            Suggestions appear here once recording starts.
          </div>
        ) : (
          suggestionBatches.map((batch, batchIdx) => (
            <div key={batch.id} className={`batch-group ${batchIdx > 0 ? 'faded' : ''}`}>
              {batchIdx > 0 && (
                <div className="batch-divider">
                  — BATCH {suggestionBatches.length - batchIdx} • {batch.timestamp} —
                </div>
              )}
              {batch.suggestions.map((suggestion, idx) => (
                <div 
                  key={idx} 
                  className="suggestion-card"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <div className={`badge ${suggestion.type}`}>
                    {formatType(suggestion.type)}
                  </div>
                  <h3>{suggestion.title}</h3>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SuggestionsPanel;
