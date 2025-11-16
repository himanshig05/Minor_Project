import { useState } from 'react';
import './FakeNewsPage.css';
import { BASE_URL } from '../helper';

export default function FakeNewsPage({ onNavigate, onResults }) {
  const [inputType, setInputType] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = inputType === 'text' ? '/api/verify' : '/api/verify-url';
      const payload = inputType === 'text' 
        ? { text: textInput }
        : { url: urlInput };

      const response = await fetch(`${BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      onResults(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze content. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fake-news-page">
      {/* Header with Back Button */}
      <header className="page-header">
        <button className="back-button" onClick={() => onNavigate('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
        <h1>Fake News Detection</h1>
      </header>

      {/* Main Content */}
      <div className="page-content">
        <div className="form-container">
          <h2>Verify Content Authenticity</h2>
          <p className="form-subtitle">Choose your input type and submit content for AI analysis</p>

          {/* Input Type Tabs */}
          <div className="input-tabs">
            <button
              className={`tab ${inputType === 'text' ? 'active' : ''}`}
              onClick={() => setInputType('text')}
            >
              Text Analysis
            </button>
            <button
              className={`tab ${inputType === 'url' ? 'active' : ''}`}
              onClick={() => setInputType('url')}
            >
              URL Analysis
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="verification-form">
            {inputType === 'text' ? (
              <div className="form-group">
                <label htmlFor="text-input">Enter Text to Analyze</label>
                <textarea
                  id="text-input"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste the news text or claim you want to verify..."
                  rows="8"
                  required
                />
                <span className="char-count">{textInput.length} characters</span>
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="url-input">Enter URL to Analyze</label>
                <input
                  id="url-input"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article"
                  required
                />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Analyze Content
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="info-box">
            <h3>How it works</h3>
            <ul>
              <li>Our AI analyzes content for factual accuracy and logical consistency</li>
              <li>We compare claims against established facts and credible sources</li>
              <li>Results include confidence scores and detailed rationale</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
