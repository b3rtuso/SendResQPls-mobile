import { useEffect, useRef } from 'react';
import { getMyIncidents } from '../api/client';
import { addNotification } from '../pages/mobile/MobileNotifications';
import { useMobileToast } from '../contexts/MobileToastContext';
import { FCM_FOREGROUND_EVENT } from '../utils/pushNotificationHelper';

const STATUS_KEY = 'srq_last_statuses';

const STATUS_TITLES: Record<string, string> = {
  DISPATCHED: '🚨 Responders Dispatched!',
  RESOLVED:   '✅ Emergency Resolved',
  REVIEWING:  '⚠️ Report Under Review',
  REJECTED:   '❌ Report Not Approved',
  PENDING:    '⏳ Report Received',
};

const STATUS_MESSAGES: Record<string, string> = {
  DISPATCHED: 'Responders have been dispatched to your location.',
  RESOLVED:   'Your emergency report has been marked as resolved.',
  REVIEWING:  'MDRRMO dispatchers are currently reviewing your report.',
  REJECTED:   'Your report could not be approved by the dispatcher.',
  PENDING:    'Your report is awaiting review by a dispatcher.',
};

/**
 * GlobalStatusSync
 * 
 * Runs globally across all tabs in AuthenticatedMobileLayout.
 * Polls the user's incidents every 12 seconds with skipCache=true.
 * When an admin updates an incident status:
 * 1. Saves update to srq_notifications (so it appears on the Alerts tab)
 * 2. Pops an in-app toast card using useMobileToast
 * 3. Dispatches FCM_FOREGROUND_EVENT so MobileHistory live-patches its state
 * 4. Works consistently on both native Android and web browsers!
 */
export default function GlobalStatusSync() {
  const { push } = useMobileToast();
  const checkingRef = useRef(false);

  useEffect(() => {
    const syncStatus = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!userId || !token) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      if (document.hidden) return;
      if (checkingRef.current) return;

      checkingRef.current = true;
      try {
        const res = await getMyIncidents(userId, true); // bypass cache for real-time check
        const incidents: any[] = res?.data || [];
        const stored: Record<string, string> = JSON.parse(localStorage.getItem(STATUS_KEY) || '{}');
        const isFirstRun = Object.keys(stored).length === 0;

        for (const inc of incidents) {
          const prevStatus = stored[inc.id];

          // If there is an existing record and status has changed
          if (!isFirstRun && prevStatus && prevStatus !== inc.status) {
            const statusKey = inc.status;
            const title = STATUS_TITLES[statusKey] || `Report Status: ${statusKey}`;
            const message = STATUS_MESSAGES[statusKey] || `Your report status was updated to ${statusKey}.`;

            // 1. Add to permanent Alerts tab
            addNotification({
              id: inc.id,
              type: inc.aiDetectedType || 'Emergency',
              status: inc.status,
            });

            // 2. Show floating Facebook-style toast card
            push({
              title,
              message,
              type: statusKey === 'RESOLVED' ? 'success' : statusKey === 'REJECTED' ? 'error' : statusKey === 'DISPATCHED' ? 'incident' : 'warning',
              priority: statusKey === 'DISPATCHED' || statusKey === 'REJECTED' ? 'important' : 'normal',
              status: inc.status,
              incidentId: inc.id,
              navigateTo: `/mobile/history?incidentId=${inc.id}`,
            });

            // 3. Dispatch FCM_FOREGROUND_EVENT so MobileHistory live-updates without full refetch
            window.dispatchEvent(
              new CustomEvent(FCM_FOREGROUND_EVENT, {
                detail: {
                  title,
                  body: message,
                  incidentId: inc.id,
                  status: inc.status,
                  type: inc.aiDetectedType,
                },
              })
            );
          }

          stored[inc.id] = inc.status;
        }

        localStorage.setItem(STATUS_KEY, JSON.stringify(stored));
      } catch {
        // silent fallback
      } finally {
        checkingRef.current = false;
      }
    };

    // Run initial sync after a short delay
    const initialTimer = setTimeout(syncStatus, 1500);

    // Background sync interval (every 12 seconds)
    const interval = setInterval(syncStatus, 12000);

    // Sync on app visibility change (resuming app from background)
    const handleVisibility = () => {
      if (!document.hidden) {
        syncStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [push]);

  return null;
}
