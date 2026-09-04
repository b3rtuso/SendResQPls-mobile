import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Zap } from 'lucide-react';
import type { MobileToastItem } from '../contexts/MobileToastContext';

interface MobileToastCardProps {
  toast: MobileToastItem;
  onDismiss: (id: string) => void;
  index: number; // 0 = top/newest
}

// ── Color config ──────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  success:  '#22C55E',
  error:    '#EF4444',
  warning:  '#F59E0B',
  info:     '#2563EB',
  incident: '#2563EB',
  system:   '#64748B',
};

const STATUS_COLOR: Record<string, string> = {
  DISPATCHED:   '#2563EB',
  RESOLVED:     '#22C55E',
  REVIEWING:    '#F59E0B',
  REJECTED:     '#EF4444',
  PENDING:      '#64748B',
  NEW_INCIDENT: '#EF4444',
};

// ── Component ─────────────────────────────────────────────
export default function MobileToastCard({ toast, onDismiss, index }: MobileToastCardProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  // Swipe state
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Timer refs
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef   = useRef<number | null>(null);
  const pausedAt   = useRef<number | null>(null);  // remaining ms when paused
  const isPaused   = useRef(false);

  const accent = toast.status
    ? (STATUS_COLOR[toast.status] ?? TYPE_COLOR[toast.type] ?? '#2563EB')
    : (TYPE_COLOR[toast.type] ?? '#2563EB');

  const isCritical = toast.priority === 'critical';
  const duration   = toast.duration ?? 0;

  // ── Lifecycle ──────────────────────────────────────────
  const triggerExit = () => {
    if (phase === 'exit') return;
    setPhase('exit');
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const startTimer = (remaining: number) => {
    if (duration === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(triggerExit, remaining);
  };

  const pauseTimer = () => {
    if (duration === 0 || isPaused.current) return;
    isPaused.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const elapsed = startRef.current ? performance.now() - startRef.current : 0;
    pausedAt.current = Math.max(0, duration - elapsed);
  };

  const resumeTimer = () => {
    if (!isPaused.current) return;
    isPaused.current = false;
    const remaining = pausedAt.current ?? duration;
    startRef.current = performance.now();
    startTimer(remaining);
  };

  useEffect(() => {
    // Enter animation
    const enterT = setTimeout(() => setPhase('visible'), 20);
    // Start auto-dismiss
    if (duration > 0) {
      startRef.current = performance.now();
      startTimer(duration);
    }
    return () => {
      clearTimeout(enterT);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Swipe handlers ─────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    pauseTimer();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    // Only track horizontal swipes
    if (Math.abs(dx) > Math.abs(dy)) {
      setSwipeX(dx);
    }
  };

  const onTouchEnd = () => {
    const threshold = 60;
    if (Math.abs(swipeX) >= threshold) {
      // Fly off screen
      setSwipeX(swipeX > 0 ? 400 : -400);
      setPhase('exit');
      if (timerRef.current) clearTimeout(timerRef.current);
      setTimeout(() => onDismiss(toast.id), 280);
    } else {
      // Snap back
      setSwipeX(0);
      resumeTimer();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // ── Tap handler ────────────────────────────────────────
  const handleTap = () => {
    if (Math.abs(swipeX) > 5) return; // ignore if was swiping
    if (toast.navigateTo) {
      onDismiss(toast.id);
      navigate(toast.navigateTo);
    } else if (toast.incidentId) {
      onDismiss(toast.id);
      navigate(`/mobile/history?incidentId=${toast.incidentId}`);
    }
  };

  // ── Visual state ───────────────────────────────────────
  const isVisible = phase === 'visible';
  const translateY = isVisible ? 0 : phase === 'exit' ? -20 : -110;
  const opacity    = phase === 'enter' ? 0 : phase === 'exit' ? 0 : 1;
  const scale      = phase === 'visible' ? 1 : 0.96;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleTap}
      style={{
        position: 'relative',
        background: '#FFFFFF',
        borderRadius: 14,
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        cursor: (toast.navigateTo || toast.incidentId) ? 'pointer' : 'default',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        // Animations
        transform: `translateY(${translateY}%) scale(${scale}) translateX(${swipeX}px)`,
        opacity,
        transition: swipeX !== 0
          ? 'opacity 0.3s ease, box-shadow 0.2s'
          : `transform 0.38s cubic-bezier(0.16,1,0.3,1), opacity 0.32s ease, box-shadow 0.2s`,
        // Stack offset: cards below are slightly scaled down and shifted
        zIndex: 100 - index,
      }}
    >
      {/* Critical pulsing dot */}
      {isCritical && (
        <div style={{
          position: 'absolute', top: 12, right: 44,
          width: 8, height: 8, borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 0 0 ${accent}`,
          animation: 'srq-pulse 1.4s cubic-bezier(0.66,0,0,1) infinite',
        }} />
      )}

      {/* Main content row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 12, padding: '12px 14px',
      }}>
        {/* Left Icon / Badge */}
        {toast.type === 'error' ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, width: 28, height: 28,
            color: '#DC2626', background: '#FEE2E2', borderRadius: 8,
          }}>
            <svg style={{ width: 16, height: 16 }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 9v4m0 4h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
            </svg>
          </div>
        ) : toast.type === 'success' ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, width: 28, height: 28,
            color: '#16A34A', background: '#DCFCE7', borderRadius: 8,
          }}>
            <svg style={{ width: 16, height: 16 }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 11.917 9.724 16.5 19 7.5" />
            </svg>
          </div>
        ) : toast.type === 'warning' ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, width: 28, height: 28,
            color: '#D97706', background: '#FEF3C7', borderRadius: 8,
          }}>
            <svg style={{ width: 16, height: 16 }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          </div>
        ) : (
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, width: 28, height: 28,
            color: '#2563EB', background: '#DBEAFE', borderRadius: 8,
          }}>
            <svg style={{ width: 16, height: 16 }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 18-7 3 7-18 7 18-7-3Zm0 0v-5" />
            </svg>
          </div>
        )}

        {/* Text content — no vertical dividing line */}
        <div style={{
          flex: 1, minWidth: 0,
        }}>
          <div style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: toast.type === 'error' ? '#DC2626' : '#0F172A',
            lineHeight: 1.35,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {toast.title}
          </div>

          {toast.message && (
            <div style={{
              fontSize: 12,
              color: '#475569',
              marginTop: 2,
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {toast.message}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={e => { e.stopPropagation(); triggerExit(); }}
          aria-label="Close"
          style={{
            flexShrink: 0, width: 26, height: 26, borderRadius: 6,
            background: 'transparent', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#94A3B8', padding: 0,
            transition: 'color 0.15s',
          }}
        >
          <X size={15} strokeWidth={2.2} />
        </button>
      </div>

      {/* Swipe hint overlay (appears when swipe starts) */}
      {Math.abs(swipeX) > 15 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center',
          justifyContent: swipeX > 0 ? 'flex-start' : 'flex-end',
          padding: '0 20px',
          background: `${accent}12`,
          borderRadius: 18,
          pointerEvents: 'none',
        }}>
          <Zap size={20} color={accent} style={{ opacity: Math.min(1, Math.abs(swipeX) / 60) }} />
        </div>
      )}
    </div>
  );
}
