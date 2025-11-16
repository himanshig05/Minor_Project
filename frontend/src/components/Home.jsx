import "./Home.css";

export default function HomePage({ onNavigate }) {
  return (
    <div className="home-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Authenticity Analysis</h1>
          {/* <p className="tagline">Trust verification powered by AI</p> */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2 className="hero-title">Detect Misinformation & Deepfakes</h2>
          <p className="hero-subtitle">
            Verify content authenticity with advanced AI detection tools. Protect yourself from fake news and manipulated media.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-container">
        {/* Fake News Detection Card */}
        <div className="feature-card fake-news-card" onClick={() => onNavigate('fake-news')}>
          <div className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
          </div>
          <h3 className="card-title">Fake News Detection</h3>
          <p className="card-description">
            Analyze text and URLs to detect false or misleading information
          </p>
          <button className="card-button">Analyze Text or URL</button>
        </div>

        {/* Deepfake Detection Card */}
        <div className="feature-card deepfake-card" onClick={() => onNavigate('deepfake')}>
          <div className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <h3 className="card-title">Deepfake Detection</h3>
          <p className="card-description">
            Identify manipulated or synthetically generated videos with AI analysis
          </p>
          <button className="card-button">Upload Video</button>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <div className="info-content">
          <h2>Why Verification Matters</h2>
          <div className="info-grid">
            <div className="info-item">
              <h4>Combat Misinformation</h4>
              <p>Stop false narratives before they spread across social media</p>
            </div>
            <div className="info-item">
              <h4>Detect Media Manipulation</h4>
              <p>Identify deepfakes and synthetic content with precision</p>
            </div>
            <div className="info-item">
              <h4>Make Informed Decisions</h4>
              <p>Base your opinions on verified, authentic information</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Authenticity Analysis. All rights reserved.</p>
      </footer>
    </div>
  );
}
