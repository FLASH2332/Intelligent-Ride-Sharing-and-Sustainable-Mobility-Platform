import React, { useState } from 'react';
import { Leaf, Users, TrendingUp, Shield, Car, Sprout } from 'lucide-react';

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [userType, setUserType] = useState('employee');

  const openAuth = (type) => {
    setAuthType(type);
    setShowAuth(true);
  };

  if (showAuth) {
    return <AuthFlow authType={authType} userType={userType} setUserType={setUserType} onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm fixed w-full z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-stone-800">GreenCommute</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => openAuth('login')}
              className="px-5 py-2 text-stone-700 hover:text-emerald-700 transition-colors font-medium"
            >
              Sign In
            </button>
            <button 
              onClick={() => openAuth('signup')}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-medium text-emerald-800">Sustainable Corporate Mobility</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-stone-900 mb-6 leading-tight">
                Share rides.<br />
                Save the planet.
              </h1>
              <p className="text-xl text-stone-600 mb-8 leading-relaxed">
                Connect with colleagues heading your way. Reduce emissions, cut costs, 
                and build a greener workplace culture—one shared journey at a time.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => openAuth('signup')}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold text-lg shadow-lg shadow-emerald-600/20"
                >
                  Start Carpooling
                </button>
                <button className="px-8 py-4 border-2 border-stone-300 text-stone-700 rounded-lg hover:border-emerald-600 hover:text-emerald-700 transition-all font-semibold text-lg">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(20,184,166,0.1),transparent_50%)]"></div>
                <Car className="w-full h-full text-emerald-700 opacity-20 absolute inset-0 m-auto" />
                <div className="relative z-10 space-y-6">
                  <StatCard value="2.4k" label="CO₂ Tons Saved" />
                  <StatCard value="850+" label="Active Carpoolers" />
                  <StatCard value="12k" label="Shared Rides" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-900 mb-4">
              Why Choose GreenCommute?
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              A complete platform designed for modern organizations committed to sustainability
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Leaf className="w-8 h-8" />}
              title="Environmental Impact"
              description="Track real-time CO₂ savings, earn sustainability points, and contribute to your organization's ESG goals."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Smart Matching"
              description="AI-powered route matching connects you with colleagues along your commute path automatically."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8" />}
              title="Safety First"
              description="Verified corporate email domains, driver document checks, and real-time trip tracking for peace of mind."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8" />}
              title="Gamification"
              description="Earn points, climb leaderboards, unlock rewards, and make sustainable commuting fun and engaging."
            />
            <FeatureCard 
              icon={<Car className="w-8 h-8" />}
              title="Flexible Options"
              description="Whether you drive or ride, choose car or bike, and find the perfect match for your schedule."
            />
            <FeatureCard 
              icon={<Sprout className="w-8 h-8" />}
              title="Cost Savings"
              description="Split fuel costs fairly, reduce vehicle maintenance, and save money while reducing your carbon footprint."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-emerald-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Commute?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of colleagues already making a difference
          </p>
          <button 
            onClick={() => openAuth('signup')}
            className="px-10 py-4 bg-white text-emerald-900 rounded-lg hover:bg-emerald-50 transition-all font-semibold text-lg shadow-xl"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-stone-900 text-stone-400">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">GreenCommute</span>
          </div>
          <p className="text-sm">© 2026 GreenCommute. Building a sustainable future, one ride at a time.</p>
        </div>
      </footer>
    </div>
  );
};

const StatCard = ({ value, label }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-200">
    <div className="text-3xl font-bold text-emerald-700 mb-1">{value}</div>
    <div className="text-sm text-stone-600">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-6 rounded-xl border border-stone-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 bg-stone-50">
    <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-stone-900 mb-3">{title}</h3>
    <p className="text-stone-600 leading-relaxed">{description}</p>
  </div>
);

const AuthFlow = ({ authType, userType, setUserType, onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    otp: ''
  });
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authType === 'signup' && step === 1) {
      setStep(2); // Move to OTP verification
    } else {
      // Handle login or final signup
      console.log('Form submitted', formData);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="mb-6 text-stone-600 hover:text-emerald-700 transition-colors flex items-center gap-2 font-medium"
        >
          ← Back to home
        </button>

        {/* Auth Card */}
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
            {authType === 'login' ? 'Welcome Back' : step === 1 ? 'Get Started' : 'Verify Email'}
          </h2>
          <p className="text-stone-600 text-center mb-8">
            {authType === 'login' 
              ? 'Sign in to continue your journey' 
              : step === 1 
              ? 'Create your account to start carpooling' 
              : 'We sent a code to your email'}
          </p>

          {/* User Type Selection (Only for signup) */}
          {authType === 'signup' && step === 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-stone-700 mb-3">I am a</label>
              <div className="grid grid-cols-3 gap-2">
                <UserTypeButton 
                  active={userType === 'employee'} 
                  onClick={() => setUserType('employee')}
                  label="Employee"
                />
                <UserTypeButton 
                  active={userType === 'org-admin'} 
                  onClick={() => setUserType('org-admin')}
                  label="Org Admin"
                />
                <UserTypeButton 
                  active={userType === 'platform-admin'} 
                  onClick={() => setUserType('platform-admin')}
                  label="Platform Admin"
                />
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {authType === 'signup' && step === 1 && (
              <>
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
            )}

            {authType === 'signup' && step === 2 && (
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
                  Didn't receive code? <button type="button" className="text-emerald-600 hover:text-emerald-700 font-medium">Resend</button>
                </p>
              </>
            )}

            {authType === 'login' && (
              <>
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
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg shadow-emerald-600/20"
            >
              {authType === 'login' ? 'Sign In' : step === 1 ? 'Continue' : 'Verify & Complete'}
            </button>
          </form>

          {/* Toggle Auth Type */}
          <p className="text-center text-stone-600 mt-6">
            {authType === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={onBack}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              {authType === 'login' ? 'Sign up' : 'Sign in'}
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

const UserTypeButton = ({ active, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
      active 
        ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
    }`}
  >
    {label}
  </button>
);

const InputField = ({ label, type, name, value, onChange, placeholder, required, hint, maxLength }) => (
  <div>
    <label className="block text-sm font-medium text-stone-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
    />
    {hint && <p className="text-xs text-stone-500 mt-1">{hint}</p>}
  </div>
);

export default LandingPage;
