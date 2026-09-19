import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import tt from '../assets/testtube.png';
import menu from '../assets/menu.png';
import close from '../assets/close.png';
import defaultProfilePic from '../assets/profile.webp'; 

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isNotHome = location.pathname !== '/';
  const [navMenu, setNavMenu] = useState(false);
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setProfilePic(localStorage.getItem("profilePic"));
      setRole(localStorage.getItem("role"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleMenu = () => {
    setNavMenu((prev) => !prev);
  };

  const handleLinkClick = (path) => {
    setNavMenu(false);
    navigate(path);
  };

  useEffect(() => {
    setNavMenu(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profilePic");
    localStorage.removeItem("role");
    setProfilePic(null);
    setRole(null);
    window.dispatchEvent(new Event("storage")); // Dispatch event to notify App.jsx
    navigate("/login");
  };

  return (
    <nav className={`nav ${navMenu ? 'nav-mobile-open' : ''}`}>
      <div className='icon-con' onClick={toggleMenu}>
        <img className='icon' src={navMenu ? close : menu} alt='menu' />
      </div>
      <div className='logo'>
        <span>
          <Link to='/' className={isNotHome ? 'active-link' : ''}>
            <img src={tt} alt='logo' />
            Haemax
          </Link>
        </span>
      </div>
      <ul className={`nav-links ${navMenu ? 'nav-links-mobile-open' : ''}`}>
        <li>
          <span
            onClick={() => handleLinkClick('/')}
            style={{
              cursor: 'pointer',
              color: location.pathname === '/' ? '#fefefe' : 'rgba(252, 70, 70, 0.8)',
            }}
          >
            Home
          </span>
        </li>
        <li>
          <span
            onClick={() => handleLinkClick('/explore')}
            style={{
              cursor: 'pointer',
              color: location.pathname !== '/' ? 'rgba(252, 70, 70, 0.8)' : '#fefefe',
            }}
          >
            Explore
          </span>
        </li>
        <li>
          <span
            onClick={() => handleLinkClick('/about')}
            style={{
              cursor: 'pointer',
              color: location.pathname !== '/' ? 'rgba(252, 70, 70, 0.8)' : '#fefefe',
            }}
          >
            About Us
          </span>
        </li>
        <li>
          <span
            onClick={() => handleLinkClick('/form')}
            style={{
              cursor: 'pointer',
              color: location.pathname !== '/' ? 'rgba(252, 70, 70, 0.8)' : '#fefefe',
            }}
          >
            Register Donor
          </span>
        </li>
        {role === 'admin' && (
          <li>
            <span
              onClick={() => handleLinkClick('/admin')}
              style={{
                cursor: 'pointer',
                color: location.pathname === '/admin' ? '#fefefe' : 'rgba(252, 70, 70, 0.8)',
                fontWeight: 'bold'
              }}
            >
              Admin Panel
            </span>
          </li>
        )}
      </ul>

      {/* Show profile picture if logged in, otherwise show login button */}
      {profilePic ? (
        <div className="profile-container">
          <img
            src={profilePic || defaultProfilePic}
            alt="Profile"
            className="profile-pic"
            onClick={() => navigate('/dashboard')} // Navigate to dashboard on click
            style={{ cursor: 'pointer' }}
          />
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <Link to='/login'>
          <button className='signup-btn'>Login</button>
        </Link>
      )}
    </nav>
  );
}

export default Navbar;
