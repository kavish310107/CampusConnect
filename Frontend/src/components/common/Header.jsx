import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiChevronDown, FiHome, FiBook, FiUsers, FiCalendar } from 'react-icons/fi';
import logo from './logo.png'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          <Link to="/" className="brand">
            <div className="brand-logo">
              <div className="logo-icon">
                <img src={logo} alt='logo' style={{height:'50px',width:'50px'}}></img>
              </div>
              <span className="brand-text"><h2>CampusConnect</h2></span>
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>

          {/* User Actions */}
          <div className={`header-actions ${isMenuOpen ? 'mobile-open' : ''}`}>
            {!isAuthenticated ? (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-ghost" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                <Link to="/signup" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
              </div>
            ) : (
              <div className="user-menu">
                <button 
                  className="user-button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                >
                  <div className="user-avatar">
                    <FiUser />
                  </div>
                  <span className="user-name">{user?.name || user?.email}</span>
                  <FiChevronDown className={`dropdown-icon ${isProfileOpen ? 'open' : ''}`} />
                </button>
                
                {isProfileOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="user-avatar large">
                        <FiUser />
                      </div>
                      <div>
                        <div className="user-name">{user?.name || 'User'}</div>
                        <div className="user-email">{user?.email}</div>
                        <div className="user-role">{user?.role}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link 
                      to={`/dashboard/${user?.role === 'admin' ? 'admin' : user?.role === 'faculty' ? 'faculty' : 'student'}`} 
                      className="dropdown-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiHome /> Dashboard
                    </Link>
                    <Link 
                      to={`/dashboard/${user?.role}/profile`} 
                      className="dropdown-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiUser /> Profile
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <FiLogOut /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <nav className="mobile-nav">
              <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                <FiHome /> Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    to="/dashboard/student" 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiBook /> Dashboard
                  </Link>
                  <Link 
                    to="/dashboard/student/clubs" 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiUsers /> Clubs
                  </Link>
                  <Link 
                    to="/dashboard/student/events" 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiCalendar /> Events
                  </Link>
                  <Link 
                    to={`/dashboard/${user?.role}/profile`} 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiUser /> Profile
                  </Link>
                  <button 
                    className="mobile-nav-link logout" 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <FiLogOut /> Sign Out
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link 
                    to="/login" 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
