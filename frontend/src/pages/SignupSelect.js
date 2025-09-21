import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useValidation } from '../hooks/useValidation';
import PasswordStrength from '../components/PasswordStrength';
import Logo from '../components/Logo';
import FormInput from '../components/FormInput';
import { useTranslation } from 'react-i18next';
import './SignupSelect.css';

const SignupSelect = () => {
  const { t } = useTranslation();
  // Debug: render counter
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  // currentForm: 'signin' | 'signup' | 'lawyer'
  const [currentForm, setCurrentForm] = useState('signin');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  // helper to map internal field keys to translation keys/labels
  // keep internal field names for error storage, but display localized labels in messages
  const labelFor = (fieldKey) => {
    const map = {
      firstName: 'signupSelect.firstName',
      lastName: 'signupSelect.lastName',
      email: 'signupSelect.emailAddress',
      phone: 'signupSelect.phoneNumber',
      password: 'signupSelect.password',
      confirmPassword: 'signupSelect.confirmPassword',
      fullName: 'signupSelect.fullName',
      ville: 'signupSelect.selectCity',
      specialites: 'signupSelect.selectSpeciality',
      diplome: 'signupSelect.diploma',
      documentsVerif: 'signupSelect.uploadVerificationDocument'
    };
    const key = map[fieldKey] || fieldKey;
    const translated = t(key, { defaultValue: fieldKey });
    return translated;
  };

  const validationMessages = {
    required: (field) => t('validation.required', { field: labelFor(field) }),
    email: t('validation.email'),
    password: t('validation.password'),
    passwordMatch: t('validation.passwordMatch'),
    phone: t('validation.phone'),
    fileType: t('validation.fileType'),
    fileSize: (max) => t('validation.fileSize', { max }),
    fileRequired: t('validation.fileRequired'),
    minLength: (field, min) => t('validation.minLength', { field: labelFor(field), min }),
    maxLength: (field, max) => t('validation.maxLength', { field: labelFor(field), max })
  };

  const { errors, setError, validateField, validatePasswordMatch, validateFile, clearError: clearValidationError } = useValidation(validationMessages);

  const { signupAvocat, signupClient, login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // Clear auth and validation errors when switching forms
  useEffect(() => {
    // clear auth context error
    clearError();
    // clear validation errors for all fields
    Object.keys(errors || {}).forEach(f => {
      clearValidationError(f);
    });
    // also reset avocat step when leaving avocat form
    if (currentForm !== 'lawyer') setAvocatStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentForm]);

  // Error banner visibility state for CSS transition
  const [visibleError, setVisibleError] = useState('');
  const clearingRef = useRef(false);

  // Sync visibleError with auth/context/local errors but allow transition on hide
  useEffect(() => {
    let next = '';
    // choose the most relevant message depending on active form
    if (currentForm === 'signin') {
      next = error || '';
    } else if (currentForm === 'signup') {
      next = error || '';
    } else if (currentForm === 'lawyer') {
      next = error || '';
    } else {
      next = error || '';
    }

    console.log('Error visibility useEffect:', { currentForm, error, next, visibleError });

    if (next) {
      clearingRef.current = false;
      setVisibleError(next);
    } else {
      if (visibleError) {
        clearingRef.current = true;
        setVisibleError('');
        const t = setTimeout(() => {
          clearingRef.current = false;
        }, 320);
        return () => clearTimeout(t);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, currentForm]);

  const totalAvocatSteps = 3;
  const [avocatStep, setAvocatStep] = useState(1);
  const [avocatDirection, setAvocatDirection] = useState('');
  const prevAvocatStep = useRef(avocatStep);
  useEffect(() => {
    if (prevAvocatStep.current !== avocatStep) {
      setAvocatDirection(avocatStep > prevAvocatStep.current ? 'forward' : 'backward');
      prevAvocatStep.current = avocatStep;
      const t = setTimeout(() => setAvocatDirection(''), 360);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avocatStep]);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  useEffect(() => {
    // focus first field of current step
    if (avocatStep === 1) step1Ref.current?.focus();
    else if (avocatStep === 2) step2Ref.current?.focus();
    else if (avocatStep === 3) step3Ref.current?.focus();
  }, [avocatStep]);
  const [avocatData, setAvocatData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ville: '',
    specialites: '',
    diplome: '',
    documentsVerif: null,
    password: '',
    confirmPassword: '',
  });

  const avocatNext = () => { if (validateAvocatStep()) setAvocatStep(s => Math.min(s+1, totalAvocatSteps)); };
  const avocatPrev = () => setAvocatStep(s => Math.max(s-1,1));

  const validateAvocatStep = () => {
    let ok = true;
    if (avocatStep === 1) {
      if (!validateField('fullName', avocatData.fullName, { required: true })) ok = false;
      if (!validateField('email', avocatData.email, { required: true, type: 'email' })) ok = false;
      if (!validateField('ville', avocatData.ville, { required: true })) ok = false;
    } else if (avocatStep === 2) {
      if (!validateField('specialites', avocatData.specialites, { required: true })) ok = false;
      if (!validateField('diplome', avocatData.diplome, { required: true })) ok = false;
      if (!avocatData.documentsVerif) {
        validateField('documentsVerif', '', { required: true }); ok = false;
      } else {
        const f = validateFile(avocatData.documentsVerif);
        if (!f.isValid) { validateField('documentsVerif', '', { custom: () => f.error }); ok = false; } else { clearValidationError('documentsVerif'); }
      }
    } else if (avocatStep === 3) {
      if (!validateField('password', avocatData.password, { required: true, type: 'password' })) ok = false;
      if (!validatePasswordMatch(avocatData.password, avocatData.confirmPassword)) ok = false;
    }
    return ok;
  };

  // Simple per-step quick validity to enable/disable next button
  const isStepValidAvocat = (() => {
    if (avocatStep === 1) return !!avocatData.fullName && !!avocatData.email && !!avocatData.ville;
    if (avocatStep === 2) return !!avocatData.specialites && !!avocatData.diplome && !!avocatData.documentsVerif;
    if (avocatStep === 3) return !!avocatData.password && avocatData.password.length >= 8 && avocatData.password === avocatData.confirmPassword;
    return true;
  })();

  const handleAvocatChange = (e) => {
    const { name, value, type, files } = e.target;
    let fileError = null;
    if (type === 'file') {
      const file = files[0];
      setAvocatData(prev => {
        if (prev[name] === file) return prev;
        return { ...prev, [name]: file };
      });
      // validate file
      if (file) {
        const f = validateFile(file);
        if (!f.isValid) setError(name, f.error);
        else clearValidationError(name);
      }
    } else {
      // avoid writing same value (prevents needless re-renders that can steal focus)
      setAvocatData(prev => {
        if (prev[name] === value) return prev;
        return { ...prev, [name]: value };
      });
      if (errors[name]) clearValidationError(name);
    }
    if (fileError) clearError();
  };

  const handleAvocatPhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    
    // Limit to exactly 8 digits
    if (val.length > 8) {
      val = val.slice(0, 8);
    }
    
    setAvocatData(prev => {
      if (prev.phone === val) return prev;
      return { ...prev, phone: val };
    });
    
    if (errors.phone) clearValidationError('phone');
  };

  const handleAvocatSubmit = async (e) => {
    e.preventDefault();
    if (avocatStep < totalAvocatSteps) { avocatNext(); return; }
    if (!validateAvocatStep()) return;
    try {
      const form = new FormData();
      Object.keys(avocatData).forEach(k => {
        if (avocatData[k] !== null && avocatData[k] !== undefined) {
          if (k === 'langues') form.append(k, JSON.stringify(avocatData[k]));
          else form.append(k, avocatData[k]);
        }
      });
      await signupAvocat(form);
      navigate('/avocat/dashboard');
    } catch (err) { console.error('signup avocat error', err); }
  };

  const AvocatFormInner = () => {
    const renderStep = () => {
      switch (avocatStep) {
        case 1:
          return (
            <>
              <FormInput
                ref={step1Ref}
                id="avocatFullName"
                name="fullName"
                label={t('signupSelect.fullName')}
                placeholder={`${t('signupSelect.fullName')} *`}
                value={avocatData.fullName}
                onChange={handleAvocatChange}
                error={errors.fullName}
                required
              />
              <FormInput
                id="avocatEmail"
                name="email"
                label={t('signupSelect.emailAddress')}
                type="email"
                placeholder={`${t('signupSelect.emailAddress')} *`}
                value={avocatData.email}
                onChange={handleAvocatChange}
                error={errors.email}
                required
              />
              <div className="input-group">
                <label className="input-label">{t('signupSelect.phoneNumber')}</label>
                  <div className="phone-input-container">
                  <span className="phone-prefix">+216</span>
                  <input type="tel" name="phone" placeholder={t('signupSelect.phoneNumberPlaceholder') || '12345678'} value={avocatData.phone} onChange={handleAvocatPhoneChange} className={`phone-input ${errors.phone ? 'error' : ''}`} maxLength="8" />
                </div>
                <div className="field-error">{errors.phone || ''}</div>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="ville">{t('signupSelect.selectCity')}</label>
                <select id="ville" ref={step2Ref} name="ville" value={avocatData.ville} onChange={handleAvocatChange} className={errors.ville ? 'error' : ''}>
                  <option value="">{t('signupSelect.selectCity')}</option>
                  <option value="ariana">{t('signupSelect.cities.ariana')}</option>
                  <option value="beja">{t('signupSelect.cities.beja')}</option>
                  <option value="benArous">{t('signupSelect.cities.benArous')}</option>
                  <option value="bizerte">{t('signupSelect.cities.bizerte')}</option>
                  <option value="gabes">{t('signupSelect.cities.gabes')}</option>
                  <option value="gafsa">{t('signupSelect.cities.gafsa')}</option>
                  <option value="jendouba">{t('signupSelect.cities.jendouba')}</option>
                  <option value="kairouan">{t('signupSelect.cities.kairouan')}</option>
                  <option value="kasserine">{t('signupSelect.cities.kasserine')}</option>
                  <option value="kebili">{t('signupSelect.cities.kebili')}</option>
                  <option value="kef">{t('signupSelect.cities.kef')}</option>
                  <option value="mahdia">{t('signupSelect.cities.mahdia')}</option>
                  <option value="manouba">{t('signupSelect.cities.manouba')}</option>
                  <option value="medenine">{t('signupSelect.cities.medenine')}</option>
                  <option value="monastir">{t('signupSelect.cities.monastir')}</option>
                  <option value="nabeul">{t('signupSelect.cities.nabeul')}</option>
                  <option value="sfax">{t('signupSelect.cities.sfax')}</option>
                  <option value="sidiBouzid">{t('signupSelect.cities.sidiBouzid')}</option>
                  <option value="siliana">{t('signupSelect.cities.siliana')}</option>
                  <option value="sousse">{t('signupSelect.cities.sousse')}</option>
                  <option value="tataouine">{t('signupSelect.cities.tataouine')}</option>
                  <option value="tozeur">{t('signupSelect.cities.tozeur')}</option>
                  <option value="tunis">{t('signupSelect.cities.tunis')}</option>
                  <option value="zaghouan">{t('signupSelect.cities.zaghouan')}</option>
                </select>
                <div className="field-error">{errors.ville || ''}</div>
              </div>
            </>
          );
        case 2:
          return (
            <>
              <div className="input-group">
                <label className="input-label" htmlFor="specialites">{t('signupSelect.selectSpeciality')}</label>
                <select id="specialites" ref={step2Ref} name="specialites" value={avocatData.specialites} onChange={handleAvocatChange} className={errors.specialites ? 'error' : ''}>
                  <option value="">{t('signupSelect.selectSpeciality')}</option>
                  <option value="civilLaw">{t('signupSelect.civilLaw')}</option>
                  <option value="criminalLaw">{t('signupSelect.criminalLaw')}</option>
                  <option value="corporateLaw">{t('signupSelect.corporateLaw')}</option>
                  <option value="familyLaw">{t('signupSelect.familyLaw')}</option>
                  <option value="intellectualProperty">{t('signupSelect.intellectualProperty')}</option>
                  <option value="laborLaw">{t('signupSelect.laborLaw')}</option>
                  <option value="taxLaw">{t('signupSelect.taxLaw')}</option>
                  <option value="realEstateLaw">{t('signupSelect.realEstateLaw')}</option>
                </select>
                <div className="field-error">{errors.specialites || ''}</div>
              </div>
              <FormInput
                id="avocatDiplome"
                name="diplome"
                label={t('signupSelect.diploma')}
                placeholder={`${t('signupSelect.diploma')} *`}
                value={avocatData.diplome}
                onChange={handleAvocatChange}
                error={errors.diplome}
              />
              <div className="input-group">
                <label className="input-label">{t('signupSelect.uploadVerificationDocument')} *</label>
                <div className={`file-upload-container ${errors.documentsVerif ? 'error' : ''}`}>
                  <input type="file" id="documentsVerif" name="documentsVerif" accept=".pdf,.jpg,.jpeg,.png" onChange={handleAvocatChange} className="file-input-hidden" />
                  <label htmlFor="documentsVerif" className="file-upload-label">
                    {avocatData.documentsVerif ? `✓ ${avocatData.documentsVerif.name}` : t('signupSelect.uploadVerificationDocument')}
                  </label>
                </div>
                <div className="field-error">{errors.documentsVerif || ''}</div>
              </div>
            
            </>
          );
        case 3:
          return (
            <>
              <FormInput
                ref={step3Ref}
                id="avocatPassword"
                name="password"
                label={t('signupSelect.password')}
                type="password"
                placeholder={`${t('signupSelect.password')} *`}
                value={avocatData.password}
                onChange={handleAvocatChange}
                error={errors.password}
                minLength={8}
                required
              />
              <PasswordStrength value={avocatData.password} />
              <FormInput
                id="avocatConfirm"
                name="confirmPassword"
                label={t('signupSelect.confirmPassword')}
                type="password"
                placeholder={t('signupSelect.confirmPassword')}
                value={avocatData.confirmPassword}
                onChange={handleAvocatChange}
                error={errors.confirmPassword}
                minLength={8}
                required
              />
            </>
          );
        default:
          return <div className="notice"><p>{t('signupSelect.accountReview')}</p></div>;
      }
    };

    return (
      <>
        <h1 id="signup-heading" className="auth-title">{t('signupSelect.createAccountavocat')}</h1>
        <p className="auth-subtitle">{avocatStep === 1 ? t('signupSelect.personalInformation') : avocatStep === 2 ? t('signupSelect.professionalDetails') : t('signupSelect.securitySettings')}</p>
        <div className="progress-bar" role="progressbar" aria-valuemin={1} aria-valuemax={totalAvocatSteps} aria-valuenow={avocatStep}><div className="progress-track"><div className="progress-fill" style={{ width: `${((avocatStep-1)/(totalAvocatSteps-1))*100}%` }} /></div><div className="progress-labels"><span className={`progress-label ${avocatStep === 1 ? 'active' : ''}`}>{t('signupSelect.personal')}</span><span className={`progress-label ${avocatStep === 2 ? 'active' : ''}`}>{t('signupSelect.professional')}</span><span className={`progress-label ${avocatStep === 3 ? 'active' : ''}`}>{t('signupSelect.security')}</span></div></div>
  {error && <div className="error-message" role="alert">{t('auth.invalidCredentials', { defaultValue: error })}</div>}
        <div className="form-fields"><div className={`step-panel step-${avocatStep} ${avocatDirection === 'forward' ? 'enter-forward' : ''} ${avocatDirection === 'backward' ? 'enter-backward' : ''}`} key={`step-${avocatStep}`}>{renderStep()}</div></div>
        <div className="form-buttons">
          {avocatStep > 1 && <button type="button" onClick={avocatPrev} className="auth-button secondary mt-4">{t('signupSelect.back')}</button>}
          <button type="submit" className="auth-button primary mt-4" disabled={loading || !isStepValidAvocat} title={!isStepValidAvocat ? t('signupSelect.completeRequiredFields') : undefined}>{loading ? t('signupSelect.processing') : avocatStep === totalAvocatSteps ? t('signupSelect.createAccount') : t('signupSelect.next')}</button>
        </div>
        <div className="terms"><span>{t('signupSelect.termsAndPrivacy')}</span></div>
      </>
    );
  };
  const signupFirstRef = useRef(null);
  const loginEmailRef = useRef(null);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) clearValidationError(name);
    if (error) clearError();
  };

  useEffect(() => {
    // Manage focus when switching between forms
    if (currentForm === 'signup') {
      signupFirstRef.current?.focus();
    } else if (currentForm === 'signin') {
      loginEmailRef.current?.focus();
    }
  }, [currentForm]);

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
  console.log('[SignupSelect] handleSignupChange', name, value, 'render#', renderCountRef.current);
    
    // Special handling for phone number formatting
    if (name === 'phone') {
      let formattedPhone = value;
      
      // Remove any non-digit characters
      formattedPhone = formattedPhone.replace(/\D/g, '');
      
      // Limit to exactly 8 digits (no +216 prefix in input, it's displayed separately)
      if (formattedPhone.length > 8) {
        formattedPhone = formattedPhone.substring(0, 8);
      }
      
      // Only update if value actually changed to avoid unnecessary re-renders that may reset caret
      setSignupData(prev => {
        if (prev[name] === formattedPhone) return prev;
        console.log('[SignupSelect] setSignupData phone normalized =>', formattedPhone);
        return { ...prev, [name]: formattedPhone };
      });
    } else {
      setSignupData(prev => {
        if (prev[name] === value) return prev;
        return { ...prev, [name]: value };
      });
    }
    
    if (errors[name]) clearValidationError(name);
    if (error) clearError();
  };

  const validateLogin = () => {
    let isValid = true;
    if (!validateField('email', loginData.email, { required: true, type: 'email' })) isValid = false;
    if (!validateField('password', loginData.password, { required: true, type: 'password' })) isValid = false;
    return isValid;
  };

  const validateSignup = () => {
    let isValid = true;
    if (!validateField('firstName', signupData.firstName, { required: true, type: 'text' })) isValid = false;
    if (!validateField('lastName', signupData.lastName, { required: true, type: 'text' })) isValid = false;
    if (!validateField('email', signupData.email, { required: true, type: 'email' })) isValid = false;
    if (!validateField('password', signupData.password, { required: true, type: 'password' })) isValid = false;
    if (!validatePasswordMatch(signupData.password, signupData.confirmPassword)) isValid = false;
    // Construct full phone number with +216 prefix for validation
    const fullPhoneNumber = `+216${signupData.phone}`;
    if (!validateField('phone', fullPhoneNumber, { required: true, type: 'phone' })) isValid = false;
    return isValid;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    
    // Clear all errors before attempting login
    clearError(); // Clear auth context error
    
    try {
      // Remove userType to let backend auto-detect user type
      const response = await login(loginData);
      
      // Navigate based on user type and role returned from backend
      if (response.user.userType === 'Client') {
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/client/dashboard');
        }
      } else if (response.user.userType === 'Avocat') {
        navigate('/avocat/dashboard');
      }
    } catch (err) {
      console.error('Login error caught in SignupSelect:', err);
      console.log('Auth context error after login failure:', error);
      // The error is already handled by AuthContext and will be displayed via the error state
      // Don't set loginError here as it will conflict with the auth context error
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    try {
      await signupClient({
        fullName: `${signupData.firstName} ${signupData.lastName}`,
        email: signupData.email,
        password: signupData.password,
        phone: `+216${signupData.phone}`,
      });
      navigate('/client/dashboard');
    } catch (err) {
      // error handled by context
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="container-auth split">
          <aside className="nav-column" role="navigation" aria-label="Sign up navigation">
            <Logo className="nav-logo" variant="green" />
            <div className="nav-buttons">
              <button
                type="button"
                className={`nav-button ${currentForm === 'signin' ? 'active' : ''}`}
                onClick={() => setCurrentForm('signin')}
              >
                {t('signupSelect.signIn')}
              </button>
              <button
                type="button"
                className={`nav-button ${currentForm === 'signup' ? 'active' : ''}`}
                onClick={() => setCurrentForm('signup')}
              >
                {t('signupSelect.joinAsClient')}
              </button>
              <button
                type="button"
                className={`nav-button ${currentForm === 'lawyer' ? 'active' : ''}`}
                onClick={() => setCurrentForm('lawyer')}
              >
                {t('signupSelect.joinAsLawyer')}
              </button>
              <button
                type="button"
                className="nav-button"
                onClick={() => navigate('/')}
              >
                {t('signupSelect.back')}
              </button>
            </div>
            <p className="nav-footer">{t('signupSelect.needHelp')}</p>
          </aside>

          <main className="form-column">
            {currentForm === 'signin' && (
              <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <h1 id="signin-heading" className="auth-title">{t('signupSelect.signInToAccount')}</h1>

                </div>

                {/* Animated error banner: toggles .visible when visibleError is present */}
                <div className={`error-message ${visibleError ? 'visible' : ''}`} role="alert" aria-live="assertive">
                  {visibleError ? t(visibleError, { defaultValue: visibleError }) : ''}
                </div>

                <FormInput
                  ref={loginEmailRef}
                  id="loginEmail"
                  name="email"
                  label={t('signupSelect.emailAddress')}
                  type="email"
                  placeholder={`${t('signupSelect.emailAddress')} *`}
                  value={loginData.email}
                  onChange={handleLoginChange}
                  error={errors.email}
                  autoComplete="email"
                  required
                />

                <FormInput
                  id="loginPassword"
                  name="password"
                  label={t('signupSelect.password')}
                  type="password"
                  placeholder={`${t('signupSelect.password')} *`}
                  value={loginData.password}
                  onChange={handleLoginChange}
                  error={errors.password}
                  autoComplete="current-password"
                  required
                />

                <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                  <button type="submit" className="btn btn-primary auth-button login-btn" disabled={loading} aria-busy={loading}>
                    {loading ? t('signupSelect.signingIn') : t('signupSelect.signIn')}
                  </button>
                </div>

                <div className="terms">
                  <span>{t('signupSelect.termsAndPrivacy')}</span>
                </div>
              </form>
            )}

            {currentForm === 'signup' && (
              <form className="auth-form" onSubmit={handleSignupSubmit} noValidate>
                <h1 id="signup-heading" className="auth-title">{t('signupSelect.createAccount')}</h1>
                <div className={`error-message ${visibleError && currentForm === 'signup' ? 'visible' : ''}`} role="alert" aria-live="assertive">
                  {visibleError && currentForm === 'signup' ? t(visibleError, { defaultValue: visibleError }) : ''}
                </div>

                <p className="required-note">{t('signupSelect.requiredFields')}</p>

                <div className="name-fields">
                  <FormInput
                    ref={signupFirstRef}
                    id="firstName"
                    name="firstName"
                    label={t('signupSelect.firstName')}
                    placeholder={`${t('signupSelect.firstName')} *`}
                    value={signupData.firstName}
                    onChange={handleSignupChange}
                    error={errors.firstName}
                    autoComplete="given-name"
                    required
                  />
                  <FormInput
                    id="lastName"
                    name="lastName"
                    label={t('signupSelect.lastName')}
                    placeholder={`${t('signupSelect.lastName')} *`}
                    value={signupData.lastName}
                    onChange={handleSignupChange}
                    error={errors.lastName}
                    autoComplete="family-name"
                    required
                  />
                </div>

                <FormInput
                  id="signupEmail"
                  name="email"
                  label={t('signupSelect.emailAddress')}
                  type="email"
                  placeholder={`${t('signupSelect.emailAddress')} *`}
                  value={signupData.email}
                  onChange={handleSignupChange}
                  error={errors.email}
                  autoComplete="email"
                  required
                />

                <FormInput
                  id="signupPhone"
                  name="phone"
                  label={t('signupSelect.phoneNumber')}
                  type="tel"
                  placeholder="+216 12345678"
                  value={signupData.phone}
                  onChange={handleSignupChange}
                  error={errors.phone}
                  autoComplete="tel"
                  maxLength={12}
                  title={t('signupSelect.phoneTitle')}
                  required
                />

                <FormInput
                  id="signupPassword"
                  name="password"
                  label={t('signupSelect.password')}
                  type="password"
                  placeholder={`${t('signupSelect.password')} *`}
                  value={signupData.password}
                  onChange={handleSignupChange}
                  error={errors.password}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <PasswordStrength value={signupData.password} />

                <FormInput
                  id="signupConfirm"
                  name="confirmPassword"
                  label={t('signupSelect.confirmPassword')}
                  type="password"
                  placeholder={`${t('signupSelect.confirmPassword')} *`}
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />

                <button type="submit" className="btn btn-primary auth-button" disabled={loading}>
                  {loading ? t('signupSelect.creating') : t('signupSelect.createAccount')}
                </button>
              </form>
            )}

            {currentForm === 'lawyer' && (
              <div className="auth-form lawyer-embedded">
                {/* Error banner for lawyer signup */}
                <div className={`error-message ${visibleError && currentForm === 'lawyer' ? 'visible' : ''}`} role="alert" aria-live="assertive">
                  {visibleError && currentForm === 'lawyer' ? t(visibleError, { defaultValue: visibleError }) : ''}
                </div>
                
                {/* Inlined Avocat multi-step form (migrated from SignupAvocat.js) */}
                <div className="signup-avocat-page">
                  <div className="auth-content">
                    <div className="auth-form-wrapper full-width">
                      <form className="auth-form" onSubmit={handleAvocatSubmit} noValidate>
                        {AvocatFormInner()}
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SignupSelect;
