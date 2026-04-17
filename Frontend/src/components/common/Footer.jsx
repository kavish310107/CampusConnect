import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiLinkedin, FiGithub } from 'react-icons/fi';
import logo from './logo.png'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Main Footer Content */}
          <div className="footer-main">
            <div className="footer-section">
              <div className="footer-brand">
                <h3 className="footer-title">CampusConnect</h3>
                <p className="footer-description">
                  Connecting students, faculty, and campus resources in one unified platform.
                </p>
              </div>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-links">
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Contact Info</h4>
              <div className="footer-contact">
                <div className="contact-item">
                  <FiMapPin />
                  <span>Computer Science Dept,V.J.T.I</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p className="footer-copyright">
                © 2024 CampusConnect. All rights reserved.
              </p>
              <p className="footer-credits">
                Created with ❤️ by Kavish , Tirth
              </p>
            </div>

            <div className="footer-bottom-right">
              <div className="footer-social">
                <a href="https://facebook.com" className="social-link" aria-label="Facebook">
                  <FiFacebook />
                </a>
                <a href="https://twitter.com" className="social-link" aria-label="Twitter">
                  <FiTwitter />
                </a>
                <a href="https://linkedin.com" className="social-link" aria-label="LinkedIn">
                  <FiLinkedin />
                </a>
                <a href="https://github.com" className="social-link" aria-label="GitHub">
                  <FiGithub />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
