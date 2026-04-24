import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  currentApiKey: string;
  onSave: (apiKey: string) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, currentApiKey, onSave, onClose }) => {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setApiKey(currentApiKey);
  }, [currentApiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <h2 className="modal-title">Settings</h2>
        
        <div className="form-group">
          <label htmlFor="apiKey">Groq API Key</label>
          <div className="input-wrapper">
            <input
              id="apiKey"
              type={showPassword ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
            />
            <button 
              type="button" 
              className="toggle-visibility"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button 
          className="btn-save" 
          onClick={handleSave}
          disabled={!apiKey.trim()}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
