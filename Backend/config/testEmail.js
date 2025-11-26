import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API);

(async function() {
  console.log("Testing email...");
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'YOUR_REAL_EMAIL@gmail.com', // <--- REPLACE THIS WITH YOUR REAL EMAIL
      subject: 'Test Email',
      html: '<p>If you see this, your API key works!</p>'
    });

    if (error) {
      console.error('Failed:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Crash:', err);
  }
})();