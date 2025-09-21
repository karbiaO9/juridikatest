import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const languages = [
    { code: 'EN', name: 'English',  },
    { code: 'AR', name: 'العربية',  }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      navigate('/');
    }
  };

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'EN';
    setCurrentLanguage(savedLanguage);
    
    // Set i18next language
    if (savedLanguage === 'EN') {
      i18n.changeLanguage('en');
    } else if (savedLanguage === 'AR') {
      i18n.changeLanguage('ar');
    }
  }, [i18n]);

  const selectLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    setLanguageDropdownOpen(false);
    
    // Save language preference
    localStorage.setItem('selectedLanguage', langCode);
    
    // Change i18next language
    if (langCode === 'EN') {
      i18n.changeLanguage('en');
    } else if (langCode === 'AR') {
      i18n.changeLanguage('ar');
    }
  };


  return (
  <nav className={`nav-glass ${location.pathname.startsWith('/avocat') ? 'dashboard-mode' : ''}`}>
      <div className="nav-inner">
        {/* Logo/Brand */}
      <Logo/>
        {/* Hamburger icon for mobile */}
        <button className={`hamburger${mobileMenuOpen ? ' open' : ''}`} aria-label="Menu" onClick={() => setMobileMenuOpen(v => !v)}>
          <span/>
          <span/>
          <span/>
        </button>
        {/* Desktop nav links and actions */}
        <div className={`nav-desktop${mobileMenuOpen ? ' nav-mobile-open' : ''}`}>
          <ul className="nav-links">
            <li><a href="/about" className="nav-link">{t('nav.about')}</a></li>
            <li><a href="/avocats" className="nav-link">{t('nav.avocat')}</a></li>
            <li><a href="/Q&A" className="nav-link">{t('nav.faq')}</a></li>
            <li><a href="/contact" className="nav-link">{t('nav.contact')}</a></li>
          </ul>
          <div className="nav-actions" ref={dropdownRef}>
            {/* Translation Button with Dropdown */}
            <div className="language-dropdown">
              <button 
                className="translate-button" 
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                title="Select Language"
              >
                <span className="translate-text">{currentLanguage}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {languageDropdownOpen && (
                <div className="language-menu">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      className={`language-item ${currentLanguage === lang.code ? 'active' : ''}`}
                      onClick={() => selectLanguage(lang.code)}
                    >
                      <span className="language-flag">{lang.flag}</span>
                      <span className="language-name">{lang.name}</span>
                      <span className="language-code">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {user ? (
              <div className="dropdown">
                <button className="ghost-button dropdown-toggle" onClick={() => setDropdownOpen(v => !v)}>
                  {user?.fullName || user?.name || user?.email || 'Profile'}
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <button className="ghost-button dropdown-item" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); navigate(user.userType === 'Avocat' ? '/avocat/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'); }}>{t('dashboard')}</button>
                    <button className="ghost-button dropdown-item" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); handleLogout(); }}>{t('nav.logout')}</button>
                  </div>
                )}
              </div>
            ) : (
                <>
                <button className=" ghost-button" onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }}>{t('nav.login')}</button>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 30px;
          height: 38px;
          background: none;
          border: none;
          cursor: pointer;
          margin-left: 10px;
          z-index: 120;
        }
        .hamburger span {
          display: block;
          width: 26px;
          height: 3px;
          margin: 4px 0;
          background: #CFAE70;
          border-radius: 2px;
          transition: 0.3s;
        }
        .hamburger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }
        .hamburger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
        .nav-desktop {
          display: flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .hamburger {
            display: flex;
          }
          .nav-desktop {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(27, 38, 59, 0.98);
            backdrop-filter: blur(10px);
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
          }
          .nav-desktop.nav-mobile-open {
            display: flex;
          }
          .nav-links {
            flex-direction: column;
            gap: 0;
            margin-bottom: 20px;
            width: 100%;
            max-width: 300px;
          }
          .nav-link {
            padding: 16px 0;
            border-radius: 0;
            font-size: 18px;
            text-align: center;
            color: #FFFFFF;
            width: 100%;
            border-bottom: 1px solid rgba(207, 174, 112, 0.2);
          }
          .nav-link:hover {
            background: rgba(207, 174, 112, 0.1);
            transform: none;
            border-radius: 0;
          }
          .nav-actions {
            flex-direction: column;
            gap: 12px;
            margin: 0;
            align-items: center;
            width: 100%;
            max-width: 300px;
          }
          
          .language-dropdown {
            order: -1;
            margin-bottom: 15px;
            width: 100%;
          }
          
          .translate-button {
            border-radius: 12px;
            padding: 12px 20px;
            font-size: 15px;
            width: 100%;
            max-width: 200px;
            justify-content: center;
          }
          
          .language-menu {
            position: static;
            transform: none;
            width: 100%;
            max-width: 250px;
            margin-top: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }

          .ghost-button {
            width: 100%;
            max-width: 200px;
            padding: 12px 20px;
            font-size: 14px;
            text-align: center;
            margin: 4px 0;
          }

          .dropdown-menu {
            position: static;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            width: 100%;
            max-width: 200px;
            margin-top: 8px;
            border: 1px solid rgba(207, 174, 112, 0.3);
          }

          /* Dashboard mode adjustments for mobile */
          .nav-glass.dashboard-mode {
            position: static;
            width: 100%;
          }
          .nav-glass.dashboard-mode .nav-inner {
            padding: 0 16px;
            margin-left: 0;
            width: 100%;
            min-height: 60px;
          }
        }

        @media (max-width: 480px) {
          .nav-inner {
            padding: 0 12px;
            min-height: 50px;
          }
          .nav-logo {
            font-size: 1.2rem;
            margin-right: 16px;
          }
          .hamburger {
            width: 24px;
            height: 32px;
          }
          .hamburger span {
            width: 22px;
            height: 2px;
            margin: 3px 0;
          }
          .nav-link {
            font-size: 1rem;
            padding: 14px 0;
          }
          .translate-button, .ghost-button {
            padding: 10px 16px;
            font-size: 15px;
          }
        }
        .nav-glass {
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          position: sticky;
          z-index: 12;
        }

        /* Dashboard-mode: make the navbar background full-width while aligning inner content
           to the right of the fixed sidebar. This preserves a continuous header background and
           keeps actionable content offset by the sidebar width. */
        .nav-glass.dashboard-mode {
          position: fixed;
          left: 0; /* cover full width */
          top: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          z-index: 110;
        }

        /* Push the inner content to the right by the sidebar width so the content area lines up */
        .nav-glass.dashboard-mode .nav-inner {
          /* Fill the full width, but offset inner content by the sidebar width so the
             navbar background spans the page while actionable items sit after sidebar. */
          margin-left: 0;
          width: 100%;
          box-sizing: border-box;
          border-radius: 0; /* flush with sidebar */
          min-height: 80px; /* align with sidebar top spacing */
          padding: 0 32px 0 300px; /* left padding equals sidebar width */
          background: #1B263B; /* match sidebar color to appear as one block */
          box-shadow: 0 6px 16px rgba(27, 38, 59, 0.12); /* softened shadow */
          border-left: none;
        }
        .nav-inner {
          width: 100vw;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #1B263B;
          backdrop-filter: blur(10px);
          box-shadow: 0 15px 30px rgba(27, 38, 59, 0.3);
          border-radius: 3px;
          border: 1.5px solid #CFAE70;
          padding: 0 32px;
          position: sticky;
        
        }
        .nav-logo {
          color: #CFAE70;
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-right: 32px;
          white-space: nowrap;
          display: flex;
          align-items: center;
        }
        .court-logo {
          display: inline-flex;
          align-items: center;
          height: 2.1em;
        }
        .nav-links {
          display: flex;
          flex: 1;
          justify-content: center;
          align-items: center;
          gap: 15px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .nav-link {
          background-color: transparent;
          border: none;
          border-radius: 16px;
          color: #FFFFFF;
          font-size: 16px;
          font-weight: bold;
          padding: 10px 35px;
          letter-spacing: 1px;
          margin-left: 9px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .nav-link:hover {
          background: #CFAE70;
          color: #1B263B;
          border: 1px solid #CFAE70;
          box-shadow: 0 2px 4px rgba(207, 174, 112, 0.3);
          border-radius: 8px;
          transform: scale(1.05);
        }
        .nav-actions {
          display: flex;
          gap: 10px;
          margin-left: 32px;
        }
          
        .ghost-button {
        background-color: transparent;
          border: none;
          border-radius: 16px;
          color: #FFFFFF;
          font-size: 15px;
          font-weight: bold;
          padding: 10px 35px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .ghost-button:hover {
          background-color: #CFAE70;
          color: #1B263B;
          border: 1px solid #CFAE70;
          transform: scale(1.05);
        }
        
        .translate-button {
          background: #CFAE70;
          border: none;
          border-radius: 20px;
          color: #1B263B;
          font-size: 15px;
          font-weight: bold;
          padding: 8px 16px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(207, 174, 112, 0.3);
          min-width: 80px;
          justify-content: center;
          position: relative;
        }
        
        .translate-button:hover {
          background: #B8965C;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(207, 174, 112, 0.4);
        }
        
        .translate-icon {
          font-size: 14px;
          animation: rotate 2s infinite linear;
        }
        
        .translate-text {
          font-size: 10px;
          font-weight: 700;
        }
        
        .dropdown-arrow {
          font-size: 8px;
          transition: transform 0.3s ease;
        }
        
        .language-dropdown {
          position: relative;
        }
        
        .language-menu {
          position: absolute;
          top: 110%;
          right: 0;
          background: #FFFFFF;
          border: 2px solid #CFAE70;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(27, 38, 59, 0.2);
          min-width: 180px;
          z-index: 1000;
          overflow: hidden;
          animation: fadeIn 0.2s ease;
        }
        
        .language-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-size: 13px;
          text-align: left;
          color: #2D2D2D;
        }
        
        .language-item:hover {
          background-color: #F4F4F4;
        }
        
        .language-item.active {
          background-color: #1B263B;
          color: #FFFFFF;
        }
        
        .language-flag {
          font-size: 16px;
        }
        
        .language-name {
          flex: 1;
          font-weight: 500;
          color: inherit;
        }
        
        .language-code {
          font-size: 11px;
          font-weight: 700;
          opacity: 0.7;
          text-transform: uppercase;
        }
        
        .language-item.active .language-name,
        .language-item.active .language-code {
          color: #FFFFFF;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .translate-button:hover .translate-icon {
          animation-duration: 0.5s;
        }
        .dropdown {
          position: relative;
        }
        .dropdown-toggle {
          min-width: 120px;
        }
        .dropdown-menu {
          position: absolute;
          top: 110%;
          right: 0;
          background: #FFFFFF;
          border: 1.5px solid #CFAE70;
          border-radius: 12px;
          box-shadow: 0 8px 24px 0 rgba(27, 38, 59, 0.2);
          min-width: 120px;
          z-index: 100;
          padding: 8px 0;
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.18s;
        }
        .dropdown-item {
          text-align: left;
          width: 100%;
          border-radius: 8px;
          font-size: 0.7rem;
          padding: 10px 22px;
          margin: 0;
          border: none;
          color: #2D2D2D;
        }
        .dropdown-item:hover {
          background-color: #F4F4F4;
          color: #1B263B;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .nav-inner { padding: 0 10px; }
          .nav-links { gap: 18px; }
        }
        @media (max-width: 700px) {
          .nav-inner { flex-direction: column; align-items: stretch; padding: 10px 4px; border-radius: 1.5rem; min-height: unset; }
          .nav-links { flex-wrap: wrap; gap: 10px; justify-content: center; }
          .nav-logo, .nav-actions { margin: 0 0 10px 0; justify-content: center; }
          /* Disable dashboard-mode on small screens */
          .nav-glass.dashboard-mode { position: static; left: 0; width: 100vw; }
          .nav-glass.dashboard-mode .nav-inner { border-radius: 3px; min-height: 60px; margin-left: 0; width: 100%; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
