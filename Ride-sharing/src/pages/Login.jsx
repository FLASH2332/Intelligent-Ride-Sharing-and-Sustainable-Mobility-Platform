import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Shield } from 'lucide-react';
import InputField from '../components/InputField';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement login API call
    console.log('Login submitted', formData);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="mb-6 text-stone-600 hover:text-emerald-700 transition-colors flex items-center gap-2 font-medium"
        >
          ← Back to home
        </button>

        {/* Login Card */}
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
            Welcome Back
          </h2>
          <p className="text-stone-600 text-center mb-8">
            Sign in to continue your journey
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField 
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@company.com"
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
            <div className="flex justify-end">
              <button type="button" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg shadow-emerald-600/20"
            >
              Sign In
            </button>
          </form>

          {/* Toggle to Signup */}
          <p className="text-center text-stone-600 mt-6">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/signup')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Sign up
            </button>
          </p>
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

export default Login;
