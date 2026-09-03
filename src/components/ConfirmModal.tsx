import { useEffect } from 'react';
import { X, AlertTriangle, Trash2, Edit3, CheckCircle2, HelpCircle } from 'lucide-react';
import type { FieldChange } from '../utils/changeDetector';

export type ConfirmType = 'confirm' | 'modal' | 'delete' | 'update' | 'warning' | 'discard';

export interface ConfirmOptions {
  type?: ConfirmType;
  title?: string;
  message: string;
  detail?: string;
  confirmText?: string;
  cancelText?: string;
  changes?: FieldChange[];
}

interface ConfirmModalProps {
  isOpen: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  options,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const {
    type = 'confirm',
    title,
    message,
    detail,
    confirmText,
    cancelText = 'Cancel',
    changes,
  } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDelete = type === 'delete';
  const isUpdate = type === 'update';
  const isWarning = type === 'warning';
  const isDiscard = type === 'discard';

  const defaultTitle = isDelete
    ? 'Delete Confirmation'
    : isUpdate
    ? 'Update Confirmation'
    : isWarning
    ? 'Warning: Action Required'
    : isDiscard
    ? 'Discard Changes?'
    : 'Confirmation Dialog';

  const resolvedTitle = title || defaultTitle;
  const resolvedMessage = isDiscard && !message
    ? 'You have unsaved changes. Are you sure you want to leave? Your changes will be discarded.'
    : message;

  const defaultConfirmBtn = isDelete
    ? 'Delete'
    : isUpdate
    ? 'Update'
    : isWarning
    ? 'Proceed'
    : isDiscard
    ? 'Discard Changes'
    : 'Confirm';
  const resolvedConfirmBtn = confirmText || defaultConfirmBtn;
  const resolvedCancelBtn = cancelText === 'Cancel' && isDiscard ? 'Keep Editing' : cancelText;

  // ── 1. Crimson Wine Theme for Delete (matches Screenshot 3) ──
  if (isDelete) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100000,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          boxSizing: 'border-box',
        }}
        onClick={onCancel}
      >
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 380,
            background: '#2B0710',
            border: '1px solid #9F1239',
            borderRadius: 18,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(159, 18, 57, 0.3)',
            padding: '22px 20px',
            color: '#FFFFFF',
            fontFamily: "var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'rgba(225, 29, 72, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FDA4AF',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={18} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#FDA4AF' }}>
                {resolvedTitle}
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FDA4AF',
                opacity: 0.7,
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ fontSize: 13.5, color: '#FCA5A5', lineHeight: 1.5 }}>
            {message}
          </div>

          {detail && (
            <div style={{ fontSize: 12, color: 'rgba(253, 164, 175, 0.8)', background: 'rgba(159, 18, 57, 0.2)', padding: '8px 12px', borderRadius: 8 }}>
              {detail}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: '#FDA4AF',
                border: '1px solid #9F1239',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                padding: '8px 18px',
                background: '#E11D48',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
              }}
            >
              <Trash2 size={14} /> {resolvedConfirmBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. Dark Navy Theme for Update, Warning, Confirm, Modal, Discard ──
  const accentColor = isDiscard
    ? '#EF4444'
    : isWarning
    ? '#F59E0B'
    : isUpdate
    ? '#3B82F6'
    : '#2563EB';

  const accentBg = isDiscard
    ? 'rgba(239, 68, 68, 0.15)'
    : isWarning
    ? 'rgba(245, 158, 11, 0.15)'
    : 'rgba(59, 130, 246, 0.15)';

  const IconComponent = isDiscard
    ? AlertTriangle
    : isWarning
    ? AlertTriangle
    : isUpdate
    ? Edit3
    : isDelete
    ? Trash2
    : HelpCircle;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#0B132B',
          border: isDiscard ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 18,
          boxShadow: isDiscard
            ? '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(239, 68, 68, 0.2)'
            : '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          padding: '22px 20px',
          color: '#FFFFFF',
          fontFamily: "var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: accentBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor,
                flexShrink: 0,
              }}
            >
              <IconComponent size={18} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
              {resolvedTitle}
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: 13.5, color: '#CBD5E1', lineHeight: 1.5 }}>
          {resolvedMessage}
        </div>

        {/* Changed Fields list (only modified fields shown) */}
        {changes && changes.length > 0 && (
          <div
            style={{
              maxHeight: 180,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              margin: '2px 0',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Detected Changes ({changes.length})
            </div>
            {changes.map((change) => (
              <div
                key={change.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  padding: '7px 10px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#E2E8F0' }}>
                  {change.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      color: '#F87171',
                      textDecoration: 'line-through',
                      opacity: 0.85,
                      wordBreak: 'break-all',
                      background: 'rgba(239, 68, 68, 0.12)',
                      padding: '1px 6px',
                      borderRadius: 4,
                    }}
                  >
                    {change.oldFormatted}
                  </span>
                  <span style={{ color: '#60A5FA', fontWeight: 800 }}>→</span>
                  <span
                    style={{
                      color: '#4ADE80',
                      fontWeight: 700,
                      wordBreak: 'break-all',
                      background: 'rgba(34, 197, 94, 0.14)',
                      padding: '1px 6px',
                      borderRadius: 4,
                    }}
                  >
                    {change.newFormatted}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {detail && (
          <div style={{ fontSize: 12, color: '#94A3B8', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '8px 12px', borderRadius: 8 }}>
            {detail}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#94A3B8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {resolvedCancelBtn}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '8px 18px',
              background: accentColor,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: `0 4px 14px ${accentColor}40`,
            }}
          >
            {isDiscard ? <AlertTriangle size={14} /> : isUpdate ? <Edit3 size={14} /> : <CheckCircle2 size={14} />} {resolvedConfirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
