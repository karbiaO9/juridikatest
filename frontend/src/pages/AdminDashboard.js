import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import VerificationModal from '../components/VerificationModal';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/adminApi';
import mapToKey from '../utils/i18nMapping';

const AdminDashboard = () => {
  const { t } = useTranslation();
  
  // Check admin authentication on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token') || user.token;
    
    console.log('Admin Dashboard - Current user:', user);
    console.log('Admin Dashboard - Current token:', token);
    console.log('Admin Dashboard - User role:', user.role);
    console.log('Admin Dashboard - User type:', user.userType);
    
    if (!user.role || user.role !== 'admin') {
      alert(t('adminDashboard.accessDenied'));
      // Optionally redirect to login
      // window.location.href = '/login';
    }
  }, [t]);
  
  const [stats, setStats] = useState({
    totalLawyers: 0,
    verifiedLawyers: 0,
    pendingLawyers: 0,
    totalClients: 0
  });
  
  const [pendingLawyers, setPendingLawyers] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch admin statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        if (response.success) {
          setStats(response.stats);
        }
      } catch (error) {
        alert(t('adminDashboard.failedToFetchStats', { defaultValue: 'Failed to fetch statistics' }));
      }
    };

    fetchStats();
  }, [t]);

  // Fetch pending lawyers
  useEffect(() => {
    const fetchPendingLawyers = async () => {
      try {
        setIsLoading(true);
        const response = await adminApi.getPendingLawyers();
        if (response.success) {
          setPendingLawyers(response.lawyers);
        }
      } catch (error) {
        alert(t('adminDashboard.failedToFetchLawyers', { defaultValue: 'Failed to fetch pending lawyers' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingLawyers();
  }, [t]);

  const handleViewDetails = (lawyer) => {
    setSelectedLawyer(lawyer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLawyer(null);
  };

  const handleApprove = async (lawyerId) => {
    try {
      setIsVerifying(true);
      const response = await adminApi.verifyLawyer(lawyerId, 'approve');
      if (response.success) {
        alert(t('adminDashboard.lawyerApproved', { defaultValue: 'Lawyer approved successfully' }));
        // Remove from pending list and update stats
        setPendingLawyers(prev => prev.filter(lawyer => lawyer._id !== lawyerId));
        setStats(prev => ({
          ...prev,
          verifiedLawyers: prev.verifiedLawyers + 1,
          pendingLawyers: prev.pendingLawyers - 1
        }));
        handleCloseModal();
      }
    } catch (error) {
      alert(t('adminDashboard.failedToApprove', { defaultValue: 'Failed to approve lawyer' }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async (lawyerId) => {
    try {
      setIsVerifying(true);
      const response = await adminApi.verifyLawyer(lawyerId, 'reject');
      if (response.success) {
        alert(t('adminDashboard.lawyerRejected', { defaultValue: 'Lawyer application rejected' }));
        // Remove from pending list and update stats
        setPendingLawyers(prev => prev.filter(lawyer => lawyer._id !== lawyerId));
        setStats(prev => ({
          ...prev,
          totalLawyers: prev.totalLawyers - 1,
          pendingLawyers: prev.pendingLawyers - 1
        }));
        handleCloseModal();
      }
    } catch (error) {
      alert(t('adminDashboard.failedToReject', { defaultValue: 'Failed to reject lawyer' }));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <Navbar />
      <div className="admin-container">
        <header className="admin-header">
          <h1>{t('adminDashboard.adminConsole')}</h1>
          <p>{t('adminDashboard.manageUsers')}</p>
        </header>

        {/* Statistics Cards */}
        <section className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon lawyers">⚖️</div>
            <div className="stat-content">
              <h3>{stats.totalLawyers}</h3>
              <p>{t('adminDashboard.totalLawyers')}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon verified">✅</div>
            <div className="stat-content">
              <h3>{stats.verifiedLawyers}</h3>
              <p>{t('adminDashboard.verifiedLawyers')}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-content">
              <h3>{stats.pendingLawyers}</h3>
              <p>{t('adminDashboard.pendingVerifications')}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon clients">👥</div>
            <div className="stat-content">
              <h3>{stats.totalClients}</h3>
              <p>{t('adminDashboard.totalClients')}</p>
            </div>
          </div>
        </section>

        {/* Pending Lawyers Verification */}
        <section className="verification-section">
          <h2>{t('adminDashboard.pendingVerifications')}</h2>
          
          {isLoading ? (
            <div className="loading-state">
              <p>{t('adminDashboard.loading')}</p>
            </div>
          ) : pendingLawyers.length === 0 ? (
            <div className="empty-state">
              <p>{t('adminDashboard.noPendingRequests')}</p>
            </div>
          ) : (
            <div className="lawyers-table">
              <div className="table-header">
                <div className="header-cell">{t('adminDashboard.name')}</div>
                <div className="header-cell">{t('adminDashboard.email')}</div>
                <div className="header-cell">{t('adminDashboard.city')}</div>
                <div className="header-cell">{t('adminDashboard.specialty')}</div>
                <div className="header-cell">{t('adminDashboard.submittedDate')}</div>
                <div className="header-cell">{t('adminDashboard.actions')}</div>
              </div>
              
              {pendingLawyers.map((lawyer) => (
                <div key={lawyer._id} className="table-row">
                  <div className="table-cell" data-label={t('adminDashboard.name')}>
                    <div className="lawyer-name">
                      {lawyer.avatarUrl && (
                        <img src={lawyer.avatarUrl} alt="" className="lawyer-avatar" />
                      )}
                      <span>{lawyer.fullName}</span>
                    </div>
                  </div>
                  <div className="table-cell" data-label={t('adminDashboard.email')}>{lawyer.email}</div>
                  <div className="table-cell" data-label={t('adminDashboard.city')}>
                    {t(`lawyerListing.cities.${mapToKey(lawyer.ville, 'city')}`, { defaultValue: lawyer.ville })}
                  </div>
                  <div className="table-cell" data-label={t('adminDashboard.specialty')}>
                    {t(`lawyerListing.specialties.${mapToKey(lawyer.specialites, 'specialty')}`, { defaultValue: lawyer.specialites })}
                  </div>
                  <div className="table-cell" data-label={t('adminDashboard.submittedDate')}>
                    {new Date(lawyer.createdAt).toLocaleDateString()}
                  </div>
                  <div className="table-cell" data-label={t('adminDashboard.actions')}>
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewDetails(lawyer)}
                    >
                      {t('adminDashboard.viewDetails')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <VerificationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          lawyer={selectedLawyer}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={isVerifying}
        />
      </div>

  <style>{`
        .admin-dashboard { 
          background: #F4F4F4; 
          min-height: 100vh; 
          font-family: var(--font-sans); 
        }
        
        .admin-container { 
          max-width: 1200px; 
          margin: 28px auto; 
          padding: 24px; 
        }
        
        .admin-header h1 { 
          color: #1B263B; 
          font-size: 2rem; 
          margin: 0 0 6px 0; 
          font-family: var(--font-serif); 
        }
        
        .admin-header p { 
          color: #2D2D2D; 
          margin: 0 0 32px 0; 
        }

        /* Statistics Cards */
        .admin-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: #FFFFFF;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #F4F4F4;
          box-shadow: 0 6px 20px rgba(27,38,59,0.04);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .stat-icon.lawyers { background: #FEF3C7; }
        .stat-icon.verified { background: #D1FAE5; }
        .stat-icon.pending { background: #FED7AA; }
        .stat-icon.clients { background: #DBEAFE; }

        .stat-content h3 {
          margin: 0 0 4px 0;
          color: #1B263B;
          font-size: 2rem;
          font-weight: 700;
        }

        .stat-content p {
          margin: 0;
          color: #6B7280;
          font-size: 0.9rem;
        }

        /* Verification Section */
        .verification-section {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 6px 20px rgba(27,38,59,0.04);
        }

        .verification-section h2 {
          margin: 0 0 24px 0;
          color: #1B263B;
          font-size: 1.5rem;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6B7280;
        }

        /* Table Styles */
        .lawyers-table {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1.5fr 1fr 1fr;
          background: #F9FAFB;
          border-bottom: 1px solid #E5E7EB;
        }

        .header-cell {
          padding: 12px 16px;
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1.5fr 1fr 1fr;
          border-bottom: 1px solid #E5E7EB;
          transition: background-color 0.2s;
        }

        .table-row:hover {
          background: #F9FAFB;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-cell {
          padding: 16px;
          color: #1F2937;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
        }

        .lawyer-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lawyer-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .view-details-btn {
          background: #CFAE70;
          color: #1B263B;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background-color 0.2s;
        }

        .view-details-btn:hover {
          background: #B8965C;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .admin-stats {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .stat-card {
            padding: 16px;
            flex-direction: column;
            text-align: center;
            gap: 8px;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .header-cell,
          .table-cell {
            padding: 8px 12px;
          }

          .table-header {
            display: none;
          }

          .table-cell {
            border-bottom: 1px solid #F3F4F6;
            justify-content: space-between;
          }

          .table-cell::before {
            content: attr(data-label);
            font-weight: 600;
            color: #6B7280;
          }
        }

        @media (max-width: 480px) {
          .admin-stats {
            grid-template-columns: 1fr;
          }
        }
  `}</style>
    </div>
  );
};

export default AdminDashboard;
