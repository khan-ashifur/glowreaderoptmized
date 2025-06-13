import React, { useState } from 'react';
import { getGlowResponse } from '../api';

const TypingOutput = () => {
  const [skinType, setSkinType] = useState('');
  const [concern, setConcern] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!skinType || !concern) return alert("Please fill in both fields.");
    setLoading(true);
    const response = await getGlowResponse(skinType, concern);
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">GlowReader ✨</h2>

      <input
        className="border px-4 py-2 mb-2 w-full"
        placeholder="Enter your skin type (e.g., oily, dry)"
        value={skinType}
        onChange={(e) => setSkinType(e.target.value)}
      />

      <input
        className="border px-4 py-2 mb-2 w-full"
        placeholder="Enter your concern (e.g., acne, dullness)"
        value={concern}
        onChange={(e) => setConcern(e.target.value)}
      />

      <button
        className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Get Skincare Advice"}
      </button>

      {result && (
        <div className="mt-4 text-left whitespace-pre-wrap bg-gray-50 p-4 rounded shadow">
          {result}
        </div>
      )}
    </div>
  );
};

export default TypingOutput;
