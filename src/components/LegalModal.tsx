import { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type LegalDocType = 'terms' | 'privacy';

interface LegalModalProps {
  isOpen: boolean;
  initialDoc?: LegalDocType;
  onClose: () => void;
  onAccept?: () => void;
  acceptLabel?: string;
}

export default function LegalModal({
  isOpen,
  initialDoc = 'terms',
  onClose,
  onAccept,
  acceptLabel = 'I Agree & Understand',
}: LegalModalProps) {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);

  useEffect(() => {
    if (isOpen) {
      setActiveDoc(initialDoc);
    }
  }, [isOpen, initialDoc]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'legalFadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes legalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes legalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .legal-content-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .legal-content-scroll::-webkit-scrollbar-track {
          background: #F1F5F9;
        }
        .legal-content-scroll::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .legal-content-scroll::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'legalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #E2E8F0',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src="/logo.jpg"
                alt="SRQ"
                style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid #E2E8F0' }}
              />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  MDRRMO Balayan Legal
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {activeDoc === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          {/* Doc Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#F1F5F9',
              borderRadius: '12px',
              padding: '4px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveDoc('terms')}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: 12.5,
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s',
                background: activeDoc === 'terms' ? '#FFFFFF' : 'transparent',
                color: activeDoc === 'terms' ? '#2563EB' : '#64748B',
                boxShadow: activeDoc === 'terms' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <FileText size={14} />
              Terms & Conditions
            </button>

            <button
              type="button"
              onClick={() => setActiveDoc('privacy')}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: 12.5,
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s',
                background: activeDoc === 'privacy' ? '#FFFFFF' : 'transparent',
                color: activeDoc === 'privacy' ? '#2563EB' : '#64748B',
                boxShadow: activeDoc === 'privacy' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <ShieldCheck size={14} />
              Privacy Policy
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="legal-content-scroll"
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            fontSize: 13.5,
            color: '#334155',
            lineHeight: 1.6,
          }}
        >
          {activeDoc === 'terms' ? (
            <div>
              {/* Warning Notice Box */}
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1.5px solid #FCA5A5',
                  borderRadius: 14,
                  padding: '14px 16px',
                  marginBottom: 18,
                  display: 'flex',
                  gap: 12,
                }}
              >
                <AlertTriangle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>
                    Strict Legal Notice — False Reports
                  </div>
                  <div style={{ fontSize: 12, color: '#7F1D1D', lineHeight: 1.5 }}>
                    Under <strong>Presidential Decree No. 1727</strong> and the Revised Penal Code, knowingly filing false or prank emergency alerts carries criminal penalties of up to 5 years imprisonment, civil liability for dispatch costs, and permanent blacklisting.
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                1. Official Emergency Platform
              </h4>
              <p style={{ margin: '0 0 14px' }}>
                SendResQPls is the official digital incident reporting platform of the Municipal Disaster Risk Reduction and Management Office (MDRRMO Balayan), Local Government Unit of Balayan, Batangas. By using this service, you agree to comply with Philippine disaster response laws (RA 10121) and municipal regulations.
              </p>

              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                2. Immediate Life-Threatening Emergencies
              </h4>
              <p style={{ margin: '0 0 14px' }}>
                SendResQPls is an auxiliary reporting tool. In situations of active violence, massive fire, cardiac arrest, or where cellular data is degraded, <strong>always dial Hotline 911 or MDRRMO Balayan directly at 0917-123-4567</strong>.
              </p>

              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                3. User Account and Accuracy
              </h4>
              <p style={{ margin: '0 0 14px' }}>
                You agree to supply accurate contact information (real name, phone number, and verified email) so dispatchers and responders can reach you for verification. You are responsible for safeguarding your verification credentials.
              </p>

              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                4. Location and Media Permissions
              </h4>
              <p style={{ margin: '0 0 14px' }}>
                Submitting a report automatically tags your device GPS coordinates and uploads attached photos to aid first responders (BFP, PNP, MHO, Engineering, Rescue). You grant MDRRMO an irrevocable license to use submitted incident media for operational response and post-disaster audits.
              </p>

              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                5. Triage and Response Time Disclaimer
              </h4>
              <p style={{ margin: '0 0 14px' }}>
                MDRRMO Balayan dispatches resources based on prioritized emergency triage. Response times are subject to extreme weather, road accessibility, and mass-casualty resource availability.
              </p>

              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                6. Governing Law & Jurisdiction
              </h4>
              <p style={{ margin: '0 0 6px' }}>
                These Terms are governed exclusively by the laws of the Republic of the Philippines. Venue for any legal proceedings shall lie within the courts of the Province of Batangas.
              </p>
            </div>
          ) : (
            <div>
              {/* Privacy Badge Box */}
              <div
                style={{
                  background: '#EFF6FF',
                  border: '1.5px solid #BFDBFE',
                  borderRadius: 14,
                  padding: '14px 16px',
                  marginBottom: 18,
                  display: 'flex',
                  gap: 12,
                }}
              >
                <ShieldCheck size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>
                    RA 10173 Data Privacy Compliance
                  </div>
                  <div style={{ fontSize: 12, color: '#1E3A8A', lineHeight: 1.5 }}>
                    MDRRMO Balayan processes personal data strictly for emergency rescue, public safety coordination, and life protection under the <strong>Philippine Data Privacy Act of 2012</strong>.
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                1. Information Collected
              </h4>
              <ul style={{ margin: '0 0 14px', paddingLeft: 18, lineHeight: 1.55 }}>
                <li><strong>Account Data:</strong> Name, mobile phone number, verified email address, and hashed password.</li>
                <li><strong>Incident Data:</strong> Hazard type, textual descriptions, and incident scene photographs.</li>
                <li><strong>Precise Location:</strong> GPS coordinates at the moment an emergency report is filed.</li>
                <li><strong>Device Tokens:</strong> Firebase Cloud Messaging token for emergency broadcast delivery.</li>
              </ul>

              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                2. How Your Data is Used
              </h4>
              <p style={{ margin: '0 0 14px' }}>
                Data is exclusively utilized to: (a) route emergency alerts to the Balayan Command Center; (b) deploy first responder teams (BFP, PNP, Medical, Engineering); (c) send live progress notifications to citizens; and (d) maintain municipal audit records.
              </p>

              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                3. Zero Commercial Exploitation
              </h4>
              <p style={{ margin: '0 0 14px' }}>
                <strong>Your personal information is NEVER sold, rented, leased, or shared with commercial advertisers or data brokers under any circumstances.</strong>
              </p>

              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                4. Data Security and Encryption
              </h4>
              <p style={{ margin: '0 0 14px' }}>
                All network communication uses TLS 1.3 encryption. Passwords are salted and hashed via bcrypt. Database storage (Supabase) and media storage (Cloudinary) enforce strict encryption and role-based access control.
              </p>

              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                5. Your Statutory Rights (RA 10173)
              </h4>
              <p style={{ margin: '0 0 6px' }}>
                You have the right to be informed, access, rectify, or request deletion of personal account records (subject to government record retention mandates). For inquiries, contact the MDRRMO Balayan Data Protection Officer at <strong>mdrrmo.balayan@gmail.com</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 12,
              borderColor: '#CBD5E1',
              color: '#475569',
            }}
          >
            Close
          </Button>

          {onAccept && (
            <Button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              style={{
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 12,
                background: '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              }}
            >
              <Check size={16} />
              {acceptLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
