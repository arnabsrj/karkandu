// server/utils/emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER, // Add this to your .env file
    pass: process.env.EMAIL_PASS, // Add this to your .env file (App Password, not login password)
  },
});

export const sendNewsletter = async (subscribers, blogTitle, blogSlug) => {
  if (!subscribers.length) return;

  const blogLink = `${process.env.CLIENT_URL}/blogs/${blogSlug}`;

  const mailOptions = {
    from: `"Tamil Wisdom" <${process.env.EMAIL_USER}>`,
    subject: `New Blog Published: ${blogTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #ddd;">
        <h2 style="color: #d35400;">புதிய ஆன்மீக பதிவு</h2>
        <h3>${blogTitle}</h3>
        <p>வணக்கம், புதிய ஆன்மீக தகவல் பதிவிடப்பட்டுள்ளது. படிக்க கீழே உள்ள லிங்கை கிளிக் செய்யவும்.</p>
        <a href="${blogLink}" style="display: inline-block; background: #d35400; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          மேலும் படிக்க (Read More)
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">To unsubscribe, please contact support.</p>
      </div>
    `,
  };

  // Send to all subscribers (BCC to hide emails from each other)
  mailOptions.bcc = subscribers.map(sub => sub.email);

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Newsletter sent to ${subscribers.length} subscribers.`);
  } catch (error) {
    console.error('Error sending newsletter:', error);
  }
};