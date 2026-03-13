import React, { useState } from 'react';
import { formatInterviewMessage, getPromptType } from './interviewMessageFormatter';
import './interview-message-styles.css';

const FormattedInterviewMessage = ({ 
  message, 
  interviewLevel, 
  onButtonClick,
  isLoading = false,
  clickedButtons = [] 
}) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  if (!message) return null;

  const parsed = formatInterviewMessage(message, interviewLevel);
  const promptType = getPromptType(message);

  // Handle level selection - show only selected level after click
  const handleLevelSelect = (buttonValue) => {
    setSelectedLevel(buttonValue);
    onButtonClick(buttonValue);
  };

  // Render based on message type
  switch (parsed.type) {
    case 'greeting':
      return (
        <div className="interview-message greeting-message">
          <p className="message-text">{parsed.text}</p>
          {parsed.buttons && !isLoading && (
            <div className="message-buttons">
              {parsed.buttons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => onButtonClick(btn.value)}
                  disabled={isLoading || clickedButtons.includes(btn.value)}
                  className={`btn btn-${btn.style}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );

    case 'levelSelection':
      return (
        <div className="interview-message level-selection-message">
          <p className="message-text">{parsed.text}</p>
          {parsed.buttons && !isLoading && (
            <div className="message-buttons level-buttons">
              {parsed.buttons.map((btn, idx) => {
                // Hide non-selected levels after selection
                if (selectedLevel && btn.value !== selectedLevel) {
                  return null;
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleLevelSelect(btn.value)}
                    disabled={isLoading || clickedButtons.includes(btn.value)}
                    className={`btn btn-level btn-${btn.style} ${selectedLevel === btn.value ? 'btn-selected' : ''}`}
                  >
                    <span className="btn-label">{btn.label}</span>
                    <span className="btn-description">{btn.description}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );

    case 'instructions':
      return (
        <div className="interview-message instructions-message" style={{ display: 'none' }}>
          {/* Instructions hidden - showing points only */}
        </div>
      );

    case 'assessmentReport':
      return (
        <div className="interview-message assessment-report-message">
          <div className="assessment-content">
            {parsed.formatted && (
              <>
                {parsed.formatted.level && (
                  <div className="assessment-level">
                    <strong>Level:</strong> {parsed.formatted.level}
                  </div>
                )}
                
                {parsed.formatted.impression && (
                  <div className="assessment-section">
                    <h4>First Impression Analysis</h4>
                    <p>{parsed.formatted.impression}</p>
                  </div>
                )}

                {parsed.formatted.overallScore && (
                  <div className="assessment-score">
                    <span className="score-label">Overall Score:</span>
                    <span className="score-value">{parsed.formatted.overallScore}/10.0</span>
                  </div>
                )}

                {Object.keys(parsed.formatted.evaluation || {}).length > 0 && (
                  <div className="assessment-section">
                    <h4>Detailed Evaluation</h4>
                    <div className="evaluation-grid">
                      {Object.entries(parsed.formatted.evaluation).map(([metric, details], idx) => (
                        <div key={idx} className="evaluation-item">
                          <strong>{metric}</strong>
                          <p>{details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(parsed.formatted.contentAnalysis || {}).length > 0 && (
                  <div className="assessment-section">
                    <h4>Content Analysis</h4>
                    <div className="content-items">
                      {Object.entries(parsed.formatted.contentAnalysis).map(([item, details], idx) => (
                        <div key={idx} className="content-item">
                          <strong>{item}:</strong> {details}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parsed.formatted.development && parsed.formatted.development.length > 0 && (
                  <div className="assessment-section">
                    <h4>Professional Development</h4>
                    <ol className="development-list">
                      {parsed.formatted.development.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {parsed.formatted.readiness && (
                  <div className="assessment-readiness">
                    <strong>Interview Readiness:</strong> {parsed.formatted.readiness}
                  </div>
                )}
              </>
            )}

            {!parsed.formatted && (
              <div className="assessment-raw">
                {parsed.text.split('\n').map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      );

    case 'readyPrompt':
      return (
        <div className="interview-message ready-prompt-message">
          <p className="message-text">{parsed.text}</p>
          {/* Start Recording button removed - use mic control at bottom instead */}
        </div>
      );

    case 'nextPrompt':
      return (
        <div className="interview-message next-prompt-message">
          <p className="message-text">{parsed.text}</p>
          {parsed.buttons && !isLoading && (
            <div className="message-buttons">
              {parsed.buttons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => onButtonClick(btn.value)}
                  disabled={isLoading || clickedButtons.includes(btn.value)}
                  className={`btn btn-${btn.style}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );

    case 'donePrompt':
      return (
        <div className="interview-message done-prompt-message">
          <p className="message-text">{parsed.text}</p>
          {parsed.buttons && !isLoading && (
            <div className="message-buttons">
              {parsed.buttons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => onButtonClick(btn.value)}
                  disabled={isLoading || clickedButtons.includes(btn.value)}
                  className={`btn btn-${btn.style}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );

    case 'plain':
    default:
      return (
        <div className="interview-message plain-message">
          <p className="message-text">{parsed.text}</p>
        </div>
      );
  }
};

export default FormattedInterviewMessage;
