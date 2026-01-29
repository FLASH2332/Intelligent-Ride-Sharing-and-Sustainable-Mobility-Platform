import { sendOTPEmail } from '../services/emailService.js';

// In-memory OTP storage (for production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to email
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
    });

    // Send OTP email
    const result = await sendOTPEmail(email, otp);

    if (result.success) {
      res.status(200).json({
        message: 'OTP sent successfully',
        expiresIn: 600, // 10 minutes in seconds
      });
    } else {
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Check attempts (max 3 attempts)
    if (storedData.attempts >= 3) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'Maximum attempts exceeded' });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      return res.status(400).json({
        message: 'Invalid OTP',
        attemptsLeft: 3 - storedData.attempts,
      });
    }

    // OTP verified successfully
    otpStore.delete(email);
    res.status(200).json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if previous OTP exists
    const existingData = otpStore.get(email);
    if (existingData && Date.now() < existingData.expiresAt) {
      // Allow resend only after 1 minute
      const timeSinceCreation = Date.now() - (existingData.expiresAt - 10 * 60 * 1000);
      if (timeSinceCreation < 60 * 1000) {
        return res.status(400).json({
          message: 'Please wait before requesting a new OTP',
          waitTime: Math.ceil((60 * 1000 - timeSinceCreation) / 1000),
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();

    // Store new OTP
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });

    // Send OTP email
    const result = await sendOTPEmail(email, otp);

    if (result.success) {
      res.status(200).json({
        message: 'OTP resent successfully',
        expiresIn: 600,
      });
    } else {
      res.status(500).json({ message: 'Failed to resend OTP' });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};
