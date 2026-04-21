import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { TrendingUp, BarChart3, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { user, loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups for this site.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-grid" />

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <TrendingUp size={30} />
          </div>
          <h1>StockAnalyzer</h1>
          <p>Smart stock analysis powered by data.<br />Track, analyze, and simulate investments.</p>
        </div>

        {/* Feature highlights */}
        <div className="login-features">
          <div className="login-feature">
            <div className="login-feature-icon">
              <BarChart3 size={14} />
            </div>
            <span>Live Charts</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">
              <TrendingUp size={14} />
            </div>
            <span>Top Stocks</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">
              <Shield size={14} />
            </div>
            <span>Watchlist</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">
              <Zap size={14} />
            </div>
            <span>Simulator</span>
          </div>
        </div>

        {/* Divider */}
        <div className="login-divider">
          <span>Continue with</span>
        </div>

        {/* Google Sign In */}
        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          id="google-signin-btn"
        >
          {isLoading ? (
            <div className="login-loading" />
          ) : (
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>{isLoading ? 'Signing in…' : 'Sign in with Google'}</span>
        </button>

        {/* Error */}
        {error && <div className="login-error">{error}</div>}

        {/* Footer */}
        <div className="login-footer">
          By signing in, you agree to our<br />
          <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
