import './ResultsPage.css';

export default function ResultsPage({ data, onNavigate }) {
  if (!data) return null;

  const isFakeNewsResult = data.result && data.result.verdict;
  
  if (isFakeNewsResult) {
    // Fake News Detection Result Format
    const result = data.result;
    const verdict = result.verdict;
    const isFake = result.is_fake;
    const confidence = (result.confidence * 100).toFixed(1);

    return (
      <div className="results-page">
        {/* Header */}
        <header className="page-header">
          <button className="back-button" onClick={() => onNavigate('home')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Home
          </button>
          <h1>Analysis Results</h1>
        </header>

        {/* Main Content */}
        <div className="page-content">
          <div className="results-container">
            {/* Verdict Card */}
            <div className={`verdict-card ${isFake ? 'fake' : 'authentic'}`}>
              <div className="verdict-icon">
                {isFake ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                )}
              </div>
              <h2 className="verdict-title">
                {isFake ? 'Likely Fake' : 'Likely Authentic'}
              </h2>
              <p className="verdict-subtitle">
                {isFake 
                  ? 'This content appears to be false or misleading'
                  : 'This content appears to be genuine'
                }
              </p>
            </div>

            {/* Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Verdict</h3>
                <p className={`metric-value ${verdict === 'FAKE' ? 'fake' : 'authentic'}`}>
                  {verdict}
                </p>
              </div>
              <div className="metric-card">
                <h3>Confidence Score</h3>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ 
                      width: `${confidence}%`,
                      backgroundColor: isFake ? '#ff6b6b' : '#51cf66'
                    }}
                  />
                </div>
                <p className="metric-value">{confidence}%</p>
              </div>
              <div className="metric-card">
                <h3>Input Length</h3>
                <p className="metric-value">{data.input_length} chars</p>
              </div>
            </div>

            {/* Rationale */}
            <div className="rationale-card">
              <h3>Analysis Details</h3>
              <div className="rationale-content">
                <p>{result.rationale}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="button-primary"
                onClick={() => onNavigate('fake-news')}
              >
                Analyze Another Text
              </button>
              <button 
                className="button-secondary"
                onClick={() => onNavigate('home')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    const results = Array.isArray(data) ? data : [];
    const realResult = results.find(r => r.label === 'Real');
    const fakeResult = results.find(r => r.label === 'Fake');
    
    const realScore = realResult ? (realResult.score * 100).toFixed(1) : 0;
    const fakeScore = fakeResult ? (fakeResult.score * 100).toFixed(1) : 0;
    const isFake = fakeScore > realScore;

    return (
      <div className="results-page">
        {/* Header */}
        <header className="page-header">
          <button className="back-button" onClick={() => onNavigate('home')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Home
          </button>
          <h1>Image Analysis Results</h1>
        </header>

        {/* Main Content */}
        <div className="page-content">
          <div className="results-container">
            {/* Verdict Card */}
            <div className={`verdict-card ${isFake ? 'fake' : 'authentic'}`}>
              <div className="verdict-icon">
                {isFake ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                )}
              </div>
              <h2 className="verdict-title">
                {isFake ? 'Likely Deepfake' : 'Likely Real'}
              </h2>
              <p className="verdict-subtitle">
                {isFake 
                  ? 'This image appears to be synthetically generated or manipulated'
                  : 'This image appears to be authentic'
                }
              </p>
            </div>

            {/* Classification Scores */}
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Real Score</h3>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ 
                      width: `${realScore}%`,
                      backgroundColor: '#51cf66'
                    }}
                  />
                </div>
                <p className="metric-value">{realScore}%</p>
              </div>
              <div className="metric-card">
                <h3>Fake Score</h3>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ 
                      width: `${fakeScore}%`,
                      backgroundColor: '#ff6b6b'
                    }}
                  />
                </div>
                <p className="metric-value">{fakeScore}%</p>
              </div>
            </div>

            {/* Classification Details */}
            <div className="rationale-card">
              <h3>Classification Details</h3>
              <div className="rationale-content">
                <div className="classification-list">
                  {results.map((result, index) => (
                    <div key={index} className="classification-item">
                      <span className="label">{result.label}</span>
                      <span className="score">{(result.score * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="button-primary"
                onClick={() => onNavigate('deepfake-image')}
              >
                Analyze Another Image
              </button>
              <button 
                className="button-secondary"
                onClick={() => onNavigate('home')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
