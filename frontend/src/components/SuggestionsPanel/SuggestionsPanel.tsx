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
        <div className="action-hint">auto-refresh in 30s</div>
      </div>

      <div className="info-card">
        On reload (or auto every ~30s), generate <strong>3 fresh suggestions</strong> from recent transcript context. 
        New batch appears at the top; older batches push down (faded). Each is a tappable card: a <span className="txt-question">question to ask</span>, 
        a <span className="txt-talking-point">talking point</span>, a <span className="txt-fact-check">fact check</span>, 
        or a <span className="txt-clarification">clarification</span>. The preview alone should already be useful.
      </div>

      <div className="suggestions-list">
        {suggestionBatches.length === 0 ? (
          <div className="empty-state">
            Suggestions appear here once recording starts.
          </div>
        ) : (
          suggestionBatches.map((batch, batchIdx) => (
            <div key={batch.id} className={`batch-group ${batchIdx > 0 ? 'faded' : ''}`}>
              {batch.suggestions.map((suggestion, idx) => (
                <div 
                  key={idx} 
                  className="suggestion-card"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <div className={`type-indicator ${suggestion.type}`}></div>
                  <h3>{suggestion.title}</h3>
                  <p>{suggestion.preview}</p>
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
