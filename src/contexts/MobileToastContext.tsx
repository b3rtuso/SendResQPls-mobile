import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';

export type MobileToastPriority = 'normal' | 'important' | 'critical';
export type MobileToastType = 'success' | 'error' | 'warning' | 'info' | 'incident' | 'system' | 'update';

export interface MobileToastItem {
  id: string;
  title: string;
  message?: string;
  type: MobileToastType;
  priority: MobileToastPriority;
  /** Auto-dismiss duration in ms. 0 = never. Defaults by priority if not set. */
  duration?: number;
  /** Route to navigate to when notification is tapped */
  navigateTo?: string;
  incidentId?: string;
  /** Incident status string for color mapping */
  status?: string;
  /** Assigned department for specialized unit icon and coloring */
  department?: string;
  /** Shown on the notification (e.g. "just now") */
  timestamp?: string;
  /** Custom icon element */
  icon?: ReactNode;
}

export type MobileToastInput = Omit<MobileToastItem, 'id' | 'timestamp'>;

interface MobileToastContextValue {
  toasts: MobileToastItem[];
  push: (item: MobileToastInput) => string;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

const MobileToastContext = createContext<MobileToastContextValue | null>(null);

const MAX_STACK = 3;

const DEFAULT_DURATION: Record<MobileToastPriority, number> = {
  normal:    4500,
  important: 5500,
  critical:  0,   // stays until dismissed
};

export function MobileToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<MobileToastItem[]>([]);
  const counterRef = useRef(0);
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
    recentToastsRef.current.clear();
  }, []);

  // Automatically clear all active toasts when user logs out
  useEffect(() => {
    const handleLogout = () => {
      setToasts([]);
      recentToastsRef.current.clear();
    };
    window.addEventListener('srq-logout', handleLogout);
    return () => window.removeEventListener('srq-logout', handleLogout);
  }, []);

  const push = useCallback((item: MobileToastInput): string => {
    const now = Date.now();
    const dedupKey = `${item.incidentId || item.title}-${item.status || item.type}-${item.department || ''}`;
    
    // Purge old keys (> 10s)
    recentToastsRef.current.forEach((time, k) => {
      if (now - time > 10000) recentToastsRef.current.delete(k);
    });

    const lastTime = recentToastsRef.current.get(dedupKey);
    if (lastTime && now - lastTime < 8000) {
      // Duplicate toast within 8 seconds - silently ignore
      return '';
    }
    recentToastsRef.current.set(dedupKey, now);

    const id = `mt-${now}-${counterRef.current++}`;
    const timestamp = 'just now';
    const duration = item.duration ?? DEFAULT_DURATION[item.priority];

    const newToast: MobileToastItem = { ...item, id, timestamp, duration };

    setToasts(prev => {
      // Newest at top; cap at MAX_STACK (remove oldest = last in array)
      const next = [newToast, ...prev].slice(0, MAX_STACK);
      return next;
    });

    return id;
  }, []);

  return (
    <MobileToastContext.Provider value={{ toasts, push, dismiss, clearAll }}>
      {children}
    </MobileToastContext.Provider>
  );
}

export function useMobileToast(): MobileToastContextValue {
  const ctx = useContext(MobileToastContext);
  if (!ctx) throw new Error('useMobileToast must be used inside <MobileToastProvider>');
  return ctx;
}

export default MobileToastContext;
