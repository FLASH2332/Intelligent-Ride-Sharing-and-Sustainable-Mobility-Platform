import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Shield } from 'lucide-react';
import InputField from '../components/InputField';
import UserTypeSelector from '../components/UserTypeSelector';
import { authService } from '../services/authService';

const Signup = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('employee');
  const [step, setStep] = useState(1); // 1: Details, 2: OTP Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate form
      if (!validateForm()) {
        return;
      }
      
      // Send OTP to email
      setLoading(true);
      setError('');
      
      const result = await authService.sendOTP(formData.email);
      
      if (result.success) {
        setStep(2);
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
      
      setLoading(false);
    } else {
      // Verify OTP and complete signup
      setLoading(true);
      setError('');

      // First verify OTP
      const otpResult = await authService.verifyOTP(formData.email, formData.otp);

      if (!otpResult.success) {
        setError(otpResult.error || 'Invalid OTP. Please try again.');
        setLoading(false);
        return;
      }

      // OTP verified, now create account
      const signupResult = await authService.signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        userType
      });

      if (signupResult.success) {
        // Signup successful, redirect to login
        navigate('/login');
      } else {
        setError(signupResult.error || 'Signup failed. Please try again.');
      }

      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    setError('');
    
    const result = await authService.resendOTP(formData.email);
    
    if (result.success) {
      setError(''); // Clear any error
      // Could show a success message here
      console.log('OTP resent successfully');
    } else {
      setError(result.error || 'Failed to resend OTP. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={() => step === 1 ? navigate('/') : setStep(1)}
          className="mb-6 text-stone-600 hover:text-emerald-700 transition-colors flex items-center gap-2 font-medium"
        >
          ← {step === 1 ? 'Back to home' : 'Back to details'}
        </button>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-stone-800">GreenCommute</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-stone-900 text-center mb-2">
            {step === 1 ? 'Get Started' : 'Verify Email'}
          </h2>
          <p className="text-stone-600 text-center mb-8">
            {step === 1 
              ? 'Create your account to start carpooling' 
              : `We sent a code to ${formData.email}`}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                {/* User Type Selection */}
                <UserTypeSelector 
                  userType={userType}
                  setUserType={setUserType}
                />

                <InputField 
                  label="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
                <InputField 
                  label="Corporate Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@company.com"
                  required
                  hint="Use your company email address"
                />
                <InputField 
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                />
                <InputField 
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <InputField 
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </>
            ) : (
              <>
                <InputField 
                  label="Enter OTP"
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="000000"
                  required
                  maxLength="6"
                />
                <p className="text-sm text-stone-600 text-center">
                  Didn&apos;t receive code?{' '}
                  <button 
                    type="button" 
                    onClick={resendOTP}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Resend
                  </button>
                </p>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 1 ? 'Continue' : loading ? 'Verifying...' : 'Verify & Complete'}
            </button>
          </form>

          {/* Toggle to Login */}
          {step === 1 && (
            <p className="text-center text-stone-600 mt-6">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        {/* Trust Badge */}
        <div className="mt-6 text-center text-sm text-stone-500 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Secure authentication with corporate email verification</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
