import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
  // Using Gmail as example - you can configure for other services
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
    },
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"GreenCommute" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for GreenCommute Signup',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🍃 GreenCommute</h1>
          </div>
          <div style="background: #f9fafb; padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Welcome to GreenCommute! Please use the following OTP to complete your signup:
            </p>
            <div style="background: white; border: 2px solid #059669; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <h1 style="color: #059669; font-size: 36px; letter-spacing: 8px; margin: 0;">
                ${otp}
              </h1>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} GreenCommute. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after successful signup
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"GreenCommute" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to GreenCommute! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🍃 GreenCommute</h1>
          </div>
          <div style="background: #f9fafb; padding: 40px 30px;">
            <h2 style="color: #1f2937;">Welcome, ${name}! 🎉</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Thank you for joining GreenCommute! We're excited to have you on board.
            </p>
            <p style="color: #4b5563; font-size: 16px;">
              Start your journey towards sustainable mobility and save the environment while saving money!
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" 
                 style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Get Started
              </a>
            </div>
          </div>
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} GreenCommute. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};
