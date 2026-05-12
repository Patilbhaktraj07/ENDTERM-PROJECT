import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { TrendingUp, BarChart3, Shield, Zap, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { user, loginWithEmail, signupWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
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

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="login-form">
          {isSignUp && (
            <div className="form-group">
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? <div className="login-loading" /> : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="login-toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" className="toggle-btn" onClick={() => setIsSignUp(!isSignUp)} disabled={isLoading}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>



        {/* Error */}
        {error && <div className="login-error">{error}</div>}

        {/* Footer */}
        <div className="login-footer">
          By continuing, you agree to our<br />
          <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
