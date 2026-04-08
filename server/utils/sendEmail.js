const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.EMAIL_PASSWORD 
    }
  });

  const mailOptions = {
    from: `"LetRank Marketplace" <${process.env.MY_EMAIL}>`, 
    to: options.email,
    subject: options.subject,
    html: options.html || options.text, 
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;