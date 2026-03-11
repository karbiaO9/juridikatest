import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import { useTranslation } from 'react-i18next';
import AnimatedErrorBanner from '../components/AnimatedErrorBanner';
import { IoLocationSharp, IoMail, IoCall } from 'react-icons/io5';
import { GiGraduateCap } from 'react-icons/gi';
import { mapToKey } from '../utils/i18nMapping';

const LawyerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lawyer, setLawyer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingOpen, setBookingOpen] = useState(false);
    const { t, i18n } = useTranslation();

    // central mapToKey imported from src/utils/i18nMapping.js

    useEffect(() => {
        const fetchLawyerProfile = async () => {
            try {
                setLoading(true);
                setError(null); // Clear previous errors
                
                const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

                const response = await fetch(`${apiBaseUrl}/api/auth/avocats/${id}`, {
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
                console.log('Fetched lawyer profile:', data); // Debug log for mobile testing
                // Diagnostic: log mapping + translation for specialty
                try {
                    const rawSpec = data.specialites;
                    const mapped = mapToKey(rawSpec || '', 'specialty');
                    // attempt to read t() outside render for diagnostic
                    console.log('Diagnostic specialty mapping:', { rawSpec, mapped });
                } catch (e) {
                    console.warn('Diagnostic mapping failed', e);
                }
                setLawyer(data);
            } catch (error) {
                console.error('Error fetching lawyer profile:', error);
                // Add more detailed error logging for mobile debugging
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    hostname: window.location.hostname,
                    origin: window.location.origin,
                    lawyerId: id
                });
                setError(`${t('lawyerListing.unableToLoadLawyers')}: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchLawyerProfile();
        }
    }, [id, t]);

    if (loading) {
        return (
            <div className="lawyer-profile">
                <Navbar />
                <div className="loading-container">
                    <div className="loading">{t('lawyerProfile.loadingLawyerProfile')}</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !lawyer) {
        return (
            <div className="lawyer-profile">
                <Navbar />
                <div className="error-container">
                    <h2>{t('lawyerProfile.lawyerProfileNotAvailable')}</h2>
                    <p>{error || t('lawyerProfile.requestedProfileNotFound')}</p>
                    {error && (
                        <div className="debug-info">
                            <strong>{t('lawyerListing.debugInfo')}</strong><br/>
                            {t('lawyerListing.hostname')} {window.location.hostname}<br/>
                            {t('lawyerListing.origin')} {window.location.origin}<br/>
                            {t('lawyerListing.mobileDetected', { hostname: window.location.hostname })}
                        </div>
                    )}
                    <div className="error-actions">
                        <button onClick={() => navigate('/lawyers')} className="back-btn">
                            {t('lawyerProfile.backToLawyers')}
                        </button>
                        <button onClick={() => window.location.reload()} className="retry-btn">
                            {t('lawyerListing.tryAgain')}
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const getAvailabilityDays = () => {
        if (!lawyer.disponibilites) return [];
    // prefer app i18n language so we display weekdays in the active locale
    const locale = (i18n && i18n.language) || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
        return Object.entries(lawyer.disponibilites)
            .filter(([day, schedule]) => schedule.available)
            .map(([day, schedule]) => {
                // day is expected as lowercase english weekday (e.g., 'monday')
                let displayDay = day.charAt(0).toUpperCase() + day.slice(1);
                try {
                    // create a Date corresponding to the desired weekday in the current week
                    const now = new Date();
                    const currentWeekDay = now.getDay(); // 0 (Sun) - 6 (Sat)
                    // robust weekday mapping: support english, french, arabic names and numeric strings
                    const weekdayMap = {
                        // english
                        sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
                        // french common names
                        dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6,
                        // arabic common names (short/long)
                        '\u0627\u0644\u0623\u062d\u062f': 0, // الاحد
                        '\u0627\u0644\u0627\u062b\u0646\u064a\u0646': 1, // الاثنين
                        '\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621': 2, // الثلاثاء
                        '\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621': 3, // الاربعاء
                        '\u0627\u0644\u062e\u0645\u064a\u0633': 4, // الخميس
                        '\u0627\u0644\u062c\u0645\u0639\u0629': 5, // الجمعة
                        '\u0627\u0644\u0633\u0628\u062a': 6, // السبت
                        // numeric or short keys (monday, mon => 1 etc)
                        mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0
                    };
                    const key = String(day || '').trim().toLowerCase();
                    let targetIndex = null;
                    if (weekdayMap.hasOwnProperty(key)) {
                        targetIndex = weekdayMap[key];
                    } else if (!Number.isNaN(Number(key))) {
                        // if day is a number 0-6
                        const n = Number(key);
                        if (n >= 0 && n <= 6) targetIndex = n;
                    } else {
                        // try removing diacritics and punctuation
                        const simplified = key.normalize ? key.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]/g, '') : key.replace(/[^a-z0-9]/g, '');
                        if (weekdayMap.hasOwnProperty(simplified)) targetIndex = weekdayMap[simplified];
                    }
                    if (typeof targetIndex === 'number') {
                        // compute the date for that weekday in the current week
                        const diff = targetIndex - currentWeekDay;
                        const targetDate = new Date(now);
                        targetDate.setDate(now.getDate() + diff);
                        // use Intl to get localized weekday name (long for clarity)
                        displayDay = targetDate.toLocaleDateString(locale, { weekday: 'long' });
                    }
                } catch (e) {
                    // fallback to capitalized day string
                    console.warn('Locale weekday formatting failed', e);
                }

                return {
                    day: displayDay,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime
                };
            });
    };

    // compute preferred map address: prefer adresseCabinet, otherwise fall back to ville
    const mapAddress = lawyer.adresseCabinet && lawyer.adresseCabinet.trim()
        ? `${lawyer.adresseCabinet}${lawyer.ville ? ', ' + lawyer.ville : ''}, Tunisia`
        : (lawyer.ville && lawyer.ville.trim() ? `${lawyer.ville}, ${t('lawyerProfile.country')}` : null);

    const mapsEmbedUrl = mapAddress
        ? `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&z=15&output=embed`
        : null;

    const mapsOpenUrl = mapAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`
        : null;

    // WhatsApp link: normalize phone and build wa.me URL
    const formatWhatsAppPhone = (raw) => {
        if (!raw) return null;
        let n = String(raw || '').trim();
        // remove non-digits
        n = n.replace(/[^0-9]/g, '');
        if (!n) return null;
        // remove leading international 00
        if (n.startsWith('00')) n = n.slice(2);
        // if starts with 0 and length 9 (e.g., 0XXXXXXXX), remove leading 0 and prefix 216 (Tunisia)
        if (n.length === 9 && n.startsWith('0')) n = '216' + n.slice(1);
        // if length is 8 (local without leading zero), prefix Tunisia code
        if (n.length === 8) n = '216' + n;
        // if already includes country code (>= 11 digits), leave as-is
        return n;
    };

    const whatsappPhone = formatWhatsAppPhone(lawyer.phone);
    const whatsappText = `Bonjour ${lawyer.fullName || ''}, je souhaite prendre rendez-vous pour une consultation.`;
    const whatsappUrl = whatsappPhone ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappText)}` : null;

    return (
        <div className="lawyer-profile">
            <Navbar />
            {/* Error message (translated) */}
            <AnimatedErrorBanner message={error ? t('auth.invalidCredentials', { defaultValue: error }) : ''} visible={Boolean(error)} />
            
            {/* Breadcrumb Navigation */}
            <div className="breadcrumb">
                <div className="container">
                    <span onClick={() => navigate('/')} className="breadcrumb-link">{t('lawyerProfile.welcome')}</span>
                    <span className="breadcrumb-separator">/</span>
                    <span onClick={() => navigate('/lawyers')} className="breadcrumb-link">{t('lawyerProfile.lawyers')}</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{lawyer.ville}</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{lawyer.fullName}</span>
                </div>
            </div>

            {/* Header Section with Basic Info */}
            <div className="profile-header">
                <div className="container">
                    <div className="header-content">
                        <div className="lawyer-main-info">
                            <div className="lawyer-avatar-large">
                                {lawyer.avatarUrl ? (
                                    <img 
                                        src={lawyer.avatarUrl} 
                                        alt={lawyer.fullName}
                                        className="avatar-image-large"
                                    />
                                ) : (
                                    <span className="avatar-initial-large">
                                        {lawyer.fullName.charAt(0)}
                                    </span>
                                )}
                               
                            </div>
                            <div className="lawyer-header-info">
                                <h1 className="lawyer-name-large">
                                    {lawyer.fullName}
                                </h1>
                                <p className="lawyer-specialty-large">{t(`lawyerListing.specialties.${mapToKey(lawyer.specialites,'specialty')}`, { defaultValue: lawyer.specialites })}</p>
                                <p className="lawyer-location-large"><IoLocationSharp style={{ verticalAlign: 'middle' }} /> {t(`lawyerListing.cities.${mapToKey(lawyer.ville,'city')}`, { defaultValue: lawyer.ville })}</p>
                                {lawyer.anneExperience && (
                                    <div className="experience-info">
                                        <span className="experience-badge-large">
                                            <GiGraduateCap style={{ verticalAlign: 'middle' }} /> {lawyer.anneExperience} {t('lawyerProfile.yearsOfExperience')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="container">
                    <div className="content-grid">
                        {/* Left Column - Main Info */}
                        <div className="main-info">
                            {/* Contact Information */}
                            <div className="info-section">
                                <h2>{t('lawyerProfile.contactInformation')}</h2>
                                <div className="contact-details">
                                    <div className="contact-item">
                                        <div className="contact-icon"><IoMail /></div>
                                        <div className="contact-content">
                                            <span className="contact-label">{t('lawyerProfile.emailLabel')} </span>
                                            <span className="contact-value">{lawyer.email}</span>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <div className="contact-icon"><IoCall /></div>
                                        <div className="contact-content">
                                            <span className="contact-label">{t('lawyerProfile.phoneLabel')} </span>
                                            <span className="contact-value">{lawyer.phone}</span>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <div className="contact-icon"><IoLocationSharp /></div>
                                        <div className="contact-content">
                                            <span className="contact-label">{t('lawyerProfile.addressLabel')} </span>
                                            <span className="contact-value">
                                                {lawyer.adresseCabinet 
                                                    ? `${lawyer.adresseCabinet}, ${lawyer.ville}`
                                                    : (lawyer.ville || t('lawyerProfile.notSpecified'))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="info-section">
                                <h2>{t('lawyerProfile.professionalInformation')}</h2>
                                <div className="professional-details">
                                    <div className="detail-item">
                                        <span className="detail-label">{t('lawyerProfile.specialization', { defaultValue: 'Specialization' })}</span>
                                        <span className="detail-value">
                                            {t(
                                                `lawyerListing.specialties.${mapToKey(lawyer.specialites || '', 'specialty')}`,
                                                { defaultValue: lawyer.specialites || t('lawyerProfile.notSpecified') }
                                            )}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">{t('lawyerProfile.education')}</span>
                                        <span className="detail-value">{lawyer.diplome}</span>
                                    </div>
                                    {lawyer.adresseCabinet && (
                                        <div className="detail-item">
                                            <span className="detail-label">{t('lawyerProfile.cabinetAddress')}</span>
                                            <span className="detail-value">{lawyer.adresseCabinet}</span>
                                        </div>
                                    )}
                                    {lawyer.anneExperience && (
                                        <div className="detail-item">
                                            <span className="detail-label">{t('lawyerProfile.yearsOfExperience')}</span>
                                            <span className="detail-value">{lawyer.anneExperience} {t('lawyerProfile.years')}</span>
                                        </div>
                                    )}
                                    {lawyer.langues && lawyer.langues.length > 0 && (
                                        <div className="detail-item">
                                            <span className="detail-label">{t('lawyerProfile.languages')}</span>
                                            <div className="languages-container">
                                                {lawyer.langues.map((langue, index) => (
                                                    <span key={index} className="language-tag-large">
                                                        {langue}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Professional Bio */}
                            {lawyer.bio && (
                                <div className="info-section">
                                    <h2>{t('lawyerProfile.about')}</h2>
                                    <div className="bio-content">
                                        <p>{lawyer.bio}</p>
                                    </div>
                                </div>
                            )}

                            {/* Availability Schedule */}
                            {getAvailabilityDays().length > 0 && (
                                <div className="info-section">
                                    <h2>{t('lawyerProfile.availabilitySchedule')}</h2>
                                    <div className="availability-schedule">
                                        {getAvailabilityDays().map((dayInfo, index) => (
                                            <div key={index} className="schedule-item">
                                                <span className="schedule-day">{dayInfo.day} : </span>
                                                <span className="schedule-time">
                                                    {dayInfo.startTime} - {dayInfo.endTime}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Map and Actions */}
                        <div className="sidebar-info">
                            {/* Map Section: shows office address on an embedded map */}
                            <div className="map-section">
                                <h3>{t('lawyerProfile.officeLocation')}</h3>
                                                                { mapsEmbedUrl ? (
                                                                        <>
                                                                            <div className="map-frame" style={{ marginTop: 12, height: 220, borderRadius: 10, overflow: 'hidden' }}>
                                                                                <iframe
                                                                                        title={t('lawyerProfile.mapTitle')}
                                                                                        width="100%"
                                                                                        height="100%"
                                                                                        frameBorder="0"
                                                                                        style={{ border: 0 }}
                                                                                        loading="lazy"
                                                                                        src={mapsEmbedUrl}
                                                                                        aria-label={t('lawyerProfile.mapAriaLabel')}
                                                                                />
                                                                            </div>
                                                                            <div style={{ marginTop: 8, display:'flex', gap:8 }}>
                                                                                <a href={mapsOpenUrl} target="_blank" rel="noreferrer" className="contact-action">{t('lawyerProfile.openInGoogleMaps')}</a>
                                                                            </div>
                                                                        </>
                                                                ) : (
                                                                        <p style={{ color: '#6b7280', marginTop: 8 }}>{t('lawyerProfile.noAddressAvailable')}</p>
                                                                )}
                            </div>

                            {/* Book Appointment Section */}
                            <div className="appointment-section">
                                <h3>{t('lawyerProfile.scheduleConsultation')}</h3>
                                <div className="appointment-content">
                                    <p>{t('lawyerProfile.readyForLegalAdvice', { defaultValue: 'Ready to get legal advice?' })}</p>
                                    <button
                                        type="button"
                                        className="book-appointment-btn"
                                        onClick={() => setBookingOpen(true)}
                                        aria-haspopup="dialog"
                                    >
                                        {t('lawyerProfile.bookAppointment')}
                                    </button>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="quick-actions">
                                <button 
                                    className="back-to-search"
                                    onClick={() => navigate('/lawyers')}
                                >
                                    {t('lawyerProfile.backToSearch')}
                                </button>
                                { whatsappUrl ? (
                                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="contact-lawyer" style={{ display:'inline-block', textDecoration:'none', textAlign:'center' }}>
                                        {t('lawyerProfile.chatOnWhatsApp')}
                                    </a>
                                ) : (
                                    <button className="contact-lawyer" onClick={() => alert(t('lawyerProfile.noPhoneForWhatsApp')) }>
                                        {t('lawyerProfile.chatOnWhatsApp')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
            {/* Booking modal shows when user clicks Book Appointment */}
            <BookingModal
                avocat={lawyer}
                open={bookingOpen}
                onClose={() => setBookingOpen(false)}
            />
            <style>{`
                * { box-sizing: border-box; }
                :root { 
                  --navy:#1B263B; 
                  --charcoal:#2D2D2D; 
                  --gold:#CFAE70; 
                  --deep-green:#1D6A5E; 
                  --white:#FFFFFF; 
                  --light:#F4F4F4;
                  --shadow-light: rgba(27,38,59,0.06);
                  --shadow-medium: rgba(27,38,59,0.08);
                  --transition: all 0.3s ease;
                }

                .lawyer-profile { 
                  min-height:100vh; 
                  background:var(--light); 
                  font-family: var(--font-sans); 
                  color:var(--charcoal);
                  width: 100%;
                  overflow-x: hidden;
                }
                
                .container { 
                  max-width:1200px; 
                  margin:0 auto; 
                  padding:0 20px;
                  width: 100%;
                }

                /* Loading and Error States */
                .loading-container, .error-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 50vh;
                  padding: 40px 20px;
                  text-align: center;
                }

                .loading {
                  font-size: 18px;
                  color: var(--charcoal);
                  font-weight: 600;
                }

                .error-container h2 {
                  color: var(--navy);
                  margin-bottom: 16px;
                  font-size: 1.5rem;
                }

                .error-container p {
                  color: var(--charcoal);
                  margin-bottom: 20px;
                  max-width: 500px;
                }

                .debug-info {
                  background: #f8f9fa;
                  padding: 12px;
                  border-radius: 6px;
                  margin: 16px 0;
                  font-size: 12px;
                  color: #6c757d;
                  max-width: 400px;
                }

                .error-actions {
                  display: flex;
                  gap: 12px;
                  flex-wrap: wrap;
                  justify-content: center;
                }

                .back-btn, .retry-btn {
                  background: var(--navy);
                  color: var(--white);
                  border: none;
                  padding: 12px 24px;
                  border-radius: 8px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: var(--transition);
                }

                .retry-btn {
                  background: var(--gold);
                  color: var(--navy);
                }

                .back-btn:hover {
                  background: var(--charcoal);
                }

                .retry-btn:hover {
                  background: #B8965C;
                }

                /* Breadcrumb Navigation */
                .breadcrumb { 
                  background: rgba(255,255,255,0.95); 
                  padding:12px 0; 
                  border-bottom:2px solid var(--gold);
                  width: 100%;
                  overflow-x: hidden;
                }
                
                .breadcrumb-link { 
                  color:var(--navy); 
                  font-weight:700; 
                  cursor:pointer;
                  transition: var(--transition);
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                
                .breadcrumb-link:hover { 
                  color:var(--gold); 
                }

                .breadcrumb-separator {
                  margin: 0 8px;
                  color: var(--charcoal);
                }

                .breadcrumb-current {
                  color: var(--charcoal);
                  font-weight: 600;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }

                /* Profile Header */
                .profile-header { 
                  width:100%; 
                  background:var(--white); 
                  padding:36px 0; 
                  border-bottom:2px solid var(--gold); 
                  box-shadow:0 6px 30px var(--shadow-light);
                  overflow-x: hidden;
                }
                
                .header-content { 
                  display:flex; 
                  gap:30px; 
                  align-items:center;
                  width: 100%;
                  max-width: 100%;
                }
                
                .lawyer-main-info { 
                  display:flex; 
                  gap:28px; 
                  align-items:center; 
                  width:100%;
                  min-width: 0;
                  flex-wrap: wrap;
                }

                .lawyer-avatar-large { 
                  width:120px; 
                  height:120px; 
                  border-radius:50%; 
                  background:linear-gradient(135deg,var(--navy),var(--charcoal)); 
                  display:flex; 
                  align-items:center; 
                  justify-content:center; 
                  color:var(--white); 
                  font-size:44px; 
                  font-weight:800; 
                  border:4px solid var(--gold); 
                  box-shadow:0 12px 30px rgba(27,38,59,0.12); 
                  position:relative; 
                  overflow:hidden;
                  flex-shrink: 0;
                }
                
                .lawyer-avatar-large img, .avatar-image-large { 
                  width:100%; 
                  height:100%; 
                  object-fit:cover; 
                  display:block; 
                  border-radius:50%; 
                  max-width:120px; 
                  max-height:120px; 
                }
                
                .verified-badge-large { 
                  position:absolute; 
                  bottom:6px; 
                  right:6px; 
                  background:var(--deep-green); 
                  color:var(--white); 
                  width:30px; 
                  height:30px; 
                  border-radius:50%; 
                  display:flex; 
                  align-items:center; 
                  justify-content:center; 
                  font-weight:800; 
                  border:2px solid var(--white); 
                }

                .lawyer-header-info {
                  flex: 1;
                  min-width: 0;
                }

                .lawyer-name-large { 
                  font-size:2.25rem; 
                  font-weight:800; 
                  color:var(--navy); 
                  margin:0 0 8px 0; 
                  font-family: var(--font-serif);
                  line-height: 1.2;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                  max-width: 100%;
                }
                
                .lawyer-specialty-large { 
                  color:var(--gold); 
                  font-weight:700; 
                  margin:6px 0; 
                  font-size: 1.1rem;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                
                .lawyer-location-large { 
                  color:var(--charcoal); 
                  font-weight:600;
                  display: flex;
                  align-items: center;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                  gap: 6px;
                  margin: 8px 0;
                }

                .experience-info {
                  margin-top: 12px;
                }

                .experience-badge-large {
                  background: #f0f9ff;
                  color: var(--navy);
                  padding: 8px 12px;
                  border-radius: 8px;
                  font-weight: 600;
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 14px;
                }

                /* Main Content Grid */
                .main-content { 
                  padding:36px 0;
                  width: 100%;
                }
                
                .content-grid { 
                  display:grid; 
                  grid-template-columns:2fr 1fr; 
                  gap:36px;
                  width: 100%;
                  max-width: 100%;
                }

                .main-info {
                  display: flex;
                  flex-direction: column;
                  gap: 24px;
                  min-width: 0;
                  overflow-wrap: break-word;
                }

                .sidebar-info {
                  display: flex;
                  flex-direction: column;
                  min-width: 0;
                  gap: 20px;
                }

                /* Information Sections */
                .info-section { 
                  background:var(--white); 
                  padding:24px; 
                  border-radius:12px; 
                  border:1px solid var(--light); 
                  box-shadow:0 8px 30px rgba(27,38,59,0.04);
                  transition: var(--transition);
                }

                .info-section:hover {
                  box-shadow: 0 12px 40px rgba(27,38,59,0.06);
                }
                
                .info-section h2 { 
                  font-size:1.4rem; 
                  color:var(--navy); 
                  margin:0 0 18px; 
                  padding-bottom:12px; 
                  border-bottom:2px solid var(--gold);
                  font-family: var(--font-serif);
                }

                .info-section h3 {
                  font-size: 1.2rem;
                  color: var(--navy);
                  margin: 0 0 16px;
                  font-weight: 700;
                }

                /* Contact Details */
                .contact-details {
                  display: flex;
                  flex-direction: column;
                  gap: 16px;
                }

                .contact-item { 
                  display:flex; 
                  gap:18px; 
                  align-items:center; 
                  padding:16px; 
                  background:var(--light); 
                  border-radius:10px; 
                  border:1px solid var(--gold);
                  transition: var(--transition);
                  min-width: 0;
                  overflow-wrap: break-word;
                }

                .contact-item:hover {
                  background: #f8f9fa;
                  transform: translateY(-2px);
                }
                
                .contact-icon { 
                  width:48px; 
                  height:48px; 
                  border-radius:50%; 
                  background:var(--navy); 
                  color:var(--white); 
                  display:flex; 
                  align-items:center; 
                  justify-content:center;
                  font-size: 20px;
                  flex-shrink: 0;
                }

                .contact-content {
                  flex: 1;
                  min-width: 0;
                }
                
                .contact-label { 
                  font-weight:700; 
                  color:var(--charcoal);
                  display: block;
                  margin-bottom: 4px;
                }
                
                .contact-value { 
                  color:var(--navy);
                  font-weight: 600;
                  word-break: break-word;
                }

                /* Professional Details */
                .professional-details {
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
                }
                
                .detail-item { 
                  display:flex; 
                  justify-content:space-between; 
                  gap:12px; 
                  padding:12px 0; 
                  border-bottom:1px solid rgba(207,174,112,0.12);
                  align-items: flex-start;
                }
                
                .detail-label { 
                  font-weight:700; 
                  color:var(--navy);
                  min-width: 120px;
                  flex-shrink: 0;
                }
                
                .detail-value { 
                  color:var(--charcoal); 
                  font-weight:600;
                  text-align: right;
                  word-break: break-word;
                }

                .languages-container {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 6px;
                  justify-content: flex-end;
                }

                .language-tag-large { 
                  background:var(--light); 
                  color:var(--navy); 
                  padding:6px 10px; 
                  border-radius:999px; 
                  border:1px solid var(--gold); 
                  font-weight:700;
                  font-size: 12px;
                }

                /* Bio Content */
                .bio-content {
                  background:var(--light); 
                  padding:18px; 
                  border-radius:8px; 
                  border:1px solid var(--gold);
                  line-height: 1.6;
                }

                .bio-content p {
                  margin: 0;
                  color: var(--charcoal);
                }

                /* Availability Schedule */
                .availability-schedule { 
                  background:var(--light); 
                  padding:18px; 
                  border-radius:8px; 
                  border:1px solid var(--gold);
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
                }

                .schedule-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 8px 0;
                  border-bottom: 1px solid rgba(207,174,112,0.2);
                }

                .schedule-item:last-child {
                  border-bottom: none;
                }

                .schedule-day {
                  font-weight: 700;
                  color: var(--navy);
                }

                .schedule-time {
                  color: var(--charcoal);
                  font-weight: 600;
                }

                /* Sidebar Sections */
                .appointment-section, .map-section { 
                  background:var(--white); 
                  padding:20px; 
                  border-radius:12px; 
                  border:1px solid var(--light); 
                  box-shadow:0 8px 24px rgba(27,38,59,0.04);
                  transition: var(--transition);
                }

                .appointment-section:hover, .map-section:hover {
                  box-shadow: 0 12px 35px rgba(27,38,59,0.06);
                }
                
                .appointment-content p { 
                  color:var(--charcoal);
                  margin: 0 0 16px 0;
                  line-height: 1.5;
                }
                
                .book-appointment-btn { 
                  width:100%; 
                  background:var(--gold); 
                  color:var(--navy); 
                  padding:16px; 
                  border-radius:12px; 
                  border:none; 
                  font-weight:800; 
                  box-shadow:0 8px 24px rgba(207,174,112,0.2);
                  cursor: pointer;
                  transition: var(--transition);
                  font-size: 16px;
                }
                
                .book-appointment-btn:hover { 
                  background:#B8965C; 
                  transform:translateY(-2px);
                  box-shadow: 0 12px 30px rgba(207,174,112,0.3);
                }

                /* Map Section */
                .map-frame {
                  margin-top: 12px; 
                  height: 220px; 
                  border-radius: 10px; 
                  overflow: hidden;
                  border: 2px solid var(--light);
                  transition: var(--transition);
                }

                .map-frame:hover {
                  border-color: var(--gold);
                }

                .contact-action { 
                  background:var(--gold); 
                  color:var(--navy); 
                  padding:10px 16px; 
                  border-radius:10px; 
                  border:none; 
                  font-weight:800;
                  text-decoration: none;
                  display: inline-block;
                  transition: var(--transition);
                  cursor: pointer;
                }
                
                .contact-action:hover { 
                  background:#B8965C;
                  transform: translateY(-1px);
                }

                /* Quick Actions */
                .quick-actions { 
                  display:flex; 
                  gap:12px; 
                  align-items:center; 
                  margin-top:16px; 
                }
                
                .quick-actions .back-to-search, .quick-actions .contact-lawyer {
                    width:180px;
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                    padding:12px 16px;
                    border-radius:12px;
                    font-weight:700;
                    color:var(--white);
                    text-decoration:none;
                    border:none;
                    cursor: pointer;
                    transition: var(--transition);
                    font-size: 14px;
                }
                
                .quick-actions .back-to-search { 
                  background:var(--charcoal); 
                }

                .quick-actions .back-to-search:hover {
                  background: var(--navy);
                  transform: translateY(-1px);
                }
                
                .quick-actions .contact-lawyer { 
                  background:#25D366; 
                  box-shadow: 0 8px 20px rgba(37,211,102,0.12); 
                }

                .quick-actions .contact-lawyer:hover {
                  background: #22C55E;
                  transform: translateY(-1px);
                  box-shadow: 0 12px 25px rgba(37,211,102,0.2);
                }

                /* Error message styling */
                .error-message {
                    background: #fff5f5;
                    border: 1px solid #fecaca;
                    color: #b91c1c;
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                    margin: 12px 0;
                    direction: rtl;
                    text-align: right;
                }

                /* ============================= */
                /* RESPONSIVE DESIGN BREAKPOINTS */
                /* ============================= */

                /* Large Tablet (1024px and below) */
                @media (max-width: 1024px) {
                  .container {
                    padding: 0 16px;
                    max-width: calc(100vw - 32px);
                  }

                  .lawyer-name-large {
                    font-size: 2rem;
                  }

                  .content-grid {
                    gap: 24px;
                    max-width: 100%;
                  }

                  .lawyer-avatar-large {
                    width: 100px;
                    height: 100px;
                    font-size: 36px;
                  }

                  .quick-actions .back-to-search, 
                  .quick-actions .contact-lawyer {
                    width: 160px;
                    padding: 10px 14px;
                  }
                }

                /* Tablet (768px and below) */
                @media (max-width: 768px) {
                  .container {
                    padding: 0 12px;
                    max-width: calc(100vw - 24px);
                  }

                  /* Single column layout */
                  .content-grid { 
                    grid-template-columns: 1fr;
                    gap: 20px;
                    max-width: 100%;
                  }

                  /* Header adjustments */
                  .profile-header {
                    padding: 24px 0;
                    overflow-x: hidden;
                  }

                  .header-content { 
                    flex-direction: column; 
                    text-align: center; 
                    gap: 20px;
                    width: 100%;
                    max-width: 100%;
                  }

                  .lawyer-main-info {
                    flex-direction: column;
                    text-align: center;
                    gap: 16px;
                    width: 100%;
                    max-width: 100%;
                  }

                  .lawyer-name-large { 
                    font-size: 1.8rem;
                  }

                  .lawyer-specialty-large {
                    font-size: 1rem;
                  }

                  .lawyer-location-large {
                    justify-content: center;
                  }

                  /* Contact items mobile layout */
                  .contact-item {
                    flex-direction: column;
                    text-align: center;
                    gap: 12px;
                    padding: 20px 16px;
                  }

                  .contact-content {
                    text-align: center;
                  }

                  /* Detail items mobile layout */
                  .detail-item {
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 8px;
                  }

                  .detail-label {
                    min-width: auto;
                  }

                  .detail-value {
                    text-align: center;
                  }

                  .languages-container {
                    justify-content: center;
                  }

                  /* Schedule mobile layout */
                  .schedule-item {
                    flex-direction: column;
                    text-align: center;
                    gap: 4px;
                  }

                  /* Quick actions mobile layout */
                  .quick-actions { 
                    flex-direction: column; 
                    align-items: stretch; 
                    gap: 12px;
                  }
                  
                  .quick-actions .back-to-search, 
                  .quick-actions .contact-lawyer { 
                    width: 100%; 
                    justify-content: center; 
                  }

                  /* Info sections mobile spacing */
                  .info-section {
                    padding: 20px 16px;
                  }

                  .appointment-section, .map-section {
                    padding: 18px 16px;
                  }

                  /* Breadcrumb mobile */
                  .breadcrumb {
                    padding: 8px 0;
                    font-size: 14px;
                  }

                  .breadcrumb-separator {
                    margin: 0 6px;
                  }
                }

                /* Large Phone (480px and below) */
                @media (max-width: 480px) {
                  .container {
                    padding: 0 8px;
                    max-width: calc(100vw - 16px);
                  }

                  .main-content {
                    padding: 24px 0;
                  }

                  .profile-header {
                    padding: 20px 0;
                  }

                  .lawyer-avatar-large {
                    width: 80px;
                    height: 80px;
                    font-size: 28px;
                    border-width: 3px;
                  }

                  .lawyer-name-large {
                    font-size: 1.5rem;
                  }

                  .lawyer-specialty-large {
                    font-size: 0.9rem;
                  }

                  .info-section {
                    padding: 16px 12px;
                  }

                  .info-section h2 {
                    font-size: 1.2rem;
                  }

                  .appointment-section, .map-section {
                    padding: 16px 12px;
                  }

                  .contact-item {
                    padding: 16px 12px;
                  }

                  .contact-icon {
                    width: 40px;
                    height: 40px;
                    font-size: 16px;
                  }

                  .book-appointment-btn {
                    padding: 14px;
                    font-size: 15px;
                  }

                  .map-frame {
                    height: 180px;
                  }

                  /* Error and loading states mobile */
                  .loading-container, .error-container {
                    padding: 24px 12px;
                  }

                  .error-actions {
                    flex-direction: column;
                    align-items: stretch;
                  }

                  .back-btn, .retry-btn {
                    width: 100%;
                  }
                }

                /* Small Phone (375px and below) */
                @media (max-width: 375px) {
                  .container {
                    padding: 0 6px;
                    max-width: calc(100vw - 12px);
                  }

                  .lawyer-avatar-large {
                    width: 70px;
                    height: 70px;
                    font-size: 24px;
                  }

                  .lawyer-name-large {
                    font-size: 1.3rem;
                    line-height: 1.3;
                  }

                  .lawyer-specialty-large {
                    font-size: 0.85rem;
                  }

                  .info-section {
                    padding: 12px 10px;
                  }

                  .info-section h2 {
                    font-size: 1.1rem;
                  }

                  .appointment-section, .map-section {
                    padding: 14px 10px;
                  }

                  .contact-item {
                    padding: 14px 10px;
                  }

                  .contact-icon {
                    width: 36px;
                    height: 36px;
                    font-size: 14px;
                  }

                  .book-appointment-btn {
                    padding: 12px;
                    font-size: 14px;
                  }

                  .map-frame {
                    height: 160px;
                  }

                  .experience-badge-large {
                    padding: 6px 8px;
                    font-size: 12px;
                  }

                  .language-tag-large {
                    padding: 4px 6px;
                    font-size: 10px;
                  }

                  .breadcrumb {
                    font-size: 12px;
                  }
                }

                /* Landscape orientation optimizations */
                @media (max-width: 768px) and (orientation: landscape) {
                  .header-content {
                    flex-direction: row;
                    text-align: left;
                  }

                  .lawyer-main-info {
                    flex-direction: row;
                    text-align: left;
                  }

                  .lawyer-location-large {
                    justify-content: flex-start;
                  }

                  .quick-actions {
                    flex-direction: row;
                  }

                  .quick-actions .back-to-search, 
                  .quick-actions .contact-lawyer {
                    width: auto;
                    flex: 1;
                  }
                }

                /* Touch device optimizations */
                @media (hover: none) and (pointer: coarse) {
                  .book-appointment-btn,
                  .back-to-search,
                  .contact-lawyer,
                  .contact-action,
                  .back-btn,
                  .retry-btn {
                    min-height: 44px;
                    padding: 12px 16px;
                  }

                  .breadcrumb-link {
                    min-height: 44px;
                    display: inline-flex;
                    align-items: center;
                    padding: 8px 4px;
                  }
                }

                /* High-density display optimizations */
                @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                  .info-section {
                    box-shadow: 0 10px 35px rgba(27,38,59,0.06);
                  }

                  .appointment-section, .map-section {
                    box-shadow: 0 10px 30px rgba(27,38,59,0.06);
                  }

                  .lawyer-avatar-large {
                    box-shadow: 0 15px 35px rgba(27,38,59,0.15);
                  }

                  .book-appointment-btn {
                    box-shadow: 0 10px 30px rgba(207,174,112,0.25);
                  }
                }

                /* Print styles */
                @media print {
                  .breadcrumb,
                  .quick-actions,
                  .appointment-section {
                    display: none !important;
                  }

                  .lawyer-profile {
                    background: white !important;
                  }

                  .info-section {
                    box-shadow: none !important;
                    border: 1px solid #ccc !important;
                  }
                }
            `}</style>
        </div>
    );
};

export default LawyerProfile;
