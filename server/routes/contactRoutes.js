const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please provide name, email, and a message.' 
        });
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

        res.status(200).json({ 
            success: true, 
            message: 'Thank you! Your message has been sent successfully.' 
        });
    } catch (error) {
        console.error("Nodemailer Error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: Could not send email. Please try again later.' 
        });
    }
});

module.exports = router;