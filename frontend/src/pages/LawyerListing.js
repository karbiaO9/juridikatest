import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import { IoLocationSharp } from 'react-icons/io5';
import { GiGraduateCap } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';
import AnimatedErrorBanner from '../components/AnimatedErrorBanner';
import { mapToKey } from '../utils/i18nMapping';

const LawyerListing = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedAvocat, setSelectedAvocat] = useState(null);
  const [avocats, setAvocats] = useState([]);
  const [filteredAvocats, setFilteredAvocats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Use central mapToKey util from src/utils/i18nMapping.js

  // Get search parameters from URL or location state
  const searchParams = new URLSearchParams(location.search);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || '');

  // Specialties available - Updated to match database values
  const specialties = useMemo(() => [
    { key: 'allSpecialties', value: '', label: t('lawyerListing.specialties.allSpecialties') },
    { key: 'droitCivil', value: 'droitCivil', label: t('lawyerListing.specialties.droitCivil') },
    { key: 'droitPenal', value: 'droitPenal', label: t('lawyerListing.specialties.droitPenal') },
    { key: 'droitCommercial', value: 'droitCommercial', label: t('lawyerListing.specialties.droitCommercial') },
    { key: 'droitTravail', value: 'droitTravail', label: t('lawyerListing.specialties.droitTravail') },
    { key: 'droitFiscal', value: 'droitFiscal', label: t('lawyerListing.specialties.droitFiscal') },
    { key: 'droitImmobilier', value: 'droitImmobilier', label: t('lawyerListing.specialties.droitImmobilier') },
    { key: 'civilLaw', value: 'civilLaw', label: t('lawyerListing.specialties.civilLaw') },
    { key: 'criminalLaw', value: 'criminalLaw', label: t('lawyerListing.specialties.criminalLaw') },
    { key: 'corporateLaw', value: 'corporateLaw', label: t('lawyerListing.specialties.corporateLaw') },
    { key: 'familyLaw', value: 'familyLaw', label: t('lawyerListing.specialties.familyLaw') },
    { key: 'intellectualProperty', value: 'intellectualProperty', label: t('lawyerListing.specialties.intellectualProperty') },
    { key: 'laborLaw', value: 'laborLaw', label: t('lawyerListing.specialties.laborLaw') },
    { key: 'taxLaw', value: 'taxLaw', label: t('lawyerListing.specialties.taxLaw') },
    { key: 'realEstateLaw', value: 'realEstateLaw', label: t('lawyerListing.specialties.realEstateLaw') }
  ], [t]);

  const cities = useMemo(() => [
    { key: 'allCities', value: '', label: t('lawyerListing.cities.allCities') },
    { key: 'ariana', value: 'ariana', label: t('lawyerListing.cities.ariana') },
    { key: 'beja', value: 'beja', label: t('lawyerListing.cities.beja') },
    { key: 'benArous', value: 'benArous', label: t('lawyerListing.cities.benArous') },
    { key: 'bizerte', value: 'bizerte', label: t('lawyerListing.cities.bizerte') },
    { key: 'gabes', value: 'gabes', label: t('lawyerListing.cities.gabes') },
    { key: 'gafsa', value: 'gafsa', label: t('lawyerListing.cities.gafsa') },
    { key: 'jendouba', value: 'jendouba', label: t('lawyerListing.cities.jendouba') },
    { key: 'kairouan', value: 'kairouan', label: t('lawyerListing.cities.kairouan') },
    { key: 'kasserine', value: 'kasserine', label: t('lawyerListing.cities.kasserine') },
    { key: 'kebili', value: 'kebili', label: t('lawyerListing.cities.kebili') },
    { key: 'kef', value: 'kef', label: t('lawyerListing.cities.kef') },
    { key: 'mahdia', value: 'mahdia', label: t('lawyerListing.cities.mahdia') },
    { key: 'manouba', value: 'manouba', label: t('lawyerListing.cities.manouba') },
    { key: 'medenine', value: 'medenine', label: t('lawyerListing.cities.medenine') },
    { key: 'monastir', value: 'monastir', label: t('lawyerListing.cities.monastir') },
    { key: 'nabeul', value: 'nabeul', label: t('lawyerListing.cities.nabeul') },
    { key: 'sfax', value: 'sfax', label: t('lawyerListing.cities.sfax') },
    { key: 'sidiBouzid', value: 'sidiBouzid', label: t('lawyerListing.cities.sidiBouzid') },
    { key: 'siliana', value: 'siliana', label: t('lawyerListing.cities.siliana') },
    { key: 'sousse', value: 'sousse', label: t('lawyerListing.cities.sousse') },
    { key: 'tataouine', value: 'tataouine', label: t('lawyerListing.cities.tataouine') },
    { key: 'tozeur', value: 'tozeur', label: t('lawyerListing.cities.tozeur') },
    { key: 'tunis', value: 'tunis', label: t('lawyerListing.cities.tunis') },
    { key: 'zaghouan', value: 'zaghouan', label: t('lawyerListing.cities.zaghouan') }
  ], [t]);

  // Fetch avocats from database
  useEffect(() => {
    const fetchAvocats = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        
        // Get the API base URL
        const getApiUrl = () => {
          return 'http://localhost:4000';
        };

        const response = await fetch(`${getApiUrl()}/api/auth/avocats`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched lawyers:', data); // Debug log for mobile testing
        
        // Filter only verified avocats for public display
        const verifiedAvocats = data.filter(avocat => avocat.verified === true);
        
        setAvocats(verifiedAvocats);
        setFilteredAvocats(verifiedAvocats);
      } catch (error) {
        console.error('Error fetching avocats:', error);
        // Add more detailed error logging for mobile debugging
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          hostname: window.location.hostname,
          origin: window.location.origin
        });
        
  // Set error state for display (use translation key with detail)
  setError(`${t('lawyerListing.unableToLoadLawyers')}: ${error.message}`);
        // Set empty array if API fails
        setAvocats([]);
        setFilteredAvocats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvocats();
  }, [t]);

  // Filter avocats based on search and filters
  useEffect(() => {
    let filtered = avocats;

    // Filter by search query (name or specialty)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(avocat =>
        (avocat.fullName && avocat.fullName.toLowerCase().includes(q)) ||
        (avocat.specialites && mapToKey(avocat.specialites, 'specialty').toLowerCase().includes(q))
      );
    }

    // Filter by city (compare canonical keys)
    if (selectedCity && selectedCity !== '') {
      filtered = filtered.filter(avocat => mapToKey(avocat.ville, 'city') === selectedCity);
    }

    // Filter by specialty (compare canonical keys)
    if (selectedSpecialty && selectedSpecialty !== '') {
      filtered = filtered.filter(avocat => mapToKey(avocat.specialites, 'specialty') === selectedSpecialty);
    }

    setFilteredAvocats(filtered);
  }, [searchQuery, selectedCity, selectedSpecialty, avocats, cities, specialties]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedSpecialty('');
    navigate('/lawyers');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCity && selectedCity !== '') params.set('city', selectedCity);
    if (selectedSpecialty && selectedSpecialty !== '') params.set('specialty', selectedSpecialty);
    
    navigate(`/lawyers?${params.toString()}`);
  };

  return (
    
    <div className="lawyer-listing">
      <Navbar />
      
      {/* Hero Section */}
      <header className="new-hero">
        <div className="hero-inner">
          <div className="hero-left">
            <h1>{t('lawyerListing.findLegalProfessionals')}</h1>
            <p className="lead">{t('lawyerListing.browseVerifiedLawyers')}</p>

            <form className="compact-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder={t('lawyerListing.searchLawyersByName')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="compact-input"
                aria-label="lawyer-name"
              />

              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="compact-select"
                aria-label="specialty"
              >
                {specialties.map(specialty => (
                  <option key={specialty.key} value={specialty.value}>
                    {specialty.label}
                  </option>
                ))}
              </select>
              
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)} 
                className="compact-select" 
                aria-label="city"
              >
                {cities.map(city => (
                  <option key={city.key} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
              
              <button className="primary-cta" type="submit">{t('lawyerListing.search')}</button>
            </form>

            <div className="hero-actions">
              <button className="ghost" onClick={clearFilters}>{t('lawyerListing.clearFilters')}</button>
              <button className="ghost" onClick={() => navigate('/')}>{t('lawyerListing.backToHome')}</button>
            </div>
          </div>

          <div className="hero-right">
            <img src="/law.png" alt="Lawyers" />
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <section className="main-content">
        <div className="container">
          <div className="content-layout">
            {/* Results Content */}
            <main className="results-content full-width">
              <div className="results-header">
                <div className="results-info">
                  <h4>{t('lawyerListing.weFoundLawyers', { count: filteredAvocats.length })}</h4>
                  {(searchQuery || selectedCity || selectedSpecialty) && (
                    <div className="active-filters">
                      <span className="filters-label">{t('lawyerListing.activeFilters')}</span>
                      <div className="filter-tags">
                        {searchQuery && <span className="filter-tag">{t('lawyerListing.search')}: "{searchQuery}"</span>}
                        {selectedCity && <span className="filter-tag">{t('lawyerListing.city')}: {cities.find(c => c.value === selectedCity)?.label}</span>}
                        {selectedSpecialty && <span className="filter-tag">{t('lawyerListing.specialty')}: {specialties.find(s => s.value === selectedSpecialty)?.label}</span>}
                        <button className="clear-all-filters" onClick={clearFilters}>
                          {t('lawyerListing.clearAll')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {loading ? (
                <div className="loading">{t('lawyerListing.loadingLawyers')}</div>
              ) : error ? (
                <div>
                  <h3>{t('lawyerListing.unableToLoadLawyers')}</h3>
                  <AnimatedErrorBanner message={t(error, { defaultValue: error })} visible={Boolean(error)} />
                  <p className="debug-info">
                    <strong>{t('lawyerListing.debugInfo')}</strong><br/>
                    {t('lawyerListing.hostname')}: {window.location.hostname}<br/>
                    {t('lawyerListing.origin')}: {window.location.origin}<br/>
                    {window.location.hostname !== 'localhost' && (
                      <span>{t('lawyerListing.mobileDetected', { hostname: window.location.hostname })}</span>
                    )}
                  </p>
                  <button 
                    className="retry-button"
                    onClick={() => window.location.reload()}
                  >
                    {t('lawyerListing.tryAgain')}
                  </button>
                </div>
              ) : filteredAvocats.length > 0 ? (
                <div className="lawyers-list">
                  {filteredAvocats.map(avocat => (
                    <div 
                      key={avocat._id} 
                      className="lawyer-card"
                      onClick={() => navigate(`/lawyer/${avocat._id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="lawyer-content">
                        <div className="lawyer-header">
                          <div className="lawyer-avatar">
                            {avocat.avatarUrl ? (
                              <img 
                                src={avocat.avatarUrl} 
                                alt={avocat.fullName}
                                className="avatar-image"
                              />
                            ) : (
                              <span className="avatar-initial">
                                {avocat.fullName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="lawyer-info">
                            <h3 className="lawyer-name">{avocat.fullName}</h3>
                            <p className="lawyer-specialty">{t(`lawyerListing.specialties.${mapToKey(avocat.specialites,'specialty')}`, { defaultValue: avocat.specialites })}</p>
                            <p className="lawyer-location"><IoLocationSharp style={{ verticalAlign: 'middle' }} /> {t(`lawyerListing.cities.${mapToKey(avocat.ville,'city')}`, { defaultValue: avocat.ville })}</p>
                            
                            {/* Experience and Languages Section */}
                            <div className="lawyer-meta">
                              {avocat.anneExperience && (
                                <span className="experience-badge">
                                  <GiGraduateCap style={{ verticalAlign: 'middle', marginRight: 8 }} /> {avocat.anneExperience} {t('lawyerListing.yearsExp')}
                                </span>
                              )}
                              {avocat.langues && avocat.langues.length > 0 && (
                                <div className="languages-info">
                                  <span className="languages-label">{t('lawyerListing.languages')}: </span> 
                                  
                                    {avocat.langues.map((langue, index) => (
                                      <span key={index} className="language-tag">
                                        {langue}{index < avocat.langues.length - 1 ? ', ' : ''}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                          </div>
                        </div>
                        
                        <div className="lawyer-details">
                          <div className="lawyer-contact">
                            <p className="contact-info">{t('lawyerListing.email')}: {avocat.email}</p>
                            <p className="contact-info">{t('lawyerListing.phone')}: {avocat.phone}</p>
                          </div>
                          
                          <div className="lawyer-actions">
                            <button 
                              className="contact-btn"
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedAvocat(avocat);
                                setBookingOpen(true);
                              }}
                            >
                              {t('lawyerListing.bookAppointment')}
                            </button>
                            <button 
                              className="profile-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/lawyer/${avocat._id}`);
                              }}
                            >
                              {t('lawyerListing.viewProfile')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <h3>{t('lawyerListing.noLawyersFound')}</h3>
                  <p>{t('lawyerListing.tryAdjustingSearch')}</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <Footer />
  <BookingModal avocat={selectedAvocat} open={bookingOpen} onClose={() => setBookingOpen(false)} />

  <style>{`
        :root {
          --navy: #1B263B;
          --charcoal: #2D2D2D;
          --gold: #CFAE70;
          --deep-green: #1D6A5E;
          --white: #FFFFFF;
          --light-gray: #F4F4F4;
          --border-light: #e8e8e8;
          --shadow-light: rgba(27,38,59,0.06);
          --shadow-medium: rgba(27,38,59,0.08);
          --transition: all 0.3s ease;
        }

        .lawyer-listing {
          min-height: 100vh;
          background: var(--light-gray);
          font-family: var(--font-sans);
          overflow-x: hidden;
        }

        .container { 
          max-width: 1200px; 
          margin: 0 auto; 
          width: 100%; 
          padding: 0 20px; 
        }

        /* Header Section */
        .header-section { 
          background: var(--navy); 
          padding: 28px 0; 
          color: var(--white); 
        }
        .header-content { 
          text-align: center; 
          margin: 24px 0; 
        }
        .page-title { 
          font-size: 2.5rem; 
          font-weight: 800; 
          color: var(--gold); 
          margin: 0 0 8px; 
          font-family: var(--font-serif); 
        }
        .page-subtitle { 
          color: rgba(255,255,255,0.9); 
          margin: 0; 
          font-weight: 600; 
        }

        /* Mobile Filter Toggle - Hidden on Desktop */
        .mobile-filter-toggle {
          display: none;
          margin: 20px 0;
        }
        
        .filter-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--navy);
          color: var(--white);
          border: none;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          width: 100%;
          justify-content: center;
        }
        
        .filter-toggle-btn:hover {
          background: var(--charcoal);
        }

        /* Content Layout */
        .content-layout { 
          display: flex; 
          gap: 20px; 
          align-items: flex-start; 
          padding: 30px 0; 
        }

        /* Filter Sidebar */
        .filter-sidebar {
          width: 320px; 
          background: var(--white); 
          border: 1px solid var(--light-gray); 
          padding: 28px; 
          position: sticky; 
          top: 20px; 
          border-radius: 12px; 
          box-shadow: 0 8px 30px var(--shadow-light);
          transition: var(--transition);
        }

        /* Mobile Sidebar Header - Hidden on Desktop */
        .mobile-sidebar-header {
          display: none;
        }

        .close-sidebar-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--charcoal);
          cursor: pointer;
          padding: 5px;
          border-radius: 5px;
          transition: var(--transition);
        }

        .close-sidebar-btn:hover {
          background: var(--light-gray);
        }

        /* Desktop Sidebar Header */
        .desktop-only {
          display: block;
        }

        .sidebar-header h3 { 
          font-size: 1.2rem; 
          font-weight: 800; 
          color: var(--navy); 
          margin: 0 0 12px 0; 
        }

        /* Sidebar Overlay - Hidden on Desktop */
        .sidebar-overlay {
          display: none;
        }

        /* Form Elements */
        .search-form {
          width: 100%;
        }

        .search-field {
          margin-bottom: 16px;
        }

        .field-label { 
          color: var(--navy); 
          font-weight: 700; 
          margin-bottom: 6px; 
          display: block;
        }

        .search-input, .search-select { 
          width: 100%; 
          padding: 14px 16px; 
          border: 1px solid var(--light-gray); 
          border-radius: 10px; 
          background: var(--white); 
          color: var(--charcoal); 
          font-size: 15px;
          box-sizing: border-box;
          transition: var(--transition);
        }
        
        .search-input:focus, .search-select:focus { 
          outline: none; 
          border-color: var(--navy); 
          box-shadow: 0 0 0 3px rgba(27,38,59,0.1); 
        }

        .search-actions { 
          display: flex; 
          flex-direction: column; 
          gap: 12px; 
          margin-top: 16px; 
        }

        .search-button { 
          background: var(--gold); 
          color: var(--navy); 
          padding: 12px; 
          border-radius: 10px; 
          border: none; 
          font-weight: 800; 
          cursor: pointer;
          transition: var(--transition);
        }
        .search-button:hover { 
          background: #B8965C; 
        }

        .clear-button { 
          background: var(--deep-green); 
          color: var(--white); 
          padding: 12px; 
          border-radius: 10px; 
          border: none; 
          font-weight: 800;
          cursor: pointer;
          transition: var(--transition);
        }
        .clear-button:hover { 
          background: #155448; 
        }

        /* Mobile-only buttons */
        .mobile-only {
          display: none;
        }

        .apply-filters-btn {
          background: var(--navy);
          color: var(--white);
          padding: 12px;
          border-radius: 10px;
          border: none;
          font-weight: 800;
          cursor: pointer;
          transition: var(--transition);
        }

        .back-button { 
          background: var(--light-gray); 
          color: var(--charcoal); 
          padding: 10px; 
          border-radius: 8px; 
          border: 1px solid var(--border-light); 
          width: 100%;
          cursor: pointer;
          transition: var(--transition);
        }

        .back-button:hover {
          background: #e8e8e8;
        }

        /* Results Content */
        .results-content { 
          flex: 1; 
          background: var(--white); 
          padding: 28px; 
          border-radius: 12px; 
          box-shadow: 0 8px 30px rgba(27,38,59,0.04); 
          min-height: 60vh; 
        }

        .results-header {
          margin-bottom: 24px;
        }

        .results-info h4 { 
          margin: 0 0 12px 0; 
          color: var(--charcoal); 
          font-weight: 700; 
          font-size: 3rem;
        }

        /* Active Filters Display */
        .active-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          margin-top: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .filters-label {
          font-weight: 600;
          color: var(--charcoal);
          margin-right: 8px;
        }

        .filter-tag {
          background: var(--gold);
          color: var(--navy);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .clear-all-filters {
          background: var(--deep-green);
          color: var(--white);
          border: none;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .clear-all-filters:hover {
          background: #155448;
        }

        /* Lawyer Cards */
        .lawyers-list { 
          display: flex; 
          flex-direction: column; 
          gap: 18px; 
        }

        .lawyer-card { 
          background: var(--white); 
          border-radius: 14px; 
          padding: 22px; 
          border: 1px solid var(--light-gray); 
          box-shadow: 0 6px 20px rgba(27,38,59,0.04); 
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; 
          cursor: pointer;
        }
        
        .lawyer-card:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 16px 40px var(--shadow-medium); 
          border-color: var(--gold); 
        }

        .lawyer-header { 
          display: flex; 
          gap: 18px; 
          align-items: flex-start; 
        }
        
        .lawyer-avatar { 
          width: 64px; 
          height: 64px; 
          border-radius: 50%; 
          background: linear-gradient(135deg,var(--navy),var(--charcoal)); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: var(--white); 
          font-weight: 800; 
          font-size: 20px; 
          border: 3px solid var(--gold);
          flex-shrink: 0;
        }
        
        .avatar-image { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          border-radius: 50%; 
        }

        .lawyer-info {
          flex: 1;
          min-width: 0;
        }

        .lawyer-name { 
          font-size: 1.5rem; 
          color: var(--navy); 
          font-weight: 800; 
          margin: 0 0 6px 0; 
        }
        
        .lawyer-specialty { 
          color: var(--gold); 
          font-weight: 700; 
          margin: 6px 0;
          font-size: 1.1rem;
        }
        
        .lawyer-location { 
          color: var(--deep-green); 
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 1rem;
        }

        .lawyer-meta {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .experience-badge {
          background: #f0f9ff;
          color: var(--navy);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .languages-info {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
        }

        .languages-label {
          font-weight: 600;
          color: var(--charcoal);
          font-size: 14px;
        }

        .language-tag {
          color: var(--deep-green);
          font-weight: 500;
          font-size: 14px;
        }

        .lawyer-details { 
          display: flex; 
          justify-content: space-between; 
          gap: 20px; 
          align-items: center; 
          margin-top: 16px; 
          flex-wrap: wrap; 
        }
        
        .lawyer-contact {
          flex: 1;
          min-width: 200px;
        }

        .contact-info { 
          color: var(--charcoal); 
          margin: 4px 0;
          font-size: 16px;
        }

        .lawyer-actions { 
          display: flex; 
          gap: 12px;
          flex-shrink: 0;
        }
        
        .contact-btn { 
          background: var(--gold); 
          color: var(--navy); 
          padding: 10px 16px; 
          border-radius: 10px; 
          border: none; 
          font-weight: 800;
          cursor: pointer;
          transition: var(--transition);
          font-size: 16px;
        }
        .contact-btn:hover { 
          background: #B8965C; 
        }
        
        .profile-btn { 
          background: transparent; 
          color: var(--navy); 
          border: 2px solid var(--navy); 
          padding: 8px 16px; 
          border-radius: 10px; 
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
          font-size: 16px;
        }
        .profile-btn:hover { 
          background: var(--navy); 
          color: var(--white); 
        }

        /* Error and Loading States */
        .error-message { 
          background: #fff6f0; 
          border: 1px solid #ffd9c2; 
          padding: 16px; 
          border-radius: 8px; 
          color: #9b2c00; 
        }

        .loading, .no-results { 
          text-align: center; 
          padding: 60px; 
          color: var(--charcoal); 
        }

        .retry-button {
          background: var(--gold);
          color: var(--navy);
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 16px;
          transition: var(--transition);
        }

        .retry-button:hover {
          background: #B8965C;
        }

        .debug-info {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          margin: 12px 0;
          font-size: 12px;
          color: #6c757d;
        }

        /* ============================= */
        /* RESPONSIVE DESIGN BREAKPOINTS */
        /* ============================= */

        /* Large Tablet (1024px and below) */
        @media (max-width: 1024px) {
          .container {
            padding: 0 16px;
          }
          
          .filter-sidebar {
            width: 280px;
            padding: 20px;
          }
          
          .page-title {
            font-size: 2.2rem;
          }
        }

        /* Tablet (768px and below) */
        @media (max-width: 768px) {
          .container {
            padding: 0 12px;
          }

          /* Show mobile filter toggle */
          .mobile-filter-toggle {
            display: block;
          }

          /* Hide desktop sidebar header */
          .desktop-only {
            display: none;
          }

          /* Show mobile sidebar header */
          .mobile-sidebar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--light-gray);
          }

          .mobile-sidebar-header h3 {
            font-size: 1.2rem;
            font-weight: 800;
            color: var(--navy);
            margin: 0;
          }

          /* Mobile sidebar styling */
          .filter-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            z-index: 1000;
            padding: 20px;
            margin: 0;
            border-radius: 0;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            overflow-y: auto;
          }

          .filter-sidebar.sidebar-open {
            transform: translateX(0);
          }

          /* Sidebar overlay */
          .sidebar-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
          }

          .sidebar-open .sidebar-overlay {
            opacity: 1;
            visibility: visible;
          }

          /* Show mobile-only buttons */
          .mobile-only {
            display: block;
          }

          /* Content layout adjustments */
          .content-layout {
            flex-direction: column;
            gap: 16px;
            padding: 20px 0;
          }

          .results-content {
            padding: 20px;
            margin-top: 0;
          }

          /* Header adjustments */
          .header-section {
            padding: 20px 0;
          }

          .page-title {
            font-size: 1.8rem;
          }

          .page-subtitle {
            font-size: 14px;
          }

          /* Lawyer card mobile optimizations */
          .lawyer-card {
            padding: 16px;
          }

          .lawyer-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
          }

          .lawyer-avatar {
            width: 56px;
            height: 56px;
            font-size: 18px;
          }

          .lawyer-details {
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .lawyer-contact {
            text-align: center;
            min-width: auto;
          }

          .lawyer-actions {
            justify-content: center;
            width: 100%;
          }

          .contact-btn, .profile-btn {
            flex: 1;
            text-align: center;
          }

          /* Active filters mobile */
          .active-filters {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .filter-tag {
            font-size: 11px;
          }
        }

        /* Large Phone (480px and below) */
        @media (max-width: 480px) {
          .container {
            padding: 0 8px;
          }

          .filter-sidebar {
            padding: 16px;
          }

          .results-content {
            padding: 16px;
          }

          .page-title {
            font-size: 1.6rem;
          }

          .lawyer-card {
            padding: 12px;
          }

          .lawyer-avatar {
            width: 48px;
            height: 48px;
            font-size: 16px;
          }

          .lawyer-name {
            font-size: 1.1rem;
          }

          .lawyer-actions {
            flex-direction: column;
            gap: 8px;
          }

          .contact-btn, .profile-btn {
            width: 100%;
            padding: 12px;
          }

          .search-input, .search-select {
            padding: 12px 14px;
            font-size: 16px; /* Prevent zoom on iOS */
          }

          .filter-toggle-btn {
            padding: 14px 20px;
            font-size: 16px;
          }
        }

        /* Small Phone (375px and below) */
        @media (max-width: 375px) {
          .container {
            padding: 0 6px;
          }

          .filter-sidebar {
            padding: 12px;
          }

          .results-content {
            padding: 12px;
          }

          .page-title {
            font-size: 1.4rem;
          }

          .lawyer-card {
            padding: 10px;
          }

          .lawyer-avatar {
            width: 44px;
            height: 44px;
            font-size: 14px;
          }

          .lawyer-name {
            font-size: 1rem;
          }

          .experience-badge,
          .language-tag {
            font-size: 10px;
          }

          .contact-info {
            font-size: 12px;
          }
        }

        /* Landscape orientation optimizations */
        @media (max-width: 768px) and (orientation: landscape) {
          .filter-sidebar {
            width: 80%;
            max-width: 400px;
          }

          .lawyer-header {
            flex-direction: row;
            text-align: left;
          }

          .lawyer-details {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .filter-toggle-btn,
          .search-button,
          .clear-button,
          .apply-filters-btn,
          .contact-btn,
          .profile-btn {
            min-height: 44px;
            padding: 12px 16px;
          }

          .search-input,
          .search-select {
            min-height: 44px;
            padding: 12px 16px;
          }

          .close-sidebar-btn {
            min-height: 44px;
            min-width: 44px;
          }
        }

        /* High-density display optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .lawyer-card {
            box-shadow: 0 8px 25px rgba(27,38,59,0.06);
          }

          .filter-sidebar {
            box-shadow: 0 10px 35px rgba(27,38,59,0.08);
          }

          .results-content {
            box-shadow: 0 10px 35px rgba(27,38,59,0.06);
          }
        }

        /* Hero Section Styles (same as Homepage) */
        .new-hero{ background: linear-gradient(180deg, #0b1220 0%, #0f1724 60%); color: white; padding:64px 20px; width: 100%; }
        .hero-inner{ max-width:1200px; margin:0 auto; display:flex; gap:32px; align-items:center; width: 100%; }
        .hero-left{ flex:1; min-width: 0; }
        .hero-left h1{ font-size:2.6rem; margin:0 0 12px; font-weight:800; word-wrap: break-word; }
        .lead{ color:rgba(255,255,255,0.85); margin:0 0 20px }
        .compact-search{ display:flex; gap:10px; align-items:center; margin-bottom:14px; width: 100%; flex-wrap: wrap; }
        .compact-input{ flex:1; padding:12px 14px; border-radius:10px; border:none; min-width: 0; max-width: 100%; }
        .compact-select{ width:180px; padding:12px 14px; border-radius:10px; border:none; max-width: 100%; }
        .primary-cta{ background:var(--gold); color:#06202b; padding:12px 18px; border-radius:10px; border:none; font-weight:700; white-space: nowrap; }
        .hero-actions{ display:flex; gap:10px; flex-wrap: wrap; }
        .ghost{ background:transparent; border:1px solid rgba(255,255,255,0.14); color:rgba(255,255,255,0.9); padding:8px 12px; border-radius:8px }
        .hero-right{ flex: 0 0 auto; }
        .hero-right img{ max-width:420px; width: 100%; height: auto; border-radius:12px; }
        /* Full width results when no sidebar */
        .results-content.full-width {
          width: 100%;
          margin-left: 0;
        }

        /* Hero Responsive Styles (same as Homepage) */
        @media (max-width: 1024px) {
          .hero-inner{ gap: 24px; padding: 0 16px; }
          .hero-left h1{ font-size: 2.2rem; }
          .compact-search{ flex-wrap: wrap; gap: 8px; }
          .compact-input{ min-width: 0; flex: 1 1 200px; }
          .compact-select{ width: 160px; min-width: 0; flex: 0 0 auto; }
        }

        @media (max-width: 768px) {
          .hero-inner{ flex-direction: column-reverse; text-align: center; gap: 20px; padding: 0 12px; }
          .hero-left{ width: 100%; }
          .hero-left h1{ font-size: 1.8rem; line-height: 1.2; }
          .lead{ font-size: 0.95rem; margin: 0 0 16px; }
          .hero-right{ width: 100%; }
          .hero-right img{ max-width: 280px; width: 100%; height: auto; }
          .compact-search{ flex-direction: column; width: 100%; gap: 8px; }
          .compact-input, .compact-select{ width: 100%; max-width: none; flex: none; }
          .compact-select{ display: block; }
          .hero-actions{ flex-direction: column; gap: 8px; width: 100%; }
          .primary-cta, .ghost{ width: 100%; padding: 12px; text-align: center; }
          .new-hero{ padding: 40px 12px; }
        }

        @media (max-width: 480px) {
          .new-hero{ padding: 32px 12px; }
          .hero-left h1{ font-size: 1.5rem; margin: 0 0 8px; }
          .lead{ font-size: 0.9rem; margin: 0 0 12px; }
          .compact-input, .compact-select{ padding: 10px 12px; font-size: 14px; }
          .primary-cta, .ghost{ padding: 10px; font-size: 14px; }
          .hero-right img{ max-width: 240px; }
        }

        @media (max-width: 375px) {
          .new-hero{ padding: 24px 8px; }
          .hero-left h1{ font-size: 1.3rem; }
          .lead{ font-size: 0.85rem; }
          .compact-input, .compact-select{ padding: 8px 10px; }
          .hero-right img{ max-width: 200px; }
        }

        /* Landscape orientation on mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .hero-inner{ flex-direction: row; }
          .hero-left{ flex: 1.5; }
          .hero-right{ flex: 1; }
          .hero-left h1{ font-size: 1.6rem; }
          .new-hero{ padding: 20px 16px; }
        }

        /* Active Filters Styling */
        .active-filters {
          margin: 20px 0;
          padding: 16px;
          background: var(--neutral-light-gray);
          border-radius: 8px;
          border: 1px solid #e0e7ef;
        }

        .filters-label {
          font-weight: 600;
          color: var(--primary-navy);
          margin-bottom: 8px;
          display: block;
          font-size: 0.9rem;
        }

        .filter-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .filter-tag {
          background: var(--primary-navy);
          color: var(--neutral-white);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .clear-all-filters {
          background: var(--accent-gold);
          color: var(--primary-navy);
          border: none;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-all-filters:hover {
          background: #d4a853;
          transform: translateY(-1px);
        }

        .results-header {
          margin-bottom: 24px;
        }

        .results-info h4 {
          color: var(--primary-navy);
          margin: 0 0 12px;
          font-size: 1.2rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .filter-tags {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          
          .filter-tag, .clear-all-filters {
            text-align: center;
            width: 100%;
          }
          
          .active-filters {
            padding: 12px;
          }
        }
  `}</style>
    </div>
  );
};

export default LawyerListing;
