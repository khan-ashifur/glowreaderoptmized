import { useState } from 'react';
import TypingOutput from './components/TypingOutput';

function App() {
  const [skinType, setSkinType] = useState('');
  const [customSkinType, setCustomSkinType] = useState('');
  const [concern, setConcern] = useState('');
  const [customConcern, setCustomConcern] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setAiResponse('');

    const finalSkinType = skinType === 'Other' ? customSkinType : skinType;
    const finalConcern = concern === 'Other' ? customConcern : concern;

    try {
      const res = await fetch('http://localhost:4000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skinType: finalSkinType, concern: finalConcern }),
      });

      const data = await res.json();
      setAiResponse(data.result || 'Oops! No response received.');
    } catch (err) {
      console.error(err);
      setAiResponse('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-gray-800 font-sans p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-pink-600 text-center mb-6">GlowReader ✨</h1>

        {/* Upload Placeholder */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">Upload a selfie 📸</label>
          <input type="file" accept="image/*" className="w-full border p-2 rounded" disabled />
          <p className="text-xs text-gray-500 mt-1">📌 Image upload coming soon!</p>
        </div>

        {/* Skin Type & Concern */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-semibold">Skin Type</label>
            <select
              className="w-full border p-2 rounded"
              value={skinType}
              onChange={(e) => setSkinType(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Normal">Normal</option>
              <option value="Oily">Oily</option>
              <option value="Dry">Dry</option>
              <option value="Combination">Combination</option>
              <option value="Sensitive">Sensitive</option>
              <option value="Other">Other</option>
            </select>
            {skinType === 'Other' && (
              <input
                type="text"
                placeholder="Enter your skin type"
                className="w-full mt-2 border p-2 rounded"
                value={customSkinType}
                onChange={(e) => setCustomSkinType(e.target.value)}
              />
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold">Main Concern</label>
            <select
              className="w-full border p-2 rounded"
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Acne">Acne</option>
              <option value="Dark Spots">Dark Spots</option>
              <option value="Wrinkles">Wrinkles</option>
              <option value="Redness">Redness</option>
              <option value="Uneven Tone">Uneven Tone</option>
              <option value="Other">Other</option>
            </select>
            {concern === 'Other' && (
              <input
                type="text"
                placeholder="Enter your concern"
                className="w-full mt-2 border p-2 rounded"
                value={customConcern}
                onChange={(e) => setCustomConcern(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Analyze Button */}
        <div className="text-center mb-6">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300"
          >
            {loading ? '✨ Analyzing...' : '🔍 Analyze My Skin'}
          </button>
        </div>

        {/* Typing Output */}
        <div className="bg-white border shadow-sm rounded p-4 h-60 overflow-y-auto">
          {loading ? (
            <p className="text-pink-400 font-mono">💬 Talking to your skincare bestie...</p>
          ) : aiResponse ? (
            <TypingOutput text={aiResponse} />
          ) : (
            <p className="text-sm font-mono text-pink-500">🧠 Waiting for your glow analysis...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
