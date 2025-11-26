// src/pages/user/BlogDetails/ShareButtons.jsx
import React, { useState } from 'react';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaWhatsapp, 
  FaLink, 
  FaCheck 
} from 'react-icons/fa';
import './ShareButtons.css';

const ShareButtons = ({ title = "A spiritual journey" }) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' — ' + currentUrl)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  return (
    <div className="share-buttons">
      <p className="share-label">இந்த ஞானத்தை பகிருங்கள்:</p>
      <div className="share-icons">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="share-icon facebook"
          aria-label="Share on Facebook"
        >
          <FaFacebookF />
        </a>

        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="share-icon twitter"
          aria-label="Share on Twitter"
        >
          <FaTwitter />
        </a>

        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="share-icon whatsapp"
          aria-label="Share on WhatsApp"
        >
          <FaWhatsapp />
        </a>

        <button
          onClick={copyToClipboard}
          className={`share-icon copy ${copied ? 'copied' : ''}`}
          aria-label="Copy link"
        >
          {copied ? <FaCheck /> : <FaLink />}
          {copied && <span className="copied-tooltip">Copied!</span>}
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;