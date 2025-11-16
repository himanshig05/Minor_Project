import { useState } from 'react';
import './DeepfakePage.css';
import { BASE_URL } from '../helper';

export default function DeepfakePage({ onNavigate, onResults }) {
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setFileName(file.name);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', videoFile);

      const response = await fetch(`${BASE_URL}/api/verify-video`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Video analysis failed');
      const data = await response.json();
      onResults(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze video. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="deepfake-page">
      {/* Header with Back Button */}
      <header className="page-header">
        <button className="back-button" onClick={() => onNavigate('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
        <h1>Deepfake Detection</h1>
      </header>

      {/* Main Content */}
      <div className="page-content">
        <div className="form-container">
          <h2>Analyze Video for Deepfakes</h2>
          <p className="form-subtitle">Upload a video file to detect synthetic or manipulated content</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="verification-form">
            <div className="file-upload-group">
              <div className="file-upload-box">
                <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <h3>Upload Video File</h3>
                <p>Drag and drop or click to select</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </div>

              {fileName && (
                <div className="file-selected">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>{fileName}</span>
                </div>
              )}

              <label htmlFor="file-input" className="form-label">
                Supported formats: MP4, WebM, AVI, MOV
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button" disabled={loading || !videoFile}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing Video...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                  Detect Deepfakes
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="info-box">
            <h3>Detection Technology</h3>
            <ul>
              <li>Advanced deep learning models detect facial manipulation patterns</li>
              <li>Analyzes frame-by-frame consistency and temporal anomalies</li>
              <li>Identifies compression artifacts and synthetic generation signatures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
