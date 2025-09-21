import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Homepage = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [name, setName] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Create translated arrays using useMemo for performance
  const specialties = useMemo(() => [
    { key: '', label: t('homepage.allSpecialties') },
    { key: 'Family Law', label: t('homepage.specialties.familyLaw') },
    { key: 'Criminal Law', label: t('homepage.specialties.criminalLaw') },
    { key: 'Business & Corporate Law', label: t('homepage.specialties.businessCorporateLaw') },
    { key: 'Employment Law', label: t('homepage.specialties.employmentLaw') },
    { key: 'Immigration Law', label: t('homepage.specialties.immigrationLaw') },
    { key: 'Property & Real Estate', label: t('homepage.specialties.propertyRealEstate') },
    { key: 'Contract Law', label: t('homepage.specialties.contractLaw') },
    { key: 'Personal Injury', label: t('homepage.specialties.personalInjury') },
    { key: 'Administrative Law', label: t('homepage.specialties.administrativeLaw') },
    { key: 'Intellectual Property', label: t('homepage.specialties.intellectualProperty') },
    { key: 'Tax Law', label: t('homepage.specialties.taxLaw') }
  ], [t]);

  const cities = useMemo(() => [
    { key: '', label: t('homepage.allCities') },
    { key: 'Ariana', label: t('homepage.cities.ariana') },
    { key: 'Béja', label: t('homepage.cities.beja') },
    { key: 'Ben Arous', label: t('homepage.cities.benArous') },
    { key: 'Bizerte', label: t('homepage.cities.bizerte') },
    { key: 'Gabès', label: t('homepage.cities.gabes') },
    { key: 'Gafsa', label: t('homepage.cities.gafsa') },
    { key: 'Jendouba', label: t('homepage.cities.jendouba') },
    { key: 'Kairouan', label: t('homepage.cities.kairouan') },
    { key: 'Kasserine', label: t('homepage.cities.kasserine') },
    { key: 'Kebili', label: t('homepage.cities.kebili') },
    { key: 'Kef', label: t('homepage.cities.kef') },
    { key: 'Mahdia', label: t('homepage.cities.mahdia') },
    { key: 'Manouba', label: t('homepage.cities.manouba') },
    { key: 'Médenine', label: t('homepage.cities.medenine') },
    { key: 'Monastir', label: t('homepage.cities.monastir') },
    { key: 'Nabeul', label: t('homepage.cities.nabeul') },
    { key: 'Sfax', label: t('homepage.cities.sfax') },
    { key: 'Sidi Bouzid', label: t('homepage.cities.sidiBouzid') },
    { key: 'Siliana', label: t('homepage.cities.siliana') },
    { key: 'Sousse', label: t('homepage.cities.sousse') },
    { key: 'Tataouine', label: t('homepage.cities.tataouine') },
    { key: 'Tozeur', label: t('homepage.cities.tozeur') },
    { key: 'Tunis', label: t('homepage.cities.tunis') },
    { key: 'Zaghouan', label: t('homepage.cities.zaghouan') }
  ], [t]);

  const handleSearch = (e) => {
    e.preventDefault();

    // Build search parameters: specialty + city
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (selectedSpecialty) params.set('specialty', selectedSpecialty);
    if (selectedCity && selectedCity !== 'All Cities') params.set('city', selectedCity);

    // Navigate to lawyer listing page
    navigate(`/lawyers?${params.toString()}`);
  };

  // Filters cleared on new design via form reset when needed

  return (
    <div className="homepage">
      <Navbar />

      <header className="new-hero">
        <div className="hero-inner">
          <div className="hero-left">
            <h1>{t('homepage.title')}</h1>
            <p className="lead">{t('homepage.subtitle')}</p>

            <form className="compact-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder={t('homepage.searchPlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                  <option key={specialty.key} value={specialty.key}>
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
                  <option key={city.key} value={city.key}>
                    {city.label}
                  </option>
                ))}
              </select>
              <button className="primary-cta" type="submit">{t('homepage.searchButton')}</button>
            </form>

            <div className="hero-actions">
              <button className="ghost">{t('homepage.howItWorks')}</button>
              <button className="ghost">{t('homepage.forLawyers')}</button>
            </div>
          </div>

          <div className="hero-right">
            <img src="/law.png" alt="Lawyers" />
          </div>
        </div>
      </header>

      <section className="highlights">
        <div className="grid">
          <div className="card">
            <h3>{t('homepage.verifiedProfessionals')}</h3>
            <p>{t('homepage.verifiedDesc')}</p>
          </div>
          <div className="card">
            <h3>{t('homepage.instantBooking')}</h3>
            <p>{t('homepage.bookingDesc')}</p>
          </div>
          <div className="card">
            <h3>{t('homepage.secureCommunication')}</h3>
            <p>{t('homepage.communicationDesc')}</p>
          </div>
        </div>
      </section>

      <section className="stats-testimonial">
        <div className="stats">
          <div className="stat"><strong>{t('homepage.lawyersCount')}</strong><span>{t('homepage.lawyers')}</span></div>
          <div className="stat"><strong>{t('homepage.appointmentsCount')}</strong><span>{t('homepage.appointments')}</span></div>
          <div className="stat"><strong>{t('homepage.satisfactionRate')}</strong><span>{t('homepage.satisfaction')}</span></div>
        </div>

        <div className="testimonial">
          <blockquote>{t('homepage.testimonial')}</blockquote>
          <cite>{t('homepage.testimonialAuthor')}</cite>
        </div>
      </section>

      <Footer />

  <style>{`
        * { box-sizing: border-box; }
        :root{ --bg:#f7fafc; --navy:#0f1724; --accent:#0ea5e9; --card:#ffffff }
        .homepage { width: 100%; overflow-x: hidden; }
        .new-hero{ background: linear-gradient(180deg, #0b1220 0%, #0f1724 60%); color: white; padding:64px 20px; width: 100%; }
        .hero-inner{ max-width:1200px; margin:0 auto; display:flex; gap:32px; align-items:center; width: 100%; }
        .hero-left{ flex:1; min-width: 0; }
        .hero-left h1{ font-size:2.6rem; margin:0 0 12px; font-weight:800; word-wrap: break-word; }
        .lead{ color:rgba(255,255,255,0.85); margin:0 0 20px }
        .compact-search{ display:flex; gap:10px; align-items:center; margin-bottom:14px; width: 100%; flex-wrap: wrap; }
        .compact-input{ flex:1; padding:12px 14px; border-radius:10px; border:none; min-width: 0; max-width: 100%; }
        .compact-select{ width:180px; padding:12px 14px; border-radius:10px; border:none; max-width: 100%; }
        .primary-cta{ background:var(--accent); color:#06202b; padding:12px 18px; border-radius:10px; border:none; font-weight:700; white-space: nowrap; }
        .hero-actions{ display:flex; gap:10px; flex-wrap: wrap; }
        .ghost{ background:transparent; border:1px solid rgba(255,255,255,0.14); color:rgba(255,255,255,0.9); padding:8px 12px; border-radius:8px }
        .hero-right{ flex: 0 0 auto; }
        .hero-right img{ max-width:420px; width: 100%; height: auto; border-radius:12px; }

        .highlights{ padding:48px 20px; background:var(--bg); width: 100%; }
        .grid{ max-width:1100px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:18px; width: 100%; }
        .card{ background:var(--card); padding:20px; border-radius:12px; box-shadow:0 6px 24px rgba(2,6,23,0.06); text-align:left; min-width: 0; }
        .card h3{ margin:0 0 8px; word-wrap: break-word; }

        .stats-testimonial{ max-width:1100px; margin:36px auto; display:flex; gap:24px; align-items:center; padding:24px; width: 100%; }
        .stats{ display:flex; gap:18px; flex:1; flex-wrap: wrap; }
        .stat{ background:var(--card); padding:18px; border-radius:10px; text-align:center; min-width:120px; flex: 1; }
        .stat strong{ display:block; font-size:1.4rem }
        .testimonial{ flex:2; background:linear-gradient(90deg,#fff,#f3f9ff); padding:20px; border-radius:12px; min-width: 0; }

        @media (max-width: 1024px) {
          .hero-inner{ gap: 24px; padding: 0 16px; }
          .hero-left h1{ font-size: 2.2rem; }
          .compact-search{ flex-wrap: wrap; gap: 8px; }
          .compact-input{ min-width: 0; flex: 1 1 200px; }
          .compact-select{ width: 160px; min-width: 0; flex: 0 0 auto; }
          .grid{ grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
          .stats-testimonial{ padding: 20px; gap: 20px; }
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
          .highlights{ padding: 32px 12px; }
          .grid{ grid-template-columns: 1fr; gap: 12px; }
          .card{ padding: 16px; }
          .stats-testimonial{ flex-direction: column; margin: 24px auto; padding: 12px; width: calc(100% - 24px); }
          .stats{ flex-direction: column; gap: 12px; width: 100%; }
          .stat{ min-width: auto; width: 100%; }
          .testimonial{ flex: none; width: 100%; margin-top: 16px; padding: 16px; }
        }

        @media (max-width: 480px) {
          .new-hero{ padding: 32px 12px; }
          .hero-left h1{ font-size: 1.5rem; margin: 0 0 8px; }
          .lead{ font-size: 0.9rem; margin: 0 0 12px; }
          .compact-input, .compact-select{ padding: 10px 12px; font-size: 14px; }
          .primary-cta, .ghost{ padding: 10px; font-size: 14px; }
          .hero-right img{ max-width: 240px; }
          .highlights{ padding: 24px 12px; }
          .card{ padding: 12px; }
          .card h3{ font-size: 1rem; margin: 0 0 6px; }
          .card p{ font-size: 0.9rem; line-height: 1.4; }
          .stats-testimonial{ margin: 16px auto; padding: 12px; }
          .stat{ padding: 12px; }
          .stat strong{ font-size: 1.2rem; }
          .testimonial{ padding: 12px; }
          .testimonial blockquote{ font-size: 0.9rem; }
        }

        @media (max-width: 375px) {
          .new-hero{ padding: 24px 8px; }
          .hero-left h1{ font-size: 1.3rem; }
          .lead{ font-size: 0.85rem; }
          .compact-input, .compact-select{ padding: 8px 10px; }
          .hero-right img{ max-width: 200px; }
          .highlights{ padding: 20px 8px; }
          .card{ padding: 10px; }
          .stats-testimonial{ padding: 8px; }
          .stat{ padding: 10px; }
          .stat strong{ font-size: 1.1rem; }
        }

        /* Landscape orientation on mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .hero-inner{ flex-direction: row; }
          .hero-left{ flex: 1.5; }
          .hero-right{ flex: 1; }
          .hero-left h1{ font-size: 1.6rem; }
          .new-hero{ padding: 20px 16px; }
          .stats{ flex-direction: row; }
        }

        /* Touch-friendly targets */
        @media (hover: none) and (pointer: coarse) {
          .primary-cta, .ghost, .compact-input, .compact-select{ 
            min-height: 44px; 
            padding: 12px 16px; 
          }
        }
  `}</style>
    </div>
  );
};

export default Homepage;
