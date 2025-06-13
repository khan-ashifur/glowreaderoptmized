import { useEffect, useState } from 'react';

function TypingOutput({ text }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20); // Typing speed
    return () => clearInterval(interval);
  }, [text]);

  return <div className="whitespace-pre-wrap font-mono text-sm">{displayedText}</div>;
}

export default TypingOutput;
