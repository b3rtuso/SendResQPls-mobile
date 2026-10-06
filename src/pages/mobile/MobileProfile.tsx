import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, ChevronRight,
  ChevronLeft, Save, Info, MessageCircle, Eye, EyeOff, CheckCircle2, FileText, ShieldCheck,
} from 'lucide-react';
import { FaUser, FaEnvelope, FaLock, FaBell, FaCog } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import { BsQuestionCircleFill } from 'react-icons/bs';
import { MdVerified, MdManageAccounts } from 'react-icons/md';
import { updateProfile, changePassword } from '../../api/client';
import { useMobileToast } from '../../components/MobileToastProvider';
import { useConfirm } from '../../contexts/ConfirmContext';
import { detectFieldChanges } from '../../utils/changeDetector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { validatePhilippineMobile } from '../../utils/phoneValidator';
import { validatePassword, checkPasswordCriteria } from '../../utils/passwordValidator';
import LegalModal, { type LegalDocType } from '../../components/LegalModal';
import {
  getNotifSettings,
  saveNotifSettings,
  playNotificationSound,
  type NotificationSettings,
} from '../../utils/notificationSettings';

type Section = 'main' | 'account' | 'notifications' | 'help';

/* ── shared sub-components ─────────────────────────────── */

function Field({
  label, icon: Icon, value, onChange, placeholder, type = 'text', maxLength, inputMode,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#F8FAFC', border: '1.5px solid #E2E8F0',
        borderRadius: 12, padding: '13px 14px',
      }}>
        <Icon size={17} color="#94A3B8" style={{ flexShrink: 0 }} />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          inputMode={inputMode}
          style={{
            flex: 1, border: 'none', background: 'none', outline: 'none',
            fontSize: 15, fontFamily: 'var(--font)', color: '#0F172A', minWidth: 0,
          }}
        />
      </div>
    </div>
  );
}

function SectionHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '18px 16px 14px',
      borderBottom: '1px solid #F1F5F9',
      position: 'sticky', top: 0, background: 'white', zIndex: 10,
    }}>
      <button onClick={onBack} style={{
        background: '#F1F5F9', border: 'none', cursor: 'pointer',
        width: 36, height: 36, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#475569', flexShrink: 0,
      }}>
        <ChevronLeft size={20} />
      </button>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>{title}</h2>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      width: 48, height: 28, borderRadius: 14, padding: 3,
      background: on ? '#2563EB' : '#CBD5E1', border: 'none', cursor: 'pointer',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3, left: on ? 23 : 3,
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

/* ── main component ─────────────────────────────────────── */

export default function MobileProfile() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>('main');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const openSection = (s: Section) => {
    setDirection('forward');
    setSection(s);
  };

  const backToMain = () => {
    setNewPassClicked(false);
    setDirection('backward');
    setSection('main');
  };

  const { push: showToast, clearAll: clearToasts } = useMobileToast();
  const { confirm } = useConfirm();
  const [saving, setSaving] = useState(false);

  const userId = localStorage.getItem('userId') || '';
  const [name, setName] = useState(localStorage.getItem('userName') || 'User');
  const [email, setEmail] = useState(localStorage.getItem('userEmail') || '');
  const [phone, setPhone] = useState(localStorage.getItem('userPhone') || '');
  const [originalProfile, setOriginalProfile] = useState(() => ({
    name: localStorage.getItem('userName') || 'User',
    email: localStorage.getItem('userEmail') || '',
    phone: localStorage.getItem('userPhone') || '',
  }));
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [newPassClicked, setNewPassClicked] = useState(false);
  const newPassCriteria = checkPasswordCriteria(newPass);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [legalModalDoc, setLegalModalDoc] = useState<LegalDocType | null>(null);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(() => getNotifSettings());

  const getProfileChanges = () => detectFieldChanges(
    originalProfile,
    { name, email, phone },
    {
      labels: {
        name: 'Full Name',
        email: 'Email Address',
        phone: 'Phone Number',
      },
    }
  );

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!showLogoutModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showLogoutModal]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const executeLogout = () => {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    // Purge all floating toast cards immediately upon logout
    try {
      clearToasts?.();
      window.dispatchEvent(new CustomEvent('srq-logout'));
    } catch {
      // Ignore cleanup error
    }

    const onboardingDone = localStorage.getItem('srq_onboarding_done');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('srq_notifications');
    localStorage.removeItem('srq_deleted_activity_ids');
    localStorage.removeItem('srq_notifications_cleared_at');
    localStorage.removeItem('srq_read_activity_ids');
    localStorage.removeItem('srq_last_statuses');
    if (onboardingDone) localStorage.setItem('srq_onboarding_done', onboardingDone);
    setShowLogoutModal(false);

    if (isOffline) {
      sessionStorage.setItem('srq_offline_logout_notice', 'true');
    }

    navigate('/mobile/login', { replace: true });
  };

  const handleSaveProfile = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      showToast({ type: 'error', priority: 'normal', title: 'Name Required', message: 'Full name cannot be empty.' });
      return;
    }

    const phoneCheck = validatePhilippineMobile(cleanPhone);
    if (!phoneCheck.valid) {
      showToast({ type: 'error', priority: 'normal', title: 'Invalid Mobile Number', message: phoneCheck.error || 'Invalid mobile number.' });
      return;
    }

    const changes = getProfileChanges();

    // 1. Detect which fields were actually changed
    if (changes.length === 0) {
      showToast({
        type: 'info',
        priority: 'normal',
        title: 'No Changes Detected',
        message: 'Your profile details are already up to date.',
      });
      return;
    }

    // 2. Show ONLY the changed fields in the confirmation modal
    const isConfirmed = await confirm({
      type: 'update',
      title: 'Confirm Changes',
      message: changes.length === 1
        ? 'Are you sure you want to save this change to your profile?'
        : 'Are you sure you want to save these changes to your profile?',
      detail: 'Your updated contact information will be reflected on future incident dispatches and official records.',
      confirmText: 'Confirm Changes',
      cancelText: 'Cancel',
      changes,
    });
    if (!isConfirmed) return;

    setSaving(true);
    try {
      await updateProfile({ userId, name: cleanName, email: cleanEmail, phoneNumber: phoneCheck.cleaned });
      const updated = {
        name: cleanName,
        email: cleanEmail,
        phone: phoneCheck.cleaned!,
      };

      // 6. After a successful save, the new values become the new saved/original values
      setOriginalProfile(updated);
      setName(updated.name);
      setEmail(updated.email);
      setPhone(updated.phone);

      localStorage.setItem('userName', updated.name);
      localStorage.setItem('userEmail', updated.email);
      localStorage.setItem('userPhone', updated.phone);
      showToast({
        type: 'success',
        priority: 'important',
        title: 'Account Data Changed',
        message: 'Your name, email, and phone number have been updated.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        priority: 'normal',
        title: 'Update failed',
        message: err.response?.data?.error || 'Could not save profile changes.',
      });
    } finally { setSaving(false); }
  };

  const handleBackFromAccount = async () => {
    const changes = getProfileChanges();
    const hasPasswordInput = !!(currentPass || newPass);

    // If no changes, close/navigate back immediately without discard confirmation
    if (changes.length === 0 && !hasPasswordInput) {
      backToMain();
      return;
    }

    // If unsaved changes exist, show discard confirmation
    const shouldDiscard = await confirm({
      type: 'discard',
      title: 'Discard Changes?',
      message: 'You have unsaved changes. Are you sure you want to leave? Your changes will be discarded.',
      confirmText: 'Discard Changes',
      cancelText: 'Keep Editing',
    });

    if (shouldDiscard) {
      // Revert all unsaved inputs back to saved/original values
      setName(originalProfile.name);
      setEmail(originalProfile.email);
      setPhone(originalProfile.phone);
      setCurrentPass('');
      setNewPass('');
      backToMain();
    }
  };

  const handleDiscardProfileEdits = async () => {
    const changes = getProfileChanges();
    if (changes.length === 0) return;

    const shouldDiscard = await confirm({
      type: 'discard',
      title: 'Discard Changes?',
      message: 'You have unsaved profile changes. Are you sure you want to discard your edits?',
      confirmText: 'Discard Changes',
      cancelText: 'Keep Editing',
    });

    if (shouldDiscard) {
      setName(originalProfile.name);
      setEmail(originalProfile.email);
      setPhone(originalProfile.phone);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass) { showToast({ type: 'error', priority: 'normal', title: 'Fill in both fields' }); return; }
    const passCheck = validatePassword(newPass);
    if (!passCheck.valid) {
      showToast({ type: 'error', priority: 'normal', title: 'Invalid Password', message: passCheck.error });
      return;
    }

    const isConfirmed = await confirm({
      type: 'update',
      title: 'Confirm Password Change',
      message: 'Are you sure you want to change your account password?',
      detail: 'You will need to use your new credentials the next time you sign into the SendResQ mobile app.',
      confirmText: 'Update Password',
      cancelText: 'Cancel',
    });
    if (!isConfirmed) return;

    setSaving(true);
    try {
      await changePassword({ currentPassword: currentPass, newPassword: newPass });
      showToast({
        type: 'success',
        priority: 'important',
        title: 'Password Changed',
        message: 'Your account password has been updated successfully.',
      });
      setCurrentPass(''); setNewPass(''); setNewPassClicked(false);
    } catch (err: any) {
      showToast({ type: 'error', priority: 'normal', title: err.response?.data?.error || 'Failed to change password' });
    } finally { setSaving(false); }
  };

  /* ── MAIN VIEW ─────────────────────────────────────────── */
  if (section === 'main') return (
    <div className={`mobile-shell ${direction === 'backward' ? 'mobile-subpage-backward' : ''}`} key="profile-main" style={{ background: '#FFFFFF' }}>
      <div style={{ flex: 1, paddingBottom: 80 }}>

        {/* Hero Header — uses percentage width, no 100vw hack */}
        <div style={{
          background: 'linear-gradient(160deg, #0F1F38 0%, #1D4ED8 60%, #2563EB 100%)',
          padding: 'clamp(32px, 8vw, 48px) clamp(16px, 5vw, 28px) 28px',
          textAlign: 'center', color: 'white', width: '100%', boxSizing: 'border-box',
        }}>
          {/* Avatar */}
          <Avatar style={{
            width: 'clamp(72px, 20vw, 96px)', height: 'clamp(72px, 20vw, 96px)',
            margin: '0 auto 12px',
            background: 'rgba(255,255,255,0.18)', border: '3px solid rgba(255,255,255,0.35)',
            fontSize: 'clamp(24px, 7vw, 34px)', fontWeight: 800,
          }}>
            <AvatarFallback style={{ background: 'transparent', color: 'white' }}>
              {initials}
            </AvatarFallback>
          </Avatar>

          <h2 style={{ fontSize: 'clamp(20px, 5.5vw, 26px)', fontWeight: 800, margin: '0 0 4px', lineHeight: 1.2 }}>{name}</h2>
          <p style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', opacity: 0.75, margin: '0 0 2px', wordBreak: 'break-all' }}>{email || 'No email address'}</p>
          <p style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', opacity: 0.75, margin: '0 0 14px' }}>{phone || 'No phone number'}</p>

          <Badge style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.15)', padding: '6px 16px',
            borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.5px',
            border: 'none', color: 'white',
          }}>
            <MdVerified size={15} style={{ color: '#60A5FA' }} /> VERIFIED CITIZEN
          </Badge>
        </div>

        {/* Menu */}
        <div style={{ padding: '12px clamp(14px, 4vw, 20px)' }}>
          {[
            { icon: MdManageAccounts, label: 'Account Details', key: 'account' as Section, desc: 'Name, email, and password' },
            {
              icon: () => (
                <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}>
                  <FaBell size={18} />
                  <FaCog size={10} style={{ position: 'absolute', top: -3, right: -4, background: '#EFF6FF', borderRadius: '50%', color: '#2563EB' }} />
                </span>
              ),
              label: 'Notification Settings', key: 'notifications' as Section, desc: 'Alerts and sound preferences',
            },
            { icon: BsQuestionCircleFill, label: 'Help & Support', key: 'help' as Section, desc: 'FAQs and contact details' },
          ].map(item => (
            <div
              key={item.label}
              onClick={() => openSection(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 'clamp(12px, 3.5vw, 16px) 4px',
                borderBottom: '1px solid #E2E8F0', cursor: 'pointer',
              }}
            >
              <div style={{
                width: 'clamp(38px, 10vw, 44px)', height: 'clamp(38px, 10vw, 44px)',
                borderRadius: 12, background: '#EFF6FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#2563EB', flexShrink: 0,
              }}>
                <item.icon size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'clamp(13px, 3.8vw, 15px)', fontWeight: 700, color: '#0F172A' }}>{item.label}</div>
                <div style={{ fontSize: 'clamp(11px, 3vw, 12px)', color: '#94A3B8', marginTop: 2 }}>{item.desc}</div>
              </div>
              <ChevronRight size={18} color="#CBD5E1" style={{ flexShrink: 0 }} />
            </div>
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding: '16px clamp(14px, 4vw, 20px) 8px' }}>
          <Button variant="destructive" onClick={handleLogout} style={{
            width: '100%', padding: 'clamp(12px, 3.5vw, 15px)',
            borderRadius: 14, background: '#FEF2F2', color: '#DC2626',
            border: '1.5px solid #FECACA', fontSize: 'clamp(13px, 3.8vw, 15px)',
            fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            minHeight: 48,
          }}>
            <LogOut size={17} /> Log Out
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Modal matching Photo 3 */}
      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'modalOverlayFade 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 340,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 24,
              padding: '28px 22px 22px',
              textAlign: 'center',
              boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25), 0 10px 20px -5px rgba(15, 23, 42, 0.1)',
              animation: 'modalCenterPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <h2 style={{
              color: '#0F1F38',
              fontSize: 20,
              fontWeight: 800,
              lineHeight: 1.3,
              margin: '0 0 20px',
              letterSpacing: '-0.3px',
            }}>
              Are you sure you<br />want to log out?
            </h2>

            {/* Profile identity box — Header blue colors */}
            <div style={{
              background: '#F0F7FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: 16,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
              marginBottom: 22,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(160deg, #0F1F38 0%, #1D4ED8 60%, #2563EB 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(29, 78, 216, 0.25)',
              }}>
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  color: '#0F1F38',
                  fontWeight: 800,
                  fontSize: 15.5,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                }}>
                  {name || 'User'}
                </div>
                <div style={{
                  color: '#1D4ED8',
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: 3,
                }}>
                  {email || phone || 'user@sendresq.app'}
                </div>
              </div>
            </div>

            {/* Actions: Red Log out & White Cancel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={executeLogout}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 9999,
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                  transition: 'opacity 0.15s ease',
                }}
              >
                Log out
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 9999,
                  background: '#FFFFFF',
                  color: '#334155',
                  fontSize: 15,
                  fontWeight: 700,
                  border: '1.5px solid #E2E8F0',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  transition: 'background 0.15s ease',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ── ACCOUNT DETAILS ───────────────────────────────────── */
  if (section === 'account') return (
    <div className="mobile-shell mobile-subpage-forward" key="profile-account" style={{ background: '#FFFFFF' }}>
      <div style={{ flex: 1, paddingBottom: 80 }}>

        <SectionHeader title="Account Details" onBack={handleBackFromAccount} />

        <div style={{ padding: 'clamp(14px, 4vw, 20px)' }}>
          <Field label="Full Name" icon={FaUser} value={name} onChange={setName} placeholder="Juan Dela Cruz" />
          <Field label="Email Address" icon={FaEnvelope} value={email} onChange={setEmail} placeholder="juan@example.com" type="email" />
          <Field label="Phone Number *" icon={FiPhone} value={phone} onChange={v => setPhone(v.replace(/\D/g, '').slice(0, 11))} placeholder="09123456789 (11 digits)" type="tel" maxLength={11} inputMode="numeric" />

          <button onClick={handleSaveProfile} disabled={saving} style={{
            width: '100%', padding: 'clamp(12px, 3.5vw, 15px)',
            borderRadius: 14, background: '#2563EB', color: 'white',
            border: 'none', fontSize: 'clamp(13px, 3.8vw, 15px)', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: saving ? 0.6 : 1, marginBottom: getProfileChanges().length > 0 ? 8 : 20,
          }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {getProfileChanges().length > 0 && (
            <button
              type="button"
              onClick={handleDiscardProfileEdits}
              style={{
                width: '100%', padding: 'clamp(11px, 3.2vw, 14px)',
                borderRadius: 14, background: '#F8FAFC', color: '#64748B',
                border: '1.5px solid #CBD5E1', fontSize: 'clamp(13px, 3.8vw, 15px)', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 20,
              }}
            >
              Discard Changes
            </button>
          )}

          {/* Change Password card */}
          <div style={{
            background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', padding: 'clamp(14px, 4vw, 18px)',
          }}>
            <h3 style={{ fontSize: 'clamp(13px, 3.8vw, 15px)', fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>Change Password</h3>

            {/* Current password */}
            <label style={{
              display: 'block', fontSize: 11.5, fontWeight: 700,
              color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>Current Password</label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'white', border: '1.5px solid #E2E8F0',
              borderRadius: 12, padding: '12px 14px', marginBottom: 12,
            }}>
              <FaLock size={15} color="#94A3B8" style={{ flexShrink: 0 }} />
              <input
                type={showCurrentPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 14, minWidth: 0, lineHeight: 'normal', verticalAlign: 'middle', fontFamily: showCurrentPass ? 'var(--font)' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: showCurrentPass ? 'normal' : '0.12em' }}
              />
              <button onClick={() => setShowCurrentPass(!showCurrentPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, flexShrink: 0 }}>
                {showCurrentPass ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            {/* New password */}
            <label style={{
              display: 'block', fontSize: 11.5, fontWeight: 700,
              color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>New Password</label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'white', border: '1.5px solid #E2E8F0',
              borderRadius: 12, padding: '12px 14px', marginBottom: (newPassClicked || newPass.length > 0) ? 10 : 14,
            }}>
              <FaLock size={15} color="#94A3B8" style={{ flexShrink: 0 }} />
              <input
                type={showNewPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPass}
                onFocus={() => setNewPassClicked(true)}
                onClick={() => setNewPassClicked(true)}
                onChange={e => setNewPass(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 14, minWidth: 0, lineHeight: 'normal', verticalAlign: 'middle', fontFamily: showNewPass ? 'var(--font)' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: showNewPass ? 'normal' : '0.12em' }}
              />
              <button onClick={() => setShowNewPass(!showNewPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, flexShrink: 0 }}>
                {showNewPass ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            {/* Live Password Requirements Checklist (triggered when New Password input is clicked) */}
            {(newPassClicked || newPass.length > 0) && (
              <div style={{
                marginBottom: 14,
                padding: '10px 12px',
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Password Requirements:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '4px 10px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11.5,
                    color: newPassCriteria.length ? '#16A34A' : '#94A3B8',
                    fontWeight: newPassCriteria.length ? 700 : 500,
                    transition: 'color 0.15s ease',
                  }}>
                    <CheckCircle2 size={12} style={{ flexShrink: 0, opacity: newPassCriteria.length ? 1 : 0.4 }} />
                    <span>8+ characters</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11.5,
                    color: newPassCriteria.hasNumber ? '#16A34A' : '#94A3B8',
                    fontWeight: newPassCriteria.hasNumber ? 700 : 500,
                    transition: 'color 0.15s ease',
                  }}>
                    <CheckCircle2 size={12} style={{ flexShrink: 0, opacity: newPassCriteria.hasNumber ? 1 : 0.4 }} />
                    <span>At least 1 number</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11.5,
                    color: newPassCriteria.hasUpper ? '#16A34A' : '#94A3B8',
                    fontWeight: newPassCriteria.hasUpper ? 700 : 500,
                    transition: 'color 0.15s ease',
                  }}>
                    <CheckCircle2 size={12} style={{ flexShrink: 0, opacity: newPassCriteria.hasUpper ? 1 : 0.4 }} />
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11.5,
                    color: newPassCriteria.hasLower ? '#16A34A' : '#94A3B8',
                    fontWeight: newPassCriteria.hasLower ? 700 : 500,
                    transition: 'color 0.15s ease',
                  }}>
                    <CheckCircle2 size={12} style={{ flexShrink: 0, opacity: newPassCriteria.hasLower ? 1 : 0.4 }} />
                    <span>Lowercase (a-z)</span>
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleChangePassword} disabled={saving} style={{
              width: '100%', padding: 12, borderRadius: 12, background: '#0F172A', color: 'white',
              border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font)', opacity: saving ? 0.6 : 1,
            }}>
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── NOTIFICATION SETTINGS ─────────────────────────────── */
  if (section === 'notifications') return (
    <div className="mobile-shell mobile-subpage-forward" key="profile-notifications" style={{ background: '#FFFFFF' }}>
      <div style={{ flex: 1, paddingBottom: 80 }}>

        <SectionHeader title="Notification Settings" onBack={backToMain} />
        <div style={{ padding: 'clamp(14px, 4vw, 20px)' }}>
          {([
            { key: 'statusUpdates', label: 'Status Updates', desc: 'Get notified when your report status changes' },
            { key: 'emergencyAlerts', label: 'Emergency Alerts', desc: 'Receive area-wide emergency broadcasts' },
            { key: 'systemNotices', label: 'System Notices', desc: 'App updates and maintenance alerts' },
            { key: 'sound', label: 'Notification Sound', desc: 'Play sound for incoming alerts' },
          ] as const).map(item => (
            <div key={item.key} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: 'clamp(12px, 3.5vw, 16px) 0', borderBottom: '1px solid #E2E8F0',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'clamp(13px, 3.8vw, 15px)', fontWeight: 700, color: '#0F172A' }}>{item.label}</div>
                <div style={{ fontSize: 'clamp(11px, 3vw, 12px)', color: '#94A3B8', marginTop: 2 }}>{item.desc}</div>
              </div>
              <Toggle
                on={Boolean(notifSettings[item.key])}
                onToggle={() => {
                  const newVal = !notifSettings[item.key];
                  const updated = saveNotifSettings({ [item.key]: newVal });
                  setNotifSettings(updated);
                  if (item.key === 'sound' && newVal) {
                    playNotificationSound(true);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── HELP & SUPPORT ────────────────────────────────────── */
  if (section === 'help') {
    const faqs = [
      { q: 'How do I report an incident?', a: 'Tap the "SEND EMERGENCY ALERT" button on the home screen. Take a photo, allow GPS access, and submit. AI will classify your report automatically.' },
      { q: 'How long does it take for a response?', a: 'Reports are reviewed immediately by MDRRMO dispatchers. Response teams are typically dispatched within 5–15 minutes.' },
      { q: 'Can I track my report status?', a: 'Yes! Go to the History tab to see all your past reports and their current status (Pending, Reviewing, Dispatched, Resolved).' },
      { q: 'What if I accidentally submit a false report?', a: 'Contact MDRRMO immediately via phone or email. Repeated false reports may result in account suspension.' },
      { q: 'Is my location data safe?', a: 'Your GPS coordinates are only used to dispatch the nearest response team and verify you are within Balayan. Data is encrypted.' },
      { q: 'Why can I only report from Balayan?', a: 'SendResqPls is specifically designed for the MDRRMO of Balayan, Batangas. Reports are only accepted from within the municipality boundaries.' },
    ];

    return (
      <div className="mobile-shell mobile-subpage-forward" key="profile-help" style={{ background: '#FFFFFF' }}>
        <div style={{ flex: 1, paddingBottom: 80 }}>
          <SectionHeader title="Help & Support" onBack={backToMain} />
          <div style={{ padding: 'clamp(14px, 4vw, 20px)' }}>
            {/* Contact card */}
            <div style={{
              background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              borderRadius: 16, padding: 'clamp(14px, 4vw, 18px)', marginBottom: 20,
              border: '1px solid #BFDBFE',
            }}>
              <h3 style={{ fontSize: 'clamp(13px, 3.8vw, 15px)', fontWeight: 800, color: '#1E40AF', marginBottom: 12 }}>Contact MDRRMO Balayan</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="tel:09171234567" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1E40AF', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                  <FiPhone size={15} /> 0917-123-4567
                </a>
                <a href="mailto:mdrrmo@balayan.gov.ph" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1E40AF', textDecoration: 'none', fontSize: 14, fontWeight: 600, wordBreak: 'break-all' }}>
                  <FaEnvelope size={15} /> mdrrmo@balayan.gov.ph
                </a>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1E40AF', fontSize: 14, fontWeight: 600 }}>
                  <MessageCircle size={15} /> Live chat (8AM – 5PM)
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Frequently Asked Questions</h3>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 14, marginBottom: 8, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', padding: '14px 16px', background: openFaq === i ? '#F0F9FF' : 'none',
                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 700, color: '#0F172A',
                    fontFamily: 'var(--font)', textAlign: 'left', gap: 8,
                  }}
                >
                  <span style={{ flex: 1 }}>{faq.q}</span>
                  <ChevronRight size={16} style={{ transform: openFaq === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 16px 14px', fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}

            {/* Legal & Policies (Read-only access) */}
            <h3 style={{ fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 800, color: '#0F172A', margin: '20px 0 12px' }}>Legal &amp; Policies</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={() => setLegalModalDoc('terms')}
                style={{
                  width: '100%', padding: '14px 16px', background: 'white',
                  borderRadius: 14, border: '1px solid #E2E8F0',
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: '#EFF6FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#2563EB', flexShrink: 0,
                }}>
                  <FileText size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'clamp(12.5px, 3.5vw, 14px)', fontWeight: 700, color: '#0F172A' }}>Terms &amp; Conditions</div>
                  <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>Usage rules and citizen responsibilities</div>
                </div>
                <ChevronRight size={16} color="#CBD5E1" style={{ flexShrink: 0 }} />
              </button>

              <button
                type="button"
                onClick={() => setLegalModalDoc('privacy')}
                style={{
                  width: '100%', padding: '14px 16px', background: 'white',
                  borderRadius: 14, border: '1px solid #E2E8F0',
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: '#EFF6FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#2563EB', flexShrink: 0,
                }}>
                  <ShieldCheck size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'clamp(12.5px, 3.5vw, 14px)', fontWeight: 700, color: '#0F172A' }}>Privacy Policy</div>
                  <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>How we collect, use, and protect your data</div>
                </div>
                <ChevronRight size={16} color="#CBD5E1" style={{ flexShrink: 0 }} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 24,
              color: '#94A3B8',
              fontSize: 11.5,
              fontWeight: 600,
              textAlign: 'center',
            }}>
              <Info size={13} style={{ flexShrink: 0 }} />
              <span>SendResQPls v2 · MDRRMO Balayan, Batangas</span>
            </div>
          </div>
        </div>

        <LegalModal
          isOpen={legalModalDoc !== null}
          initialDoc={legalModalDoc || 'terms'}
          onClose={() => setLegalModalDoc(null)}
        />
      </div>
    );
  }

  return null;
}
