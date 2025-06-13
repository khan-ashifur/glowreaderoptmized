import React, { useState } from "react";
import TypingOutput from "./components/TypingOutput";
import "./App.css";

function App() {
  const [skinType, setSkinType] = useState("Normal");
  const [concern, setConcern] = useState("Acne");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setResponse("Talking to your skincare bestie...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinType, concern }),
      });
      const data = await res.json();
      setResponse(data.result);
    } catch (err) {
      setResponse("Oops! Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>GlowReader ✨</h1>
      <p className="note">📌 Image upload coming soon!</p>

      <div className="form-section">
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
          <option>Wrinkles</option>
          <option>Dark Spots</option>
          <option>Sensitivity</option>
        </select>

        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? "✨ Analyzing..." : "Analyze"}
        </button>
      </div>

      <TypingOutput text={response} />
    </div>
  );
}

export default App;
