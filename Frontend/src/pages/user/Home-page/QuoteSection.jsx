import React, { useEffect, useRef, useState } from 'react';
import '../../User-Css/Home-css/QuoteSection.css';

const QuoteSection = () => {
  const quote = "The Tamil land is a divine heart — where the chant of the Vedas, the bell of the temples, and the grace of humanity echo as one.";
  const words = quote.split(' ');

  const [displayedWords, setDisplayedWords] = useState([]);
  const sectionRef = useRef(null);
  const animationRef = useRef({ isTyping: false, timeoutId: null });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animationRef.current.isTyping) {
          // Scroll down → type in
          startTyping();
        } else if (!entry.isIntersecting && displayedWords.length > 0) {
          // Scroll up → fade out from end
          startErasing();
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [displayedWords.length]);

  const startTyping = () => {
    animationRef.current.isTyping = true;
    let index = 0;
    const typeNext = () => {
      if (index < words.length) {
        setDisplayedWords((prev) => [...prev, words[index]]);
        index++;
        animationRef.current.timeoutId = setTimeout(typeNext, 120);
      } else {
        animationRef.current.isTyping = false;
      }
    };
    typeNext();
  };

  const startErasing = () => {
    let index = displayedWords.length;
    const eraseNext = () => {
      if (index > 0) {
        setDisplayedWords((prev) => prev.slice(0, -1));
        index--;
        animationRef.current.timeoutId = setTimeout(eraseNext, 80);
      }
    };
    eraseNext();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current.timeoutId) {
        clearTimeout(animationRef.current.timeoutId);
      }
    };
  }, []);

  return (
    <section className="quote-section" ref={sectionRef}>
      <div className="quote-container">
        <blockquote className="spiritual-quote">
          {displayedWords.map((word, i) => (
            <span
              key={i}
              className="quote-word"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {word}{' '}
            </span>
          ))}
          {displayedWords.length === words.length && (
            <span className="cursor">|</span>
          )}
        </blockquote>
        <p className="quote-author">— Ancient Tamil Wisdom</p>
      </div>
    </section>
  );
};

export default QuoteSection;