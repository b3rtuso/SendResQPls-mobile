import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Send,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import { forgotPassword, resetPasswordWithCode } from '../../api/client';
import { validatePassword, checkPasswordCriteria } from '../../utils/passwordValidator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MobileForgotPassword() {
  const navigate = useNavigate();

  // Step state: 'email' -> 'code_and_password' -> 'done'
  const [step, setStep] = useState<'email' | 'code_and_password' | 'done'>('email');

  // Fields
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  // Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto redirect to login on success
  useEffect(() => {
    if (step === 'done') {
      const redirectTimer = setTimeout(() => {
        navigate('/mobile/login');
      }, 2500);
      return () => clearTimeout(redirectTimer);
    }
  }, [step, navigate]);

  const criteria = checkPasswordCriteria(newPassword);

  const friendlyError = (err: any): string => {
    const raw = err.response?.data?.error || err.message || '';
    const status = err.response?.status;
    const errCode = err.code;

    if (status === 404 || raw.toLowerCase().includes('not registered')) {
      return 'This email is not registered in our system. Please check your spelling or register.';
    }
    if (errCode === 'ECONNABORTED' || raw.toLowerCase().includes('timeout')) {
      return 'Taking longer than expected. Please check your connection and try again.';
    }
    if (!err.response && (errCode === 'ERR_NETWORK' || raw.toLowerCase().includes('network'))) {
      return 'No internet connection. Please check your Wi-Fi or mobile data.';
    }
    if (status === 429) {
      return 'Too many attempts. Please wait a minute before trying again.';
    }
    return raw || 'An error occurred. Please try again.';
  };

  // ── Step 1: Request 6-Digit Code ──────────────────────────────────────────
  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setInfoMsg('');
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(cleanEmail);
      setStep('code_and_password');
      setResendCooldown(60);
      setInfoMsg(`A 6-digit verification code has been sent to ${cleanEmail}.`);
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Resend Code ───────────────────────────────────────────────────────────
  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setInfoMsg('');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setResendCooldown(60);
      setInfoMsg('A fresh 6-digit code was sent to your email.');
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Reset Password with 6-Digit Code ──────────────────────────────
  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const cleanCode = code.trim().replace(/\D/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    const valResult = validatePassword(newPassword);
    if (!valResult.valid) {
      setError(valResult.error || 'Password does not meet complexity requirements.');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithCode(email.trim(), cleanCode, newPassword);
      setStep('done');
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const wrapStyle = (field: string, hasError?: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    minHeight: 'clamp(44px, 6vh, 50px)',
    height: 'clamp(44px, 6vh, 50px)',
    background: hasError ? '#FFF8F8' : focusField === field ? '#FFFFFF' : '#F8FAFC',
    border: `1.5px solid ${hasError ? '#EF4444' : focusField === field ? '#2563EB' : '#E2E8F0'}`,
    borderRadius: 14,
    transition: 'all 0.18s',
    boxShadow: hasError
      ? '0 0 0 3px rgba(239,68,68,0.09)'
      : focusField === field ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
  });

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F1F5F9] mobile-auth-transition">
      <style>{`
        .mf-header {
          background:
            radial-gradient(circle 100px at calc(100% - 40px) 20px, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) 99%, transparent 100%),
            linear-gradient(160deg, #0F1F38 0%, #1D4ED8 60%, #2563EB 100%);
          position: relative;
          box-shadow: 0 6px 24px rgba(15, 31, 56, 0.35);
          border-radius: 0 0 24px 24px;
          color: white;
        }
        @media (min-width: 640px) {
          .mf-header {
            border-radius: 0 0 32px 32px;
          }
        }
        .mf-auth-btn {
          width: 100%;
          padding: clamp(12px, 3.5vw, 16px);
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          color: white;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          font-size: clamp(14px, 3.8vw, 15px);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
        }
        .mf-auth-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1D4ED8, #1E40AF);
          box-shadow: 0 6px 18px rgba(37,99,235,0.4);
        }
        .mf-auth-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .mf-spin {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: mfSpin 0.7s linear infinite;
        }
        @keyframes mfSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── 1. Top Bar & Branding ── */}
      <header className="mf-header w-full px-5 pt-8 pb-7">
        <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 'code_and_password') {
                setStep('email');
                setError('');
                setInfoMsg('');
              } else {
                navigate('/mobile/login');
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12,
              padding: '8px 12px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            <span>{step === 'code_and_password' ? 'Change Email' : 'Back to Login'}</span>
          </button>

          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            MDRRMO Balayan
          </span>
        </div>

        <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto mt-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <img
              src="/logo.svg"
              alt="SRQ Logo"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              }}
            />
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                SendResQPls Account Security
              </div>
              <h1 style={{ color: 'white', fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: '-0.3px' }}>
                {step === 'done'
                  ? 'Password Reset Complete'
                  : step === 'code_and_password'
                  ? 'Set New Password'
                  : 'Forgot Password?'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Card Body ── */}
      <main className="w-full flex-1 flex flex-col items-center px-4 sm:px-8 py-6">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8 relative z-10">
          
          {/* Global Error Banner */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              background: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              borderRadius: 12,
              padding: '12px 14px',
              marginBottom: 16,
            }}>
              <AlertTriangle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: '#B91C1C', fontWeight: 600, lineHeight: 1.45 }}>
                {error}
              </span>
            </div>
          )}

          {/* Info Banner */}
          {infoMsg && !error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              background: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: 12,
              padding: '12px 14px',
              marginBottom: 16,
            }}>
              <CheckCircle2 size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: '#1E40AF', fontWeight: 600, lineHeight: 1.45 }}>
                {infoMsg}
              </span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 1: ENTER EMAIL TO RECEIVE 6-DIGIT CODE
             ══════════════════════════════════════════════════════════════════ */}
          {step === 'email' && (
            <form onSubmit={handleRequestCode} noValidate>
              <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 20px', lineHeight: 1.55 }}>
                Enter your registered email address. We will send you a <strong>6-digit reset code</strong> to choose a new password.
              </p>

              <div style={{ marginBottom: 20 }}>
                <Label htmlFor="forgot-email" style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: error ? '#DC2626' : '#374151',
                  marginBottom: 6,
                }}>
                  Registered Email Address
                </Label>
                <div style={wrapStyle('email', !!error)}>
                  <span style={{
                    position: 'absolute',
                    left: 14,
                    color: error ? '#EF4444' : focusField === 'email' ? '#2563EB' : '#94A3B8',
                    display: 'flex',
                  }}>
                    <Mail size={18} />
                  </span>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="juan@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField(null)}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: 14.5,
                      fontFamily: 'inherit',
                      color: '#0F172A',
                      padding: '0 16px 0 46px',
                    }}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="mf-auth-btn"
                disabled={loading}
                style={{ minHeight: 48 }}
              >
                {loading ? (
                  <>
                    <span className="mf-spin" />
                    <span>Sending 6-Digit Code…</span>
                  </>
                ) : (
                  <>
                    <Send size={16} /> Send Reset Code
                  </>
                )}
              </Button>

              <p style={{
                textAlign: 'center',
                marginTop: 22,
                marginBottom: 0,
                fontSize: 13.5,
                color: '#64748B',
              }}>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/mobile/login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13.5,
                  }}
                >
                  Log In
                </button>
              </p>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 2: ENTER 6-DIGIT CODE & SET NEW PASSWORD
             ══════════════════════════════════════════════════════════════════ */}
          {step === 'code_and_password' && (
            <form onSubmit={handleResetPassword} noValidate>
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '10px 14px',
                marginBottom: 18,
                fontSize: 12.5,
                color: '#475569',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  Sent to: <strong style={{ color: '#0F172A' }}>{email}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Edit
                </button>
              </div>

              {/* 6-Digit Code Input */}
              <div style={{ marginBottom: 16 }}>
                <Label htmlFor="reset-code" style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: 6,
                }}>
                  6-Digit Reset Code
                </Label>
                <div style={wrapStyle('code', !!error)}>
                  <span style={{
                    position: 'absolute',
                    left: 14,
                    color: focusField === 'code' ? '#2563EB' : '#94A3B8',
                    display: 'flex',
                  }}>
                    <KeyRound size={18} />
                  </span>
                  <Input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCode(digits);
                      if (error) setError('');
                    }}
                    onFocus={() => setFocusField('code')}
                    onBlur={() => setFocusField(null)}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: 18,
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      letterSpacing: '0.25em',
                      color: '#0F172A',
                      padding: '0 16px 0 46px',
                    }}
                  />
                </div>
              </div>

              {/* New Password */}
              <div style={{ marginBottom: 14 }}>
                <Label htmlFor="new-password" style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: 6,
                }}>
                  New Password
                </Label>
                <div style={wrapStyle('new-password', !!error)}>
                  <span style={{
                    position: 'absolute',
                    left: 14,
                    color: focusField === 'new-password' ? '#2563EB' : '#94A3B8',
                    display: 'flex',
                  }}>
                    <Lock size={18} />
                  </span>
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    onFocus={() => setFocusField('new-password')}
                    onBlur={() => setFocusField(null)}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: 14,
                      color: '#0F172A',
                      padding: '0 52px 0 46px',
                      fontFamily: showNewPassword || !newPassword ? 'inherit' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: showNewPassword || !newPassword ? 'normal' : '0.12em',
                    }}
                  />
                  {/* 44×44 tap target matching login & signup */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: 4,
                      width: 44,
                      height: 44,
                      color: '#94A3B8',
                    }}
                  >
                    {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </Button>
                </div>
              </div>

              {/* Password criteria checklist */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '8px 12px',
                marginBottom: 14,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px 10px',
                fontSize: 11.5,
              }}>
                <div style={{ color: criteria.length ? '#16A34A' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {criteria.length ? <Check size={12} strokeWidth={3} /> : <X size={12} />} 8+ characters
                </div>
                <div style={{ color: criteria.hasNumber ? '#16A34A' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {criteria.hasNumber ? <Check size={12} strokeWidth={3} /> : <X size={12} />} At least 1 number
                </div>
                <div style={{ color: criteria.hasUpper ? '#16A34A' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {criteria.hasUpper ? <Check size={12} strokeWidth={3} /> : <X size={12} />} Uppercase (A-Z)
                </div>
                <div style={{ color: criteria.hasLower ? '#16A34A' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {criteria.hasLower ? <Check size={12} strokeWidth={3} /> : <X size={12} />} Lowercase (a-z)
                </div>
              </div>

              {/* Confirm New Password */}
              <div style={{ marginBottom: 20 }}>
                <Label htmlFor="confirm-password" style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: 6,
                }}>
                  Confirm New Password
                </Label>
                <div style={wrapStyle('confirm-password', !!error)}>
                  <span style={{
                    position: 'absolute',
                    left: 14,
                    color: focusField === 'confirm-password' ? '#2563EB' : '#94A3B8',
                    display: 'flex',
                  }}>
                    <Lock size={18} />
                  </span>
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    onFocus={() => setFocusField('confirm-password')}
                    onBlur={() => setFocusField(null)}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: 14,
                      color: '#0F172A',
                      padding: '0 52px 0 46px',
                      fontFamily: showConfirmPassword || !confirmPassword ? 'inherit' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      letterSpacing: showConfirmPassword || !confirmPassword ? 'normal' : '0.12em',
                    }}
                  />
                  {/* 44×44 tap target matching login & signup */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: 4,
                      width: 44,
                      height: 44,
                      color: '#94A3B8',
                    }}
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </Button>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="mf-auth-btn"
                disabled={loading}
                style={{ minHeight: 48, marginBottom: 12 }}
              >
                {loading ? (
                  <>
                    <span className="mf-spin" />
                    <span>Updating Password…</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={16} /> Reset Password
                  </>
                )}
              </Button>

              {/* Resend button */}
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? '#94A3B8' : '#2563EB',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  <span>
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : 'Resend 6-Digit Code'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 3: SUCCESS STATE
             ══════════════════════════════════════════════════════════════════ */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 18px rgba(22, 163, 74, 0.25)',
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
                Password Reset Successfully!
              </h2>
              <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.6, margin: '0 0 20px' }}>
                Your account password has been updated. Redirecting you to login…
              </p>
              <Button
                type="button"
                className="mf-auth-btn"
                onClick={() => navigate('/mobile/login')}
                style={{ minHeight: 48 }}
              >
                Log In Now
              </Button>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-5 text-xs text-slate-400">
        MDRRMO Balayan, Batangas · SendResQPls Emergency Response
      </footer>
    </div>
  );
}
