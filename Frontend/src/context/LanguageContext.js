import React, { createContext, useState, useContext } from 'react';
import { TAMIL } from '../utils/tamilText';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Default language is English ('en')
  const [lang, setLang] = useState('en');

  // Helper function to get text
  const t = (key) => {
    if (lang === 'ta') {
      return TAMIL[key] || key; // Return Tamil if exists, else key
    }
    // Assuming your default English text is just the key capitalized or a separate English object
    // For simplicity, let's assume English is the default fallback
    return key.charAt(0).toUpperCase() + key.slice(1); 
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ta' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);