import React from "react";

export default function TypingOutput({ text }) {
  return (
    <div className="response-box">
      💬 {text}
    </div>
  );
}
