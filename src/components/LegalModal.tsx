import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

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
  const activeDoc: LegalDocType = initialDoc;

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

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="legal-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes legalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes legalModalPop {
          0% {
            opacity: 0;
            transform: scale(0.94) translateY(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .legal-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background-color: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: legalFadeIn 0.2s ease-out;
          box-sizing: border-box;
          overflow: hidden;
        }

        .legal-modal-card {
          width: 100%;
          max-width: 520px;
          max-height: calc(100dvh - 32px);
          background-color: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.85);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: legalModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
          margin: auto;
          position: relative;
        }

        .legal-modal-header {
          padding: 18px 20px 14px;
          border-bottom: 1px solid #E2E8F0;
          background: linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .legal-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .legal-header-logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #E2E8F0;
          flex-shrink: 0;
        }

        .legal-header-org {
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .legal-header-title {
          font-size: 16px;
          font-weight: 800;
          color: #0F172A;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .legal-header-close {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .legal-header-close:hover {
          background: #F1F5F9;
          color: #0F172A;
        }

        .legal-content-scroll {
          padding: 18px 20px;
          overflow-y: auto;
          font-size: 13.5px;
          color: #334155;
          line-height: 1.6;
          flex: 1;
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

        /* Legal Notice Boxes */
        .legal-notice-box-terms {
          background: #FEF2F2;
          border: 1.5px solid #FCA5A5;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }
        .legal-notice-title-terms {
          font-size: 12px;
          font-weight: 800;
          color: #991B1B;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }
        .legal-notice-body-terms {
          font-size: 12px;
          color: #7F1D1D;
          line-height: 1.5;
        }

        .legal-notice-box-privacy {
          background: #EFF6FF;
          border: 1.5px solid #BFDBFE;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }
        .legal-notice-title-privacy {
          font-size: 12px;
          font-weight: 800;
          color: #1E40AF;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }
        .legal-notice-body-privacy {
          font-size: 12px;
          color: #1E3A8A;
          line-height: 1.5;
        }

        .legal-section-heading {
          font-size: 13.5px;
          font-weight: 800;
          color: #0F172A;
          margin: 14px 0 4px;
        }
        .legal-section-heading:first-of-type {
          margin-top: 0;
        }
        .legal-paragraph {
          margin: 0 0 12px;
          font-size: 13px;
          color: #475569;
          line-height: 1.55;
        }
        .legal-list {
          margin: 0 0 12px;
          padding-left: 18px;
          font-size: 13px;
          color: #475569;
          line-height: 1.55;
        }
        .legal-list li + li {
          margin-top: 4px;
        }

        /* ─── RESPONSIVE FOOTER ACTIONS ─── */
        .legal-modal-footer {
          padding: 14px 20px;
          border-top: 1px solid #E2E8F0;
          background: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .legal-btn-secondary {
          padding: 11px 20px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 12px;
          border: 1px solid #CBD5E1;
          background: #FFFFFF;
          color: #475569;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .legal-btn-secondary:active {
          background: #F1F5F9;
        }

        .legal-btn-primary {
          padding: 11px 22px;
          font-size: 13px;
          font-weight: 700;
          border-radius: 12px;
          border: none;
          background: #2563EB;
          color: #FFFFFF;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          transition: all 0.15s;
          box-sizing: border-box;
          text-align: center;
        }
        .legal-btn-primary:active {
          background: #1D4ED8;
        }

        /* Mobile Screens (<= 480px) */
        @media (max-width: 480px) {
          .legal-modal-overlay {
            padding: 12px;
          }
          .legal-modal-card {
            max-height: calc(100dvh - 24px);
            border-radius: 18px;
            margin: auto;
          }
          .legal-modal-header {
            padding: 14px 16px 12px;
          }
          .legal-content-scroll {
            padding: 14px 16px;
          }
          .legal-modal-footer {
            flex-direction: column-reverse;
            gap: 8px;
            padding: 12px 16px;
          }
          .legal-btn-secondary,
          .legal-btn-primary {
            width: 100% !important;
            min-height: 46px;
            text-align: center;
            justify-content: center;
            font-size: 13.5px;
          }
        }
      `}</style>

      <div className="legal-modal-card">
        {/* Header */}
        <div className="legal-modal-header">
          <div className="legal-header-left">
            <img
              src="/logo.jpg"
              alt="SRQ"
              className="legal-header-logo"
            />
            <div>
              <div className="legal-header-org">
                MDRRMO Balayan Legal
              </div>
              <div className="legal-header-title">
                {activeDoc === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="legal-header-close"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content — displays ONLY the selected document */}
        <div className="legal-content-scroll">
          {activeDoc === 'terms' ? (
            <div>
              {/* Notice Box */}
              <div className="legal-notice-box-terms">
                <div className="legal-notice-title-terms">
                  Strict Legal Notice — False Reports
                </div>
                <div className="legal-notice-body-terms">
                  Under <strong>Presidential Decree No. 1727</strong> and the Revised Penal Code, knowingly filing false or prank emergency alerts carries criminal penalties of up to 5 years imprisonment, civil liability for dispatch costs, and permanent blacklisting.
                </div>
              </div>

              <div className="legal-section-heading">
                1. Official Emergency Platform
              </div>
              <p className="legal-paragraph">
                SendResQPls is the official digital incident reporting platform of the Municipal Disaster Risk Reduction and Management Office (MDRRMO Balayan), Local Government Unit of Balayan, Batangas. By using this service, you agree to comply with Philippine disaster response laws (RA 10121) and municipal regulations.
              </p>

              <div className="legal-section-heading">
                2. Immediate Life-Threatening Emergencies
              </div>
              <p className="legal-paragraph">
                SendResQPls is an auxiliary reporting tool. In situations of active violence, massive fire, cardiac arrest, or where cellular data is degraded, <strong>always dial Hotline 911 or MDRRMO Balayan directly at 0917-123-4567</strong>.
              </p>

              <div className="legal-section-heading">
                3. User Account and Accuracy
              </div>
              <p className="legal-paragraph">
                You agree to supply accurate contact information (real name, phone number, and verified email) so dispatchers and responders can reach you for verification. You are responsible for safeguarding your verification credentials.
              </p>

              <div className="legal-section-heading">
                4. Location and Media Permissions
              </div>
              <p className="legal-paragraph">
                Submitting a report automatically tags your device GPS coordinates and uploads attached photos to aid first responders (BFP, PNP, MHO, Engineering, Rescue). You grant MDRRMO an irrevocable license to use submitted incident media for operational response and post-disaster audits.
              </p>

              <div className="legal-section-heading">
                5. Triage and Response Time Disclaimer
              </div>
              <p className="legal-paragraph">
                MDRRMO Balayan dispatches resources based on prioritized emergency triage. Response times are subject to extreme weather, road accessibility, and mass-casualty resource availability.
              </p>

              <div className="legal-section-heading">
                6. Governing Law &amp; Jurisdiction
              </div>
              <p className="legal-paragraph">
                These Terms are governed exclusively by the laws of the Republic of the Philippines. Venue for any legal proceedings shall lie within the courts of the Province of Batangas.
              </p>
            </div>
          ) : (
            <div>
              {/* Privacy Compliance Box */}
              <div className="legal-notice-box-privacy">
                <div className="legal-notice-title-privacy">
                  RA 10173 Data Privacy Compliance
                </div>
                <div className="legal-notice-body-privacy">
                  MDRRMO Balayan processes personal data strictly for emergency rescue, public safety coordination, and life protection under the <strong>Philippine Data Privacy Act of 2012</strong>.
                </div>
              </div>

              <div className="legal-section-heading">
                1. Information Collected
              </div>
              <ul className="legal-list">
                <li><strong>Account Data:</strong> Name, mobile phone number, verified email address, and hashed password.</li>
                <li><strong>Incident Data:</strong> Hazard type, textual descriptions, and incident scene photographs.</li>
                <li><strong>Precise Location:</strong> GPS coordinates at the moment an emergency report is filed.</li>
                <li><strong>Device Tokens:</strong> Firebase Cloud Messaging token for emergency broadcast delivery.</li>
              </ul>

              <div className="legal-section-heading">
                2. How Your Data is Used
              </div>
              <p className="legal-paragraph">
                Data is exclusively utilized to: (a) route emergency alerts to the Balayan Command Center; (b) deploy first responder teams (BFP, PNP, Medical, Engineering); (c) send live progress notifications to citizens; and (d) maintain municipal audit records.
              </p>

              <div className="legal-section-heading">
                3. Zero Commercial Exploitation
              </div>
              <p className="legal-paragraph">
                <strong>Your personal information is NEVER sold, rented, leased, or shared with commercial advertisers or data brokers under any circumstances.</strong>
              </p>

              <div className="legal-section-heading">
                4. Data Security and Encryption
              </div>
              <p className="legal-paragraph">
                All network communication uses TLS 1.3 encryption. Passwords are salted and hashed via bcrypt. Database storage (Supabase) and media storage (Cloudinary) enforce strict encryption and role-based access control.
              </p>

              <div className="legal-section-heading">
                5. Your Statutory Rights (RA 10173)
              </div>
              <p className="legal-paragraph">
                You have the right to be informed, access, rectify, or request deletion of personal account records (subject to government record retention mandates). For inquiries, contact the MDRRMO Balayan Data Protection Officer at <strong>mdrrmo.balayan@gmail.com</strong>.
              </p>

              <div className="legal-section-heading">
                6. Data Protection Officer (DPO) Contact
              </div>
              <p className="legal-paragraph">
                Municipal Disaster Risk Reduction and Management Office (MDRRMO Balayan), Balayan Government Center, Plaza Rizal, Balayan, Batangas 4213.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions (Fully Responsive) */}
        <div className="legal-modal-footer">
          <button
            type="button"
            className="legal-btn-secondary"
            onClick={onClose}
          >
            Close
          </button>

          {onAccept && (
            <button
              type="button"
              className="legal-btn-primary"
              onClick={() => {
                onAccept();
                onClose();
              }}
            >
              {acceptLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
