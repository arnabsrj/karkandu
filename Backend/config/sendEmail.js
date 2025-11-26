import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API);

const sendEmail = async ({ sendTo, subject, html }) => {
  try {
    // 1. Check API Key
    if (!process.env.RESEND_API) {
      console.error("❌ ERROR: RESEND_API is missing in .env file");
      return;
    }

    console.log(`📧 Attempting to send email to: ${sendTo}`);

    const { data, error } = await resend.emails.send({
      // ✅ ALWAYS use this 'from' address for testing
      from: 'onboarding@resend.dev', 
      to: sendTo,
      subject: subject,
      html: html,
    });

   // ❌ FIX: If Resend returns an error, THROW it!
    if (error) {
      console.error("❌ Resend API Error:", error);
      throw new Error(error.message); 
    }

    console.log("✅ Email sent successfully. ID:", data.id);
    return data;
  } catch (error) {
    console.error("❌ System Error in sendEmail:", error);
    // Don't throw error so registration doesn't crash
  }
};

export default sendEmail;