import { useState } from 'react';
import HomePage from './components/Home';
import FakeNewsPage from './components/FakeNewsPage';
import DeepfakeImagePage from './components/DeepFakePage';
import ResultsPage from './components/ResultsPage';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [results, setResults] = useState(null);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleResults = (data) => {
    setResults(data);
    setCurrentPage('results');
  };

  return (
    <div className="app-container">
      {currentPage === 'home' && (
        <HomePage onNavigate={handleNavigate} />
      )}
      {currentPage === 'fake-news' && (
        <FakeNewsPage onNavigate={handleNavigate} onResults={handleResults} />
      )}
      {currentPage === 'deepfake-image' && (
        <DeepfakeImagePage onNavigate={handleNavigate} onResults={handleResults} />
      )}
      {currentPage === 'results' && (
        <ResultsPage data={results} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
