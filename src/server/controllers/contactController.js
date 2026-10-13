import sendEmail from '../sendEmail';
import { json, readBody } from '../http';

export const submitContact = async (request) => {
  const { name, email, message } = await readBody(request);

  if (!name || !email || !message) {
    return json({
      success: false,
      message: 'Please provide name, email, and a message.'
    }, 400);
  }

  try {
    await sendEmail({
      // The email goes TO you
      email: process.env.MY_EMAIL,
      subject: `Marketplace Inquiry from ${name}`,
      text: `You have a new message from the contact form:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #1e293b;">New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `
    });

    return json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.'
    }, 200);
  } catch (error) {
    console.error("Nodemailer Error:", error);
    return json({
      success: false,
      message: 'Server error: Could not send email. Please try again later.'
    }, 500);
  }
};
