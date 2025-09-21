import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <p className="footer-text">&copy; {new Date().getFullYear()} Juridika. {t('footer.allRightsReserved')}</p>
        <nav className="footer-nav">
          <a href="/about" className="footer-link">{t('footer.aboutUs')}</a>
          <a href="/contact" className="footer-link">{t('footer.contact')}</a>
          <a href="/privacy" className="footer-link">{t('footer.privacyPolicy')}</a>
        </nav>
      </div>

  <style>{`
        .app-footer {
          margin-top: 30px;
          color: #FFFFFF;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          padding: 30px 0;
          text-align: center;
          background: #1B263B;
          border-radius: 16px;
          box-shadow: 0 0 30px rgba(27, 38, 59, 0.3);
          backdrop-filter: blur(5.1px);
          -webkit-backdrop-filter: blur(5.1px);
          border: 1px solid #CFAE70;
        }
          

        .footer-container {
          width: 100%;
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 20px;
        }

        .footer-text {
          margin: 0 0 15px;
          font-size: 14px;
          font-weight: 500;
          color: #FFFFFF;
        }

        .footer-nav {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .footer-link {
          color: #CFAE70;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.3s ease;
          padding: 5px 10px;
          border-radius: 4px;
        }

        .footer-link:hover {
          color: #FFFFFF;
          background-color: rgba(207, 174, 112, 0.2);
        }
        
        @media (max-width: 768px) {
          .footer-nav {
            gap: 15px;
          }
          
          .footer-link {
            font-size: 12px;
          }
        }
  `}</style>
    </footer>
  );
};

export default Footer;
