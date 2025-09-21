
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import CasesManager from '../components/CasesManager';
import PaymentModal from '../components/PaymentModal';
import BookingModal from '../components/BookingModal';
import FileViewer from '../components/FileViewer';
import { rendezVousAPI, authAPI } from '../services/api';
import { validatePassword, PASSWORD_POLICY_MESSAGE } from '../utils/password';
import { useTranslation } from 'react-i18next';

// Helper: parse common created timestamp fields and sort newest first
function getCreatedTime(obj) {
  if (!obj) return 0;
  const possible = obj.createdAt || obj.createDate || obj.created || obj.dateCreated || obj.created_at || obj.createdOn || obj.createdAt;
  const t = possible ? new Date(possible).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
}

function sortAppointmentsByCreated(arr) {
  try {
    return [...(arr || [])].sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
  } catch (e) {
    return arr || [];
  }
}

const ClientDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [statistics, setStatistics] = useState({
    totalAppointments: 0,
    pendingRequests: 0,
    paidAppointments: 0,
    confirmedAppointments: 0,
    upcomingAppointments: 0
  });

  // Helper: parse common created timestamp fields and sort newest first
  // ...existing code...

  // Profile editing states
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Payment modal states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'en_attente' | 'confirmé' | 'refusé' | 'today'
  
  // Appointment details modal states
  const [appointmentDetailsModalOpen, setAppointmentDetailsModalOpen] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState(null);

  const handleLogout = () => {
    logout();
  };

  // Helper functions for status text
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmé': return t('clientDashboard.statusConfirmed');
      case 'en_attente': return t('clientDashboard.statusWaiting');
      case 'refusé': return t('clientDashboard.statusUnavailable');
      default: return status;
    }
  };

  // Load appointments and statistics
  useEffect(() => {
    if (user) {
      setLoading(true);
      const today = new Date();
      
  console.log('Loading appointments for client:', user);
  console.log('Client ID:', user.id || user._id);
      
      rendezVousAPI.getClientRendezVous(user.id || user._id)
        .then(response => {
          const appointmentData = response.data || response || [];
          const sorted = sortAppointmentsByCreated(appointmentData);
          console.log('Received client appointments (sorted):', sorted);
          setAppointments(sorted);

          const upcomingCount = sorted.filter(a => {
            const appointmentDate = new Date(a.date);
            return appointmentDate >= today && a.statut === 'confirmé';
          }).length;

          setStatistics({
            totalAppointments: sorted.length,
            pendingRequests: sorted.filter(a => a.statut === 'en_attente').length,
            paidAppointments: sorted.filter(a => a.statut === 'payé').length,
            confirmedAppointments: sorted.filter(a => a.statut === 'confirmé').length,
            upcomingAppointments: upcomingCount
          });
        })
        .catch(err => {
          console.error('Error loading client appointments:', err);
          console.error('Error response:', err.response?.data);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  // Profile form handlers
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
  console.log('Sending client profile update:', profileData);

      const response = await authAPI.updateProfile(profileData);

      if (response && response.data) {
        updateUser(response.data.user);
        setIsEditingProfile(false);
        alert(t('clientDashboard.profileUpdated'));
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
  const errorMessage = error.response?.data?.error || error.message || t('clientDashboard.errorUpdatingProfile');
  alert(`${t('common.errorPrefix')} ${errorMessage}`);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t('clientDashboard.passwordMismatch'));
      return;
    }

    // Use centralized validator utility
    if (!validatePassword(passwordData.newPassword)) {
      alert(PASSWORD_POLICY_MESSAGE);
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.status === 200) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChangingPassword(false);
        alert(t('clientDashboard.passwordChanged'));
      }
    } catch (error) {
  console.error('Error changing password:', error);
  const msg = error.response?.data?.error || error.response?.data?.message || error.message || t('clientDashboard.errorChangingPassword');
  alert(`${t('common.errorPrefix')} ${msg}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Payment handling functions
  const handlePayNow = (appointment) => {
    setSelectedAppointment(appointment);
    setPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async (appointmentId) => {
    try {
      // Simulate API call - in real implementation, this would call the backend
      console.log('Payment confirmed for appointment:', appointmentId);
      
      // Update local state to 'payé' status and keep list sorted
      setAppointments(prev => {
        const updated = prev.map(apt => apt._id === appointmentId ? { ...apt, statut: 'payé' } : apt);
        return sortAppointmentsByCreated(updated);
      });
      
      // Update statistics
      setStatistics(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests - 1,
        paidAppointments: prev.paidAppointments + 1
      }));
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert(t('clientDashboard.paymentError'));
    }
  };

  // Recompute statistics from current appointments array
  const computeStatisticsFrom = (arr) => {
    const appointmentData = arr || [];
    const today = new Date();
    const upcomingCount = appointmentData.filter(a => {
      const appointmentDate = new Date(a.date);
      return appointmentDate >= today && a.statut === 'confirmé';
    }).length;
    return {
      totalAppointments: appointmentData.length,
      pendingRequests: appointmentData.filter(a => a.statut === 'en_attente').length,
      paidAppointments: appointmentData.filter(a => a.statut === 'payé').length,
      confirmedAppointments: appointmentData.filter(a => a.statut === 'confirmé').length,
      upcomingAppointments: upcomingCount
    };
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm(t('clientDashboard.confirmCancel'))) return;

    // Optimistic UI update: mark as cancelled locally first
    let previous = null;
    setAppointments(prev => {
      previous = prev;
      const next = prev.map(a => a._id === appointmentId ? { ...a, statut: 'annulé' } : a);
      const sorted = sortAppointmentsByCreated(next);
      setStatistics(computeStatisticsFrom(sorted));
      return sorted;
    });

    try {
      await rendezVousAPI.updateRendezVous(appointmentId, { statut: 'annulé' });
      // success - nothing more to do, UI already updated
    } catch (err) {
      console.error('Error cancelling appointment', err);
      alert(t('clientDashboard.cancelError'));
      // revert to previous state
      if (previous) {
        setAppointments(sortAppointmentsByCreated(previous));
        setStatistics(computeStatisticsFrom(previous));
      }
    }
  };

  const handleRescheduleAppointment = (appointmentId) => {
    const apt = appointments.find(a => a._id === appointmentId);
    if (!apt) return alert(t('clientDashboard.appointmentNotFound'));
    setAppointmentToReschedule(apt);
    setBookingModalOpen(true);
  };

  const handleViewAppointmentDetails = (appointment) => {
    setSelectedAppointmentDetails(appointment);
    setAppointmentDetailsModalOpen(true);
  };

  const renderAppointmentCard = (appointment) => {
    console.log('Rendering client appointment card for:', appointment);
    console.log('Avocat ID data:', appointment.avocatId);
    
    const getStatusColor = (status) => {
      switch (status) {
        case 'confirmé': return 'linear-gradient(135deg, #10b981, #059669)';
        case 'en_attente': return 'linear-gradient(135deg, #f59e0b, #d97706)';
        case 'refusé': return 'linear-gradient(135deg, #ef4444, #dc2626)';
        default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'confirmé': return 'Confirmé';
        case 'en_attente': return 'En attente';
        case 'refusé': return 'Refusé';
        default: return status;
      }
    };

    const appointmentDate = new Date(appointment.date);
    const isUpcoming = appointmentDate >= new Date() && appointment.statut === 'confirmé';

    return (
      <div key={appointment._id} className={`appointment-card-elegant ${appointment.statut} ${isUpcoming ? 'upcoming' : ''}`}>
        <div className="appointment-card-main" onClick={() => handleViewAppointmentDetails(appointment)}>
          <div className="appointment-header-elegant">
            <div className="lawyer-info-elegant">
              <h3 className="lawyer-name-elegant">
                Me. {appointment.avocatId?.fullName || 
                     appointment.avocatId?.nom || 
                     appointment.lawyerInfo?.nom || 
                     appointment.lawyerNom || 
                     'Legal Advisor'}
              </h3>
              <span 
                className="status-pill"
                style={{ background: getStatusColor(appointment.statut) }}
              >
                {getStatusText(appointment.statut)}
              </span>
            </div>
            
            <div className="appointment-timing">
              <div className="date-display">
                <span className="day">{appointmentDate.getDate()}</span>
                <span className="month">{appointmentDate.toLocaleDateString('fr-FR', { month: 'short' })}</span>
              </div>
              <div className="time-display">
                <span className="time">{appointment.heure}</span>
                <span className="day-name">{appointmentDate.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="appointment-actions-elegant">
          <button 
            className="action-btn primary-action"
            onClick={(e) => {
              e.stopPropagation();
              handleViewAppointmentDetails(appointment);
            }}
          >
            {t('clientDashboard.viewDetails')}
          </button>

          <div className="secondary-actions">
            {appointment.statut === 'en_attente' && (
              <button 
                className="action-btn secondary-action"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayNow(appointment);
                }}
              >
                {t('clientDashboard.pay')}
              </button>
            )}

            {(appointment.statut === 'confirmé' || appointment.statut === 'en_attente') && (
              <>
                <button 
                  className="action-btn secondary-action" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRescheduleAppointment(appointment._id);
                  }}
                >
                  {t('clientDashboard.reschedule')}
                </button>
                <button 
                  className="action-btn danger-action" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelAppointment(appointment._id);
                  }}
                >
                  {t('clientDashboard.cancel')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAppointmentsView = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('clientDashboard.loadingAppointments')}</p>
        </div>
      );
    }

  const canceledStatuses = ['refusé', 'annulé', 'rejeté'];
  const pendingAppointments = appointments.filter(a => a.statut === 'en_attente');
  const confirmedAppointments = appointments.filter(a => a.statut === 'confirmé');
  const rejectedAppointments = appointments.filter(a => canceledStatuses.includes(a.statut));

    return (
      <div className="appointments-view">
        <div className="view-header">
          <h2 className="view-title">{t('clientDashboard.myConsultations')}</h2>
          <p className="view-subtitle">{t('clientDashboard.trackAppointments')}</p>
        </div>

        {/* Statistics Cards (click a card to filter) */}
        <div className="stats-grid">
          <div className={`stat-card ${filterStatus === 'all' ? 'active-filter' : ''}`} onClick={() => setFilterStatus('all')} role="button" tabIndex={0}>
            <div className="stat-content">
              <h3>{statistics.totalAppointments}</h3>
              <p>{t('clientDashboard.totalAppointments')}</p>
            </div>
          </div>
          <div className={`stat-card pending ${filterStatus === 'en_attente' ? 'active-filter' : ''}`} onClick={() => setFilterStatus('en_attente')} role="button" tabIndex={0}>
            <div className="stat-content">
              <h3>{statistics.pendingRequests}</h3>
              <p>{t('clientDashboard.awaitingResponse')}</p>
            </div>
          </div>
          <div className={`stat-card confirmed ${filterStatus === 'confirmé' ? 'active-filter' : ''}`} onClick={() => setFilterStatus('confirmé')} role="button" tabIndex={0}>
            <div className="stat-content">
              <h3>{statistics.confirmedAppointments}</h3>
              <p>{t('clientDashboard.confirmedMeetings')}</p>
            </div>
          </div>
          <div className={`stat-card today ${filterStatus === 'today' ? 'active-filter' : ''}`} onClick={() => setFilterStatus('today')} role="button" tabIndex={0}>
            <div className="stat-content">
              <h3>{statistics.upcomingAppointments}</h3>
              <p>{t('clientDashboard.upcomingMeetings')}</p>
            </div>
          </div>
        </div>


        {/* Appointments listing: grouped when filter is 'all', otherwise show filtered list */}
        {filterStatus === 'all' ? (
          <>
            {/* Pending Appointments */}
            {pendingAppointments.length > 0 && (
              <div className="appointments-section">
                <h3 className="section-title">
                  <span className="section-icon"></span>
                  {t('clientDashboard.waitingResponse')} ({pendingAppointments.length})
                </h3>
                <div className="section-description">
                  <p>{t('clientDashboard.waitingResponseDesc')}</p>
                </div>
                <div className="appointments-grid">
                  {pendingAppointments.map(renderAppointmentCard)}
                </div>
              </div>
            )}

            {/* Confirmed Appointments */}
            {confirmedAppointments.length > 0 && (
              <div className="appointments-section">
                <h3 className="section-title">
                  <span className="section-icon"></span>
                  {t('clientDashboard.confirmedConsultations')} ({confirmedAppointments.length})
                </h3>
                <div className="section-description">
                  <p>{t('clientDashboard.confirmedConsultationsDesc')}</p>
                </div>
                <div className="appointments-grid">
                  {confirmedAppointments.map(renderAppointmentCard)}
                </div>
              </div>
            )}

            {/* Canceled / Unavailable Appointments */}
            {rejectedAppointments.length > 0 && (
              <div className="appointments-section">
                <h3 className="section-title">
                  <span className="section-icon"></span>
                  {t('clientDashboard.canceledUnavailable')} ({rejectedAppointments.length})
                </h3>
                <div className="section-description">
                  <p>{t('clientDashboard.canceledUnavailableDesc')}</p>
                </div>
                <div className="appointments-grid">
                  {rejectedAppointments.map(renderAppointmentCard)}
                </div>
              </div>
            )}

            {appointments.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <h3>{t('clientDashboard.welcomeLegalHub')}</h3>
                <p>{t('clientDashboard.noConsultationsYet')}</p>
                <div className="empty-actions">
                  <button 
                    className="find-lawyers-btn primary"
                    onClick={() => window.location.href = '/lawyers'}
                  >
                    {t('clientDashboard.browseLawyers')}
                  </button>
                  <div className="help-info">
                    <p><strong>{t('clientDashboard.howItWorks')}:</strong></p>
                    <ol>
                      <li>{t('clientDashboard.step1')}</li>
                      <li>{t('clientDashboard.step2')}</li>
                      <li>{t('clientDashboard.step3')}</li>
                      <li>{t('clientDashboard.step4')}</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Filtered Appointments */}
            <div className="appointments-section">
              <h3 className="section-title">
                <span className="section-icon"></span>
                {filterStatus === 'today' ? t('clientDashboard.upcomingMeetings') : 
                 filterStatus === 'confirmé' ? t('clientDashboard.confirmedMeetings') :
                 filterStatus === 'en_attente' ? t('clientDashboard.awaitingResponse') :
                 filterStatus === 'refusé' ? t('clientDashboard.canceledUnavailable') :
                 t('clientDashboard.allAppointments')} ({(() => {
                  const filteredAppointments = filterStatus === 'today'
                    ? appointments.filter(a => {
                        const appointmentDate = new Date(a.date);
                        const today = new Date();
                        return appointmentDate.toDateString() === today.toDateString() && a.statut === 'confirmé';
                      })
                    : appointments.filter(a => a.statut === filterStatus);
                  return filteredAppointments.length;
                })()})
              </h3>
              <div className="appointments-grid">
                {(() => {
                  const filteredAppointments = filterStatus === 'today'
                    ? appointments.filter(a => {
                        const appointmentDate = new Date(a.date);
                        const today = new Date();
                        return appointmentDate.toDateString() === today.toDateString() && a.statut === 'confirmé';
                      })
                    : appointments.filter(a => a.statut === filterStatus);
                  
                  return filteredAppointments.length > 0 
                    ? filteredAppointments.map(renderAppointmentCard)
                    : (
                      <div className="no-appointments">
                        <p>{t('clientDashboard.noFilteredAppointments')}</p>
                      </div>
                    );
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderProfileView = () => {
    return (
      <div className="profile-view">
        <div className="view-header">
          <h2 className="view-title">{t('clientDashboard.personalInformation')}</h2>
          <p className="view-subtitle">{t('clientDashboard.keepContactUpdated')}</p>
        </div>

        <div className="profile-sections">
          {/* Personal Information Section */}
          <div className="profile-section">
                <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon"></span>
                {t('clientDashboard.contactInformation')}
              </h3>
              {!isEditingProfile && (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditingProfile(true)}
                >
                  {t('clientDashboard.updateInfo')}
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-intro">
                  <p>{t('clientDashboard.keepInfoCurrent')}</p>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="fullName">{t('clientDashboard.fullName')} *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileInputChange}
                      className="form-input"
                      placeholder={t('clientDashboard.enterFullName')}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">{t('clientDashboard.emailAddress')} *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileInputChange}
                      className="form-input"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">{t('clientDashboard.phoneNumber')}</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileInputChange}
                      className="form-input"
                      placeholder="(555) 123-4567"
                    />
                    <small className="field-help">{t('clientDashboard.phoneHelp')}</small>
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="address">{t('clientDashboard.address')}</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileInputChange}
                    className="form-input"
                    placeholder={t('clientDashboard.addressPlaceholder')}
                  />
                  <small className="field-help">{t('clientDashboard.addressHelp')}</small>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    {t('clientDashboard.cancel')}
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={profileLoading}
                  >
                    {profileLoading ? t('clientDashboard.saving') : t('clientDashboard.saveChanges')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-display">
                <div className="profile-info-grid">
                  <div className="info-item">
                    <label>{t('clientDashboard.fullName')}</label>
                    <p>{user.fullName || t('clientDashboard.addName')}</p>
                  </div>
                  
                  <div className="info-item">
                    <label>{t('clientDashboard.emailAddress')}</label>
                    <p>{user.email || t('clientDashboard.addEmail')}</p>
                  </div>
                  
                  <div className="info-item">
                    <label>{t('clientDashboard.phoneNumber')}</label>
                    <p>{user.phone || t('clientDashboard.addPhone')}</p>
                  </div>
                  
                  <div className="info-item full-width">
                    <label>{t('clientDashboard.address')}</label>
                    <p>{user.address || t('clientDashboard.addAddress')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Password Change Section */}
          <div className="profile-section">
                <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon"></span>
                {t('clientDashboard.accountSecurity')}
              </h3>
              {!isChangingPassword && (
                <button 
                  className="edit-btn"
                  onClick={() => setIsChangingPassword(true)}
                >
                  {t('clientDashboard.changePassword')}
                </button>
              )}
            </div>

            <div className="security-info">
              <p>{t('clientDashboard.securityInfo')}</p>
            </div>

            {isChangingPassword && (
              <form onSubmit={handleChangePassword} className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">{t('clientDashboard.currentPassword')}</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    required
                    className="form-input"
                    placeholder={t('clientDashboard.enterCurrentPassword')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">{t('clientDashboard.newPassword')}</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    required
                    minLength="8"
                    className="form-input"
                    placeholder={t('clientDashboard.enterNewPassword')}
                  />
                  <small className="field-help">{t('clientDashboard.passwordRequirements')}</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">{t('clientDashboard.confirmNewPassword')}</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                    minLength="8"
                    className="form-input"
                    placeholder={t('clientDashboard.reenterNewPassword')}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setIsChangingPassword(false)}
                  >
                    {t('clientDashboard.cancel')}
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? t('clientDashboard.updating') : t('clientDashboard.updatePassword')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderOverviewView = () => {
    return (
      <div className="overview-view">
        <div className="content-header">
          <h1 className="content-title">{t('clientDashboard.welcomeToLegalHub')}</h1>
          <p className="content-subtitle">{t('clientDashboard.trackAppointments')}</p>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-number">{statistics.totalAppointments}</h3>
            <p className="stat-label">{t('clientDashboard.totalAppointments')}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">{statistics.confirmedAppointments}</h3>
            <p className="stat-label">{t('clientDashboard.confirmedMeetings')}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">{statistics.pendingRequests}</h3>
            <p className="stat-label">{t('clientDashboard.awaitingResponse')}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">{statistics.upcomingAppointments}</h3>
            <p className="stat-label">{t('clientDashboard.upcomingMeetings')}</p>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{t('clientDashboard.recentAppointments')}</h2>
          </div>
          <div className="card-content">
            {appointments.length === 0 ? (
              <div className="empty-state">
                <p>{t('clientDashboard.noAppointmentsYet')}</p>
                <button className="btn btn-primary" onClick={() => setCurrentView('appointments')}>
                  {t('clientDashboard.browseLawyers')}
                </button>
              </div>
            ) : (
              <div className="appointments-list">
                {appointments.slice(0, 3).map(appointment => (
                  <div key={appointment._id} className={`appointment-card ${appointment.statut}`}>
                    <div className="appointment-details">
                      <h4>{appointment.lawyerInfo?.fullName || appointment.avocatId?.fullName || 'Lawyer'}</h4>
                      <p>{new Date(appointment.date).toLocaleDateString()}</p>
                      <span className={`status-badge ${appointment.statut === 'confirmé' ? 'status-confirmed' : 'status-pending'}`}>
                        {getStatusText(appointment.statut)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return renderOverviewView();
      case 'appointments':
        return renderAppointmentsView();
      case 'cases':
        return <CasesManager appointments={appointments} user={user} />;
      case 'profile':
        return renderProfileView();
      default:
        return renderOverviewView();
    }
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('clientDashboard.loading')}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sticky Navbar */}
      <div className="navbar-wrapper">
        <Navbar />
      </div>

      {/* Mobile Menu Toggle */}
      <div className="mobile-menu-toggle">
        <button 
          className="menu-toggle-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      <div className="main-layout">
        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-content">
            <div className="sidebar-header">
              <h2 className="sidebar-subtitle">{t('clientDashboard.clientPortal')}</h2>
              <button 
                className="close-sidebar-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

          <div className="user-profile">
            <div className="profile-card">
              <div className="profile-avatar-card">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName || 'Client'} />
                ) : (
                  <span className="avatar-initial">{user.fullName?.charAt(0)?.toUpperCase() || 'C'}</span>
                )}
              </div>
              <div className="profile-card-details">
                <div className="profile-name-row">
                  <h3 className="profile-name">{user.fullName || 'Client'}</h3>
                </div>
                <p className="profile-role">{t('clientDashboard.clientAccount')}</p>
                <div className="profile-status">
                  <span className="status-indicator verified"></span>
                  <span className="status-text">{t('clientDashboard.active')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="nav-menu">
            <button className={`nav-item ${currentView === 'overview' ? 'active' : ''}`} onClick={() => { setCurrentView('overview'); setIsMobileMenuOpen(false); }}>
              <span className="nav-text">{t('clientDashboard.overview')}</span>
            </button>
            <button className={`nav-item ${currentView === 'appointments' ? 'active' : ''}`} onClick={() => { setCurrentView('appointments'); setIsMobileMenuOpen(false); }}>
              <span className="nav-text">{t('clientDashboard.myAppointments')}</span>
            </button>
            <button className={`nav-item ${currentView === 'cases' ? 'active' : ''}`} onClick={() => { setCurrentView('cases'); setIsMobileMenuOpen(false); }}>
              <span className="nav-text">{t('clientDashboard.myCases')}</span>
            </button>
            <button className={`nav-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => { setCurrentView('profile'); setIsMobileMenuOpen(false); }}>
              <span className="nav-text">{t('clientDashboard.myInformation')}</span>
            </button>
          </div>

          <div className="sidebar-footer">
            <button className="signout-btn" onClick={handleLogout}><span className="signout-text">{t('clientDashboard.signOut')}</span></button>
          </div>
          </div>
        </div>

        <div className="content-area">
          {renderContent()}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentConfirm={handlePaymentConfirm}
        appointment={selectedAppointment}
      />

      <BookingModal
        avocat={appointmentToReschedule?.avocatId || appointmentToReschedule?.lawyerInfo || { _id: appointmentToReschedule?.avocatId }}
        open={bookingModalOpen}
        onClose={() => { setBookingModalOpen(false); setAppointmentToReschedule(null); }}
        mode="reschedule"
        existingAppointment={appointmentToReschedule}
        onRescheduled={(updated) => {
          const updatedObj = updated._id ? updated : updated.rendezvous || updated;
          setAppointments(prev => {
            const next = prev.map(a => a._id === updatedObj._id ? updatedObj : a);
            const sorted = sortAppointmentsByCreated(next);
            setStatistics(computeStatisticsFrom(sorted));
            return sorted;
          });
        }}
      />

      {/* Appointment Details Modal */}
      {appointmentDetailsModalOpen && selectedAppointmentDetails && (
        <div className="appointment-details-modal" onClick={() => setAppointmentDetailsModalOpen(false)}>
          <div className="appointment-details-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="appointment-details-modal-header">
              <h3>{t('clientDashboard.appointmentDetails')}</h3>
              <button className="close-btn" onClick={() => setAppointmentDetailsModalOpen(false)}>×</button>
            </div>
            
            <div className="appointment-details-modal-body">
              <div className="appointment-details-section">
                <h4>{t('clientDashboard.lawyerInformation')}</h4>
                <div className="lawyer-info-card">
                  <div className="lawyer-avatar">
                    {selectedAppointmentDetails.avocatId?.avatarUrl ? (
                      <img src={selectedAppointmentDetails.avocatId.avatarUrl} alt="Lawyer" />
                    ) : (
                      <span className="avatar-placeholder">
                        {(selectedAppointmentDetails.avocatId?.fullName || 'L').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="lawyer-details">
                    <h5>{selectedAppointmentDetails.avocatId?.fullName || selectedAppointmentDetails.lawyerNom || 'Legal Advisor'}</h5>
                    <p>{selectedAppointmentDetails.avocatId?.specialization || 'Legal Consultant'}</p>
                    <p>{selectedAppointmentDetails.avocatId?.email || 'Contact via platform'}</p>
                    {selectedAppointmentDetails.avocatId?.phone && (
                      <p>{selectedAppointmentDetails.avocatId.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="appointment-details-section">
                <h4>{t('clientDashboard.appointmentInformation')}</h4>
                <div className="appointment-info-grid">
                  <div className="info-item">
                    <span className="info-label">{t('clientDashboard.date')}:</span>
                    <span className="info-value">
                      {new Date(selectedAppointmentDetails.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('clientDashboard.time')}:</span>
                    <span className="info-value">{selectedAppointmentDetails.heure}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('clientDashboard.status')}:</span>
                    <span className="info-value status-value" style={{ color: (() => {
                      switch (selectedAppointmentDetails.statut) {
                        case 'confirmé': return '#10b981';
                        case 'en_attente': return '#f59e0b';
                        case 'refusé': return '#ef4444';
                        default: return '#6b7280';
                      }
                    })() }}>
                      {getStatusText(selectedAppointmentDetails.statut)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedAppointmentDetails.message && (
                <div className="appointment-details-section">
                  <h4>{t('clientDashboard.yourMessage')}</h4>
                  <div className="message-content">
                    <p>{selectedAppointmentDetails.message}</p>
                  </div>
                </div>
              )}

              {selectedAppointmentDetails.note && (
                <div className="appointment-details-section">
                  <h4>{t('clientDashboard.lawyerNotes')}</h4>
                  <div className="note-content">
                    <p>{selectedAppointmentDetails.note}</p>
                  </div>
                </div>
              )}

              {selectedAppointmentDetails.caseFiles && selectedAppointmentDetails.caseFiles.length > 0 && (
                <div className="appointment-details-section">
                  <h4>{t('clientDashboard.clientFiles')}</h4>
                  <div className="documents-list">
                    {selectedAppointmentDetails.caseFiles.map((doc, index) => (
                      <FileViewer 
                        key={index}
                        file={doc.url || doc}
                        fileName={doc.filename || `Document ${index + 1}`}
                        showPreview={true}
                        className="appointment-document"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedAppointmentDetails.case && selectedAppointmentDetails.case.files && selectedAppointmentDetails.case.files.length > 0 && (
                <div className="appointment-details-section">
                  <h4>{t('clientDashboard.lawyerFiles')}</h4>
                  <div className="documents-list">
                    {selectedAppointmentDetails.case.files.map((fileUrl, index) => (
                      <FileViewer 
                        key={index}
                        file={fileUrl}
                        fileName={`Case Document ${index + 1}`}
                        showPreview={true}
                        className="appointment-document"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="appointment-details-modal-footer">
              {selectedAppointmentDetails.statut === 'en_attente' && (
                <button 
                  className="pay-now-btn-modal"
                  onClick={() => {
                    setAppointmentDetailsModalOpen(false);
                    handlePayNow(selectedAppointmentDetails);
                  }}
                >
                  {t('clientDashboard.payNow')}
                </button>
              )}

              {(selectedAppointmentDetails.statut === 'confirmé' || selectedAppointmentDetails.statut === 'en_attente') && (
                <>
                  <button 
                    className="reschedule-btn-modal" 
                    onClick={() => {
                      setAppointmentDetailsModalOpen(false);
                      handleRescheduleAppointment(selectedAppointmentDetails._id);
                    }}
                  >
                    {t('clientDashboard.reschedule')}
                  </button>
                  <button 
                    className="cancel-btn-modal" 
                    onClick={() => {
                      setAppointmentDetailsModalOpen(false);
                      handleCancelAppointment(selectedAppointmentDetails._id);
                    }}
                  >
                    {t('clientDashboard.cancel')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Elegant design tokens */
        :root{
          --bg: #F7F8FA;
          --card: #FFFFFF;
          --muted: #6b7280;
          --text: #1f2937;
          --accent: #234e52; /* deeper teal */
          --gold: #cfae70;
          --shadow-elev: 0 10px 30px rgba(15,23,42,0.08);
          --radius-lg: 14px;
          --radius-md: 10px;
        }

        .dashboard-container {
          background: var(--bg);
          min-height: 100vh;
          font-family: var(--font-sans);
          color: var(--text);
          -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
        }

        /* Sticky Navbar Wrapper */
        .navbar-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--primary-navy);
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .main-layout { display:flex; flex-direction: column; min-height:calc(100vh - 80px); }

        /* Desktop Sidebar - Traditional vertical sidebar */
        .sidebar { 
          position: fixed;
          top: 80px;
          left: 0;
          width: 280px;
          height: calc(100vh - 80px);
          background: #1B263B;
          color: white;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
          z-index: 1000;
          overflow-y: auto;
          transition: all 0.3s ease;
        }

        .sidebar-content {
          padding: 20px 0;
        }

        .sidebar-header { 
          padding: 20px; 
          border-bottom: 1px solid rgba(255,255,255,0.1); 
          text-align: center;
        }

        .sidebar-subtitle { 
          color: #CFAE70; 
          font-weight: 800; 
          font-size: 1.1rem; 
          margin: 0; 
          font-family: var(--font-serif);
        }

        /* User Profile Card - Vertical Layout */
        .user-profile { 
          padding: 20px; 
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex; 
          align-items: center; 
          gap: 12px;
        } 
          border-right: 1px solid rgba(255,255,255,0.04);
          flex-shrink: 0;
        }

        .profile-card { 
          display: flex; 
          gap: 12px; 
          align-items: center; 
          background: transparent; 
          padding: 8px; 
          border-radius: 12px; 
          color: white; 
          border: 1px solid rgba(255,255,255,0.03);
          white-space: nowrap;
        }

        .profile-avatar-card { 
          width: 40px; 
          height: 40px; 
          border-radius: 50%; 
          overflow: hidden; 
          flex: 0 0 40px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: linear-gradient(135deg, #CFAE70, #1D6A5E); 
          border: 1px solid rgba(255,255,255,0.06);
        }

        .profile-avatar-card img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          display: block;
        }

        .avatar-initial { 
          font-weight: 800; 
          font-size: 16px; 
          color: #1B263B;
        }

        .profile-card-details { 
          flex: 1;
        }

        .profile-name { 
          font-weight: 800; 
          color: white; 
          margin: 0; 
          font-size: 14px;
        }

        .profile-role { 
          color: rgba(255,255,255,0.9); 
          margin: 2px 0 4px;
          font-size: 11px;
        }

        .profile-status { 
          display: flex; 
          align-items: center; 
          gap: 0.25rem; 
        }

        .status-indicator { 
          width: 6px; 
          height: 6px; 
          border-radius: 50%; 
          background: #10b981; 
        }

        .status-text { 
          color: rgba(255,255,255,0.9); 
          font-weight: 700; 
          font-size: 11px;
        }

        /* Navigation Menu - Vertical Layout */
        .nav-menu { 
          padding: 0; 
          display: flex;
          flex-direction: column;
          list-style: none;
          margin: 0;
        }

        .nav-item { 
          padding: 15px 25px; 
          color: rgba(255,255,255,0.9); 
          background: transparent; 
          border: none; 
          text-align: left; 
          cursor: pointer; 
          font-weight: 600; 
          display: flex; 
          gap: 12px; 
          align-items: center; 
          border-left: 3px solid transparent; 
          transition: all 0.3s ease;
          width: 100%;
          font-size: 15px;
        }

        .nav-item:hover { 
          background: rgba(255,255,255,0.05); 
          color: #CFAE70; 
        }

        .nav-item.active { 
          background: rgba(207,174,112,0.1); 
          color: #CFAE70; 
          border-left-color: #CFAE70; 
        }

        .nav-text { 
          flex: 1; 
        }

        /* Sidebar Footer - Vertical Layout */
        .sidebar-footer { 
          padding: 20px; 
          border-top: 1px solid rgba(255,255,255,0.1);
          margin-top: auto;
        }

        .signout-btn { 
          background: #1D6A5E; 
          color: white; 
          padding: 12px 20px; 
          border-radius: 8px; 
          border: none; 
          font-weight: 700; 
          cursor: pointer;
          transition: background 0.3s ease;
          font-size: 14px;
          width: 100%;
        }

        .signout-btn:hover { 
          background: #155448; 
        }

        /* Content Area */
        .content-area {
          margin-left: 280px;
          padding: 30px;
          min-height: calc(100vh - 80px);
          background: #f8fafc;
        }

        /* Content Sections */
        .content-header { 
          margin-bottom: 2rem; 
        }

        .content-title { 
          font-size: 1.875rem; 
          font-weight: 700; 
          color: var(--text); 
          margin: 0 0 0.5rem 0; 
        }

        .content-subtitle { 
          color: var(--muted); 
          font-size: 1rem; 
          margin: 0; 
        }

        /* Stats Cards */
        .stats-grid { 
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: thin;
          scrollbar-color: var(--gold) transparent;
        }

        .stats-grid::-webkit-scrollbar {
          height: 6px;
        }

        .stats-grid::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .stats-grid::-webkit-scrollbar-thumb {
          background: var(--gold);
          border-radius: 3px;
        }

        .stat-card { 
          background: var(--card); 
          border-radius: var(--radius-lg); 
          padding: 1rem 1.2rem; 
          box-shadow: var(--shadow-elev); 
          border: 1px solid #f3f4f6; 
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
          flex-shrink: 0;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .stat-card.active-filter {
          background: linear-gradient(135deg, #cfae70, #d4af37);
          color: white;
          border-color: #cfae70;
          box-shadow: 0 8px 25px rgba(207,174,112,0.3);
        }

        .stat-card.active-filter .stat-label {
          color: rgba(255,255,255,0.9);
        }

        .stat-number { 
          font-size: 1.5rem; 
          font-weight: 700; 
          color: var(--accent); 
          margin: 0 0 0.3rem 0; 
          line-height: 1.2;
        }

        .stat-label { 
          color: var(--muted); 
          font-size: 0.75rem; 
          font-weight: 500; 
          margin: 0;
          line-height: 1.3;
        }

        /* Cards */
        .card { 
          background: var(--card); 
          border-radius: var(--radius-lg); 
          box-shadow: var(--shadow-elev); 
          border: 1px solid #f3f4f6; 
          overflow: hidden; 
        }

        .card-header { 
          padding: 1.5rem 1.5rem 1rem; 
          border-bottom: 1px solid #f3f4f6; 
        }

        .card-title { 
          font-size: 1.125rem; 
          font-weight: 600; 
          color: var(--text); 
          margin: 0; 
        }

        .card-content { 
          padding: 1.5rem; 
        }

        /* Forms */
        .form-group { 
          margin-bottom: 1.5rem; 
        }

        .form-label { 
          display: block; 
          font-size: 0.875rem; 
          font-weight: 500; 
          color: var(--text); 
          margin-bottom: 0.5rem; 
        }

        .form-input { 
          width: 100%; 
          padding: 0.75rem; 
          border: 1px solid #d1d5db; 
          border-radius: var(--radius-md); 
          font-size: 0.875rem; 
          transition: border-color 0.2s ease; 
        }

        .form-input:focus { 
          outline: none; 
          border-color: var(--gold); 
          box-shadow: 0 0 0 3px rgba(207, 174, 112, 0.1); 
        }

        /* Buttons */
        .btn { 
          padding: 0.75rem 1.5rem; 
          border-radius: var(--radius-md); 
          font-size: 0.875rem; 
          font-weight: 500; 
          cursor: pointer; 
          transition: all 0.2s ease; 
          border: none; 
        }

        .btn-primary { 
          background: var(--gold); 
          color: white; 
        }

        .btn-primary:hover { 
          background: #b8941f; 
          transform: translateY(-1px); 
        }

        .btn-secondary { 
          background: #f3f4f6; 
          color: var(--text); 
        }

        .btn-secondary:hover { 
          background: #e5e7eb; 
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 70px;
          left: 16px;
          z-index: 1001;
          background: var(--primary-navy);
          border-radius: 8px;
          padding: 4px;
        }

        .menu-toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          z-index: 1002;
          position: relative;
        }

        .hamburger {
          width: 24px;
          height: 18px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hamburger span {
          display: block;
          height: 3px;
          width: 100%;
          background: white;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        .mobile-close-btn {
          display: none;
          background: none;
          border: none;
          font-size: 24px;
          color: var(--text);
          cursor: pointer;
          padding: 4px;
          line-height: 1;
        }

        /* Responsive Design - Mobile */
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block;
          }

          .main-layout { 
            flex-direction: column; 
          }

          /* Mobile: Convert sidebar to drawer */
          .sidebar { 
            position: fixed;
            top: 0;
            left: -100%;
            width: 85%;
            max-width: 320px;
            height: 100vh;
            background: #1B263B;
            z-index: 1001;
            transition: left 0.3s ease;
            overflow-y: auto;
            box-shadow: 2px 0 10px rgba(0,0,0,0.3);
          }

          .sidebar.mobile-open {
            left: 0;
          }

          .sidebar-content {
            flex-direction: column;
            height: 100%;
            padding: 0;
          }

          .sidebar-header {
            border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
          }

          .close-sidebar-btn {
            background: none;
            border: none;
            color: #CFAE70;
            font-size: 24px;
            cursor: pointer;
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 1001;
            min-width: 40px;
            min-height: 40px;
            border-radius: 4px;
            transition: background-color 0.2s;
          }

          .close-sidebar-btn:hover {
            background-color: rgba(207, 174, 112, 0.1);
          }

          .user-profile {
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 20px;
          }

          .profile-card {
            white-space: normal;
          }

          .profile-avatar-card {
            width: 56px;
            height: 56px;
            flex: 0 0 56px;
          }

          .avatar-initial {
            font-size: 20px;
          }

          .profile-name {
            font-size: 16px;
          }

          .profile-role {
            font-size: 13px;
            margin: 2px 0 6px;
          }

          .status-indicator {
            width: 8px;
            height: 8px;
          }

          .status-text {
            font-size: 13px;
          }

          .nav-menu {
            flex-direction: column;
            padding: 16px 0;
            gap: 0;
            flex: 1;
          }

          .nav-item {
            width: 100%;
            padding: 12px 20px;
            text-align: left;
            border-bottom: none;
            border-left: 4px solid transparent;
            white-space: normal;
            min-width: auto;
            color: rgba(255,255,255,0.9) !important;
            font-size: 16px;
            font-weight: 500;
          }

          .nav-item:hover {
            background: rgba(255,255,255,0.1);
            color: #CFAE70 !important;
          }

          .nav-item.active {
            border-bottom: none;
            border-left-color: #CFAE70;
            background: rgba(207,174,112,0.15);
            color: #CFAE70 !important;
          }

          .nav-text {
            text-align: left;
            color: inherit;
            display: block;
          }

          .sidebar-footer {
            border-left: none;
            border-top: 1px solid rgba(255,255,255,0.04);
            padding: 18px;
            position: relative;
          }

          .signout-btn {
            width: 100%;
            padding: 12px;
            font-size: 14px;
            white-space: normal;
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
          }

          .content-area { 
            margin-left: 0; 
            margin-top: 80px;
            padding: 20px; 
            padding-top: 80px;
            min-height: calc(100vh - 80px);
          }

          .stats-grid { 
            gap: 0.8rem;
            margin-bottom: 1.5rem;
          }

          .stat-card {
            min-width: 120px;
            padding: 0.8rem 1rem;
          }

          .stat-number {
            font-size: 1.3rem;
          }

          .stat-label {
            font-size: 0.7rem;
          }

          /* Profile Section Mobile Improvements */
          .profile-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .form-group {
            margin-bottom: 1rem;
          }

          .form-input, .form-textarea {
            padding: 1rem;
            font-size: 16px; /* Prevents zoom on iOS */
            border-radius: 12px;
          }

          .form-label {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
          }

          .btn {
            padding: 1rem 1.5rem;
            font-size: 1rem;
            border-radius: 12px;
            min-height: 48px; /* Better touch targets */
          }

          .card {
            border-radius: 16px;
            margin-bottom: 1.5rem;
          }

          .card-header {
            padding: 1.25rem;
          }

          .card-content {
            padding: 1.25rem;
          }

          .card-title {
            font-size: 1.25rem;
          }

          /* Close overlay when clicked */
          .sidebar:not(.mobile-open) .sidebar-overlay {
            pointer-events: none;
          }
        }

        @media (max-width: 480px) {
          .mobile-menu-toggle {
            top: 65px;
            left: 12px;
          }

          .content-area {
            padding: 16px 12px;
            padding-top: 75px;
          }

          .sidebar {
            width: 260px;
            left: -100%;
          }

          .sidebar-header {
            padding: 12px 16px;
          }

          .sidebar-subtitle {
            font-size: 1.1rem;
          }

          /* Extra small screen form improvements */
          .form-input, .form-textarea {
            padding: 0.875rem;
            font-size: 16px;
          }

          .btn {
            padding: 0.875rem 1.25rem;
            font-size: 0.95rem;
          }

          .card-header, .card-content {
            padding: 1rem;
          }

          .stats-grid {
            gap: 0.6rem;
            margin-bottom: 1rem;
          }

          .stat-card {
            min-width: 100px;
            padding: 0.6rem 0.8rem;
          }

          .stat-number {
            font-size: 1.1rem;
          }

          .stat-label {
            font-size: 0.65rem;
          }
          }

          .stat-card {
            padding: 1rem;
          }
        }

        /* Arabic RTL Support */
        [dir="rtl"] .main-layout {
          direction: rtl;
        }

        [dir="rtl"] .sidebar {
          left: auto;
          right: 0;
        }

        [dir="rtl"] .content-area {
          margin-left: 0;
          margin-right: 300px;
        }

        [dir="rtl"] .nav-item {
          text-align: right;
          border-left: none;
          border-right: 4px solid transparent;
        }

        [dir="rtl"] .nav-item.active {
          border-right-color: #CFAE70;
        }

        [dir="rtl"] .profile-card {
          flex-direction: row-reverse;
        }

        @media (max-width: 768px) {
          [dir="rtl"] .content-area {
            margin-right: 0;
          }
        }

        /* Loading states */
        .loading-container { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 50vh; 
          flex-direction: column; 
          gap: 1rem; 
        }

        .loading-spinner { 
          width: 32px; 
          height: 32px; 
          border: 3px solid #f3f4f6; 
          border-top: 3px solid var(--gold); 
          border-radius: 50%; 
          animation: spin 1s linear infinite; 
        }

        /* Empty state and no appointments */
        .no-appointments {
          text-align: center;
          padding: 2rem;
          color: var(--muted);
          font-style: italic;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: var(--muted);
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1rem;
          background: #f3f4f6;
          border-radius: 50%;
        }

        /* Appointments sections */
        .appointments-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .appointments-grid {
          display: grid;
          gap: 1rem;
        }

        .appointment-card {
          background: var(--card);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          border: 1px solid #f3f4f6;
          box-shadow: var(--shadow-elev);
          transition: all 0.2s ease;
        }

        .appointment-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        /* Elegant Appointment Card Styles */
        .appointment-card-elegant {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          padding: 0;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          margin-bottom: 1rem;
          overflow: hidden;
          position: relative;
        }

        .appointment-card-elegant::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--gold) 0%, var(--accent) 100%);
        }

        .appointment-card-elegant:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border-color: var(--accent);
        }

        .appointment-card-elegant.confirmé::before {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        .appointment-card-elegant.en_attente::before {
          background: linear-gradient(90deg, #f59e0b, #d97706);
        }

        .appointment-card-elegant.refusé::before {
          background: linear-gradient(90deg, #ef4444, #dc2626);
        }

        .appointment-card-main {
          padding: 1.5rem;
          background: transparent;
        }

        .appointment-header-elegant {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
        }

        .lawyer-info-elegant {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .lawyer-name-elegant {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.3;
          font-family: var(--font-serif);
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 1rem;
          border-radius: 20px;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          max-width: fit-content;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .appointment-timing {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          min-width: 100px;
        }

        .date-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: linear-gradient(135deg, var(--accent) 0%, #1e40af 100%);
          color: white;
          border-radius: 12px;
          padding: 0.75rem;
          min-width: 70px;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
        }

        .date-display .day {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1;
        }

        .date-display .month {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.9;
        }

        .time-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .time-display .time {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
        }

        .time-display .day-name {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .appointment-actions-elegant {
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          font-family: var(--font-sans);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .action-btn .btn-icon {
          font-size: 1rem;
        }

        .primary-action {
          background: linear-gradient(135deg, var(--gold) 0%, #d97706 100%);
          color: white;
          flex: 1;
          justify-content: center;
          max-width: 200px;
        }

        .primary-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(217, 119, 6, 0.3);
        }

        .secondary-actions {
          display: flex;
          gap: 0.75rem;
        }

        .secondary-action {
          background: linear-gradient(135deg, var(--accent) 0%, #1e40af 100%);
          color: white;
        }

        .secondary-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(30, 64, 175, 0.3);
        }

        .danger-action {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .danger-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
        }

        /* Mobile responsiveness for elegant cards */
        @media (max-width: 768px) {
          .appointment-header-elegant {
            flex-direction: column;
            gap: 1rem;
          }

          .appointment-timing {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
            align-items: center;
          }

          .appointment-actions-elegant {
            flex-direction: column;
            gap: 0.75rem;
            padding: 1rem;
          }

          .primary-action {
            max-width: none;
            width: 100%;
          }

          .secondary-actions {
            width: 100%;
            justify-content: space-between;
          }

          .secondary-action,
          .danger-action {
            flex: 1;
          }

          .date-display {
            padding: 0.5rem;
            min-width: 60px;
          }

          .date-display .day {
            font-size: 1.25rem;
          }
        }

        @media (max-width: 480px) {
          .appointment-card-elegant {
            margin: 0 -0.5rem 1rem -0.5rem;
            border-radius: 12px;
          }

          .appointment-card-main {
            padding: 1rem;
          }

          .lawyer-name-elegant {
            font-size: 1.1rem;
          }

          .secondary-actions {
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        /* Appointment Details Modal Styles */
        .appointment-details-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .appointment-details-modal-content {
          background: white;
          border-radius: var(--radius-lg);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .appointment-details-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .appointment-details-modal-header h3 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--text);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--muted);
          padding: 0.5rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #f3f4f6;
        }

        .appointment-details-modal-body {
          padding: 1.5rem;
        }

        .appointment-details-section {
          margin-bottom: 2rem;
        }

        .appointment-details-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: var(--text);
          font-weight: 700;
        }

        .lawyer-info-card {
          display: flex;
          gap: 1rem;
          background: #f9fafb;
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid #f3f4f6;
        }

        .lawyer-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .lawyer-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .lawyer-details h5 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          color: var(--text);
        }

        .lawyer-details p {
          margin: 0.25rem 0;
          color: var(--muted);
          font-size: 0.9rem;
        }

        .appointment-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: var(--radius-md);
          border: 1px solid #f3f4f6;
        }

        .info-label {
          font-weight: 600;
          color: var(--muted);
        }

        .info-value {
          font-weight: 600;
          color: var(--text);
        }

        .status-value {
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.9rem;
        }

        .message-content,
        .note-content {
          background: #f9fafb;
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid #f3f4f6;
        }

        .documents-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .document-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: var(--radius-md);
          border: 1px solid #f3f4f6;
        }

        .document-icon {
          font-size: 1.5rem;
        }

        .document-name {
          flex: 1;
          font-weight: 500;
          color: var(--text);
        }

        .document-download {
          color: var(--accent);
          text-decoration: none;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          border: 1px solid var(--accent);
          transition: all 0.2s ease;
        }

        .document-download:hover {
          background: var(--accent);
          color: white;
        }

        .appointment-details-modal-footer {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #f3f4f6;
          justify-content: flex-end;
        }

        .pay-now-btn-modal,
        .cancel-btn-modal,
        .reschedule-btn-modal {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pay-now-btn-modal {
          background: var(--gold);
          color: white;
        }

        .cancel-btn-modal {
          background: #ef4444;
          color: white;
        }

        .reschedule-btn-modal {
          background: var(--accent);
          color: white;
        }

        .pay-now-btn-modal:hover,
        .cancel-btn-modal:hover,
        .reschedule-btn-modal:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .appointment-main-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .appointment-datetime {
            flex-direction: row;
            align-items: center;
            gap: 1rem;
          }

          .appointment-actions-simple {
            justify-content: center;
          }

          .appointment-details-modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }

          .appointment-info-grid {
            grid-template-columns: 1fr;
          }

          .lawyer-info-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .appointment-details-modal-footer {
            flex-direction: column;
            gap: 0.75rem;
          }
        }

        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
};

export default ClientDashboard;
