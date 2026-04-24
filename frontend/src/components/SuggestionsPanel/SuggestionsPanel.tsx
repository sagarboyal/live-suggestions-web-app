import React from 'react';
import { SuggestionBatch, Suggestion } from '../../types';
import './SuggestionsPanel.css';

interface SuggestionsPanelProps {
  suggestionBatches: SuggestionBatch[];
  isLoading: boolean;
  onSuggestionClick: (suggestion: Suggestion) => void;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  suggestionBatches,
  isLoading,
  onSuggestionClick,
}) => {

  const formatType = (type: string) => {
    return type.replace('_', ' ');
  };

  return (
    <div className="suggestions-panel">
      <div className="suggestions-header">
        <h2>Live Suggestions</h2>
        {isLoading && <div className="spinner"></div>}
      </div>
      
      <div className="suggestions-list">
        {suggestionBatches.length === 0 ? (
          <div className="empty-state">
            Suggestions will appear after recording starts...
          </div>
        ) : (
          suggestionBatches.map((batch) => (
            <div key={batch.id} className="batch-group">
              <div className="batch-divider">{batch.timestamp}</div>
              <div className="suggestion-grid">
                {batch.suggestions.map((suggestion, idx) => (
                  <div 
                    key={idx} 
                    className={`suggestion-card type-${suggestion.type}`}
                    onClick={() => onSuggestionClick(suggestion)}
                  >
                    <span className={`badge ${suggestion.type}`}>
                      {formatType(suggestion.type)}
                    </span>
                    <h3>{suggestion.title}</h3>
                    <p>{suggestion.preview}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SuggestionsPanel;
