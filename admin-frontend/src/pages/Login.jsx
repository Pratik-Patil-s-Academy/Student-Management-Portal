import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.jpeg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
      <div className="w-full max-w-md p-8 rounded-xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg overflow-hidden" style={{ backgroundColor: '#2C3E50' }}>
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
            Admin Portal
          </h2>
          <p className="text-gray-500 text-sm mt-2">Sign in to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-50 rounded-lg border-l-4 border-red-500 animate-shake">
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent hover:border-gray-400"
              style={{ borderColor: '#E0E0E0' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full px-4 py-3 pr-12 border-2 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent hover:border-gray-400"
                style={{ borderColor: '#E0E0E0' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#2C3E50] focus:ring-opacity-30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{ backgroundColor: '#2C3E50', color: '#FFFFFF' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
