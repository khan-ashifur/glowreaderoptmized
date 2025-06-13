import { useState } from 'react';
import './App.css';
import { getGlowResponse } from './api';

function App() {
  const [skinType, setSkinType] = useState('Normal');
  const [concern, setConcern] = useState('Acne');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setResult('');

    const output = await getGlowResponse(skinType, concern);
    setResult(output);
    setLoading(false);
  };

  return (
    <div className="app">
      <h1>GlowReader ✨</h1>

      <p className="note">📌 Image upload coming soon!</p>

      <label>Skin Type</label>
      <select value={skinType} onChange={(e) => setSkinType(e.target.value)}>
        <option>Normal</option>
        <option>Oily</option>
        <option>Dry</option>
        <option>Combination</option>
      </select>

      <label>Main Concern</label>
      <select value={concern} onChange={(e) => setConcern(e.target.value)}>
        <option>Acne</option>
        <option>Redness</option>
        <option>Wrinkles</option>
        <option>Pigmentation</option>
      </select>

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? '✨ Analyzing...' : 'Analyze'}
      </button>

      <div className="output">{result && <p>{result}</p>}</div>
    </div>
  );
}

export default App;
