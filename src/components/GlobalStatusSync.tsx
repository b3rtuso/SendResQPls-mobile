import { useEffect, useRef } from 'react';
import { getMyIncidents } from '../api/client';
import { addNotification } from '../pages/mobile/MobileNotifications';
import { useMobileToast } from '../contexts/MobileToastContext';
import { INCIDENT_SYNC_EVENT } from '../utils/pushNotificationHelper';

const STATUS_KEY = 'srq_last_statuses';

interface StoredIncidentState {
  status: string;
  department?: string;
}

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
 * When an admin updates an incident status or assigns a department:
 * 1. Saves update to srq_notifications (so it appears on the Alerts tab)
 * 2. Pops an in-app toast card using useMobileToast
 * 3. Dispatches INCIDENT_SYNC_EVENT so MobileHistory live-patches its state
 *    (Uses dedicated event instead of FCM_FOREGROUND_EVENT to prevent double-firing)
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
        const rawStored = JSON.parse(localStorage.getItem(STATUS_KEY) || '{}');
        const stored: Record<string, StoredIncidentState> = {};
        for (const [k, v] of Object.entries(rawStored)) {
          if (typeof v === 'string') {
            stored[k] = { status: v };
          } else if (v && typeof v === 'object') {
            stored[k] = v as StoredIncidentState;
          }
        }
        const isFirstRun = Object.keys(stored).length === 0;

        for (const inc of incidents) {
          const prev = stored[inc.id];
          const statusChanged = prev && prev.status !== inc.status;
          const deptChanged = prev && Boolean(inc.assignedDepartment && prev.department !== inc.assignedDepartment);

          // If there is an existing record and status or assigned department has changed
          if (!isFirstRun && prev && (statusChanged || deptChanged)) {
            const statusKey = inc.status;
            let title = STATUS_TITLES[statusKey] || `Report Status: ${statusKey}`;
            let message = STATUS_MESSAGES[statusKey] || `Your report status was updated to ${statusKey}.`;

            if (deptChanged && !statusChanged) {
              title = `🚒 Unit Assigned: ${inc.assignedDepartment}`;
              message = `${inc.assignedDepartment} has been assigned to respond to your emergency report.`;
            } else if (inc.assignedDepartment && inc.status === 'DISPATCHED') {
              title = `🚨 ${inc.assignedDepartment} Dispatched!`;
              message = `${inc.assignedDepartment} responders have been dispatched to your location.`;
            }

            // 1. Add to permanent Alerts tab
            addNotification({
              id: inc.id,
              type: inc.aiDetectedType || 'Emergency Update',
              status: inc.status,
              department: inc.assignedDepartment,
            });

            // 2. Show floating Facebook-style toast card
            push({
              title,
              message,
              type: statusKey === 'RESOLVED' ? 'success' : statusKey === 'REJECTED' ? 'error' : statusKey === 'DISPATCHED' ? 'incident' : 'warning',
              priority: statusKey === 'DISPATCHED' || statusKey === 'REJECTED' ? 'important' : 'normal',
              status: inc.status,
              department: inc.assignedDepartment,
              incidentId: inc.id,
              navigateTo: `/mobile/history?incidentId=${inc.id}`,
            });

            // 3. Dispatch dedicated sync event for MobileHistory (prevents FcmBannerOverlay duplicate popup)
            window.dispatchEvent(
              new CustomEvent(INCIDENT_SYNC_EVENT, {
                detail: {
                  title,
                  body: message,
                  incidentId: inc.id,
                  status: inc.status,
                  department: inc.assignedDepartment,
                  assignedDepartment: inc.assignedDepartment,
                  type: inc.aiDetectedType,
                },
              })
            );
          }

          stored[inc.id] = { status: inc.status, department: inc.assignedDepartment };
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
