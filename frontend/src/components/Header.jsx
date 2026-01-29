import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm fixed w-full z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-stone-800">GreenCommute</span>
        </button>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-stone-700 hover:text-emerald-700 transition-colors font-medium"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Get Started
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
