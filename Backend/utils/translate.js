// backend/utils/translate.js
import { Translate } from '@google-cloud/translate';

// Your Google Cloud Project ID (get from Google Cloud Console)
const projectId = 'your-google-project-id'; // CHANGE THIS
const translate = new Translate({ projectId });

export const translateToTamil = async (text) => {
  if (!text || text.trim() === '') return text;

  try {
    const [translation] = await translate.translate(text, {
      from: 'en',
      to: 'ta' // Tamil
    });
    return translation;
  } catch (err) {
    console.error('Translation failed:', err.message);
    return text; // fallback to original if fails
  }
};