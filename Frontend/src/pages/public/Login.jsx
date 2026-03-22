import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import PublicLayout from '../../layouts/PublicLayout';
import TextInput from '../../components/forms/TextInput';
import PasswordInput from '../../components/forms/PasswordInput';
import { login as apiLogin } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../components/common/logo.png';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  async function onSubmit(e){
    e.preventDefault(); 
    setError('');
    setIsLoading(true);
    
    try {
      const res = await apiLogin({ email, password });
      if (!res.ok) { 
        setError(res.error || 'Login failed'); 
        return; 
      }
      login(res.token, res.user);
      const role = res.user?.role;
      if (role === 'faculty') nav('/dashboard/faculty');
      else if (role === 'admin') nav('/dashboard/admin');
      else nav('/dashboard/student');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PublicLayout>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <img src={logo} alt="CampusConnect Logo" style={{height:'60px',width:'60px'}} />
            </div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your CampusConnect account</p>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FiMail /> Email Address
              </label>
              <TextInput 
                id="email"
                type="email" 
                placeholder="Enter your email"
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                required 
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FiLock /> Password
              </label>
              <div className="password-input-wrapper">
                <PasswordInput 
                  id="password"
                  placeholder="Enter your password"
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  required 
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className={`btn btn-primary btn-lg btn-full ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    Sign In
                    <FiArrowRight />
                  </>
                )}
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link">
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="auth-features">
          <div className="feature-item">
            <div className="feature-icon">
              <FiCheckCircle />
            </div>
            <div className="feature-content">
              <h3>Secure Authentication</h3>
              <p>Your data is protected with industry-standard encryption</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <FiCheckCircle />
            </div>
            <div className="feature-content">
              <h3>Role-Based Access</h3>
              <p>Tailored experience for students, faculty, and administrators</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <FiCheckCircle />
            </div>
            <div className="feature-content">
              <h3>Quick Access</h3>
              <p>Instant access to campus resources and announcements</p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
