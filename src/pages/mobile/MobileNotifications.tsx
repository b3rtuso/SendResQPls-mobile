import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ShieldCheck, XCircle, Clock, ChevronLeft, CheckCheck, Trash2, ArrowRight, Truck, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDepartmentTheme, cleanIncidentType } from '../../utils/departmentUtils';
import { getMyIncidents } from '../../api/client';

// Pull notifications from localStorage
const NOTIF_KEY = 'srq_notifications';
const DELETED_ACTIVITIES_KEY = 'srq_deleted_activity_ids';
const CLEARED_AT_KEY = 'srq_notifications_cleared_at';
const READ_ACTIVITIES_KEY = 'srq_read_activity_ids';

export function getDeletedActivityIds(): Set<string> {
  try {
    const stored = localStorage.getItem(DELETED_ACTIVITIES_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch { return new Set(); }
}

export function addDeletedActivityIds(ids: string[]) {
  try {
    const set = getDeletedActivityIds();
    ids.forEach(id => { if (id) set.add(id); });
    localStorage.setItem(DELETED_ACTIVITIES_KEY, JSON.stringify(Array.from(set).slice(-300)));
  } catch {}
}

export function getReadActivityIds(): Set<string> {
  try {
    const stored = localStorage.getItem(READ_ACTIVITIES_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch { return new Set(); }
}

export function markActivitiesAsRead(ids: string[]) {
  try {
    const set = getReadActivityIds();
    ids.forEach(id => { if (id) set.add(id); });
    localStorage.setItem(READ_ACTIVITIES_KEY, JSON.stringify(Array.from(set).slice(-300)));
  } catch {}
}

export function getStoredNotifications(): StoredNotif[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
  } catch { return []; }
}

export function saveNotifications(notifs: StoredNotif[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  window.dispatchEvent(new CustomEvent('srq-notifications-updated'));
}

export function clearNotifications() {
  const existing = getStoredNotifications();
  const ids: string[] = [];
  existing.forEach(n => {
    if (n.activityId) ids.push(n.activityId);
    if (n.id) ids.push(n.id);
    if (n.incidentId) ids.push(n.incidentId);
  });
  addDeletedActivityIds(ids);
  localStorage.setItem(CLEARED_AT_KEY, String(Date.now()));
  localStorage.removeItem(NOTIF_KEY);
  window.dispatchEvent(new CustomEvent('srq-notifications-updated'));
}

// In-memory dedup tracking to prevent duplicate notifications from firing rapidly
const recentNotifs = new Map<string, number>();

export interface StoredNotif {
  id: string;
  incidentId?: string;
  activityId?: string;
  type: string;
  title?: string;
  message?: string;
  status: string;
  department?: string;
  time: string;
  read: boolean;
  timestamp?: number;
}

export function addNotification(notif: {
  id: string;
  incidentId?: string;
  activityId?: string;
  type: string;
  title?: string;
  message?: string;
  status: string;
  department?: string;
  time?: string;
  read?: boolean;
  timestamp?: number;
}) {
  const now = Date.now();
  const targetIncidentId = notif.incidentId || notif.id;
  const deptStr = (notif.department || '').trim().toUpperCase();
  const dedupKey = `${targetIncidentId}-${notif.status}-${deptStr}`;

  // Purge entries older than 30s
  recentNotifs.forEach((timestamp, key) => {
    if (now - timestamp > 30000) recentNotifs.delete(key);
  });

  const lastAdded = recentNotifs.get(dedupKey);
  if (lastAdded && now - lastAdded < 4000) {
    // Rapid duplicate trigger within 4 seconds — ignore double firing
    return;
  }
  const deleted = getDeletedActivityIds();
  const clearedAt = Number(localStorage.getItem(CLEARED_AT_KEY) || 0);
  if (deleted.has(targetIncidentId) || (notif.activityId && deleted.has(notif.activityId))) {
    return;
  }
  if (clearedAt && (notif.timestamp || now) <= clearedAt) {
    return;
  }

  const existing = getStoredNotifications();

  // If this specific activity record from the server was already added, skip
  if (notif.activityId && existing.some(n => n.activityId === notif.activityId)) {
    return;
  }

  // If the latest notification for this incident is already the exact same status AND department, skip
  const latestForIncident = existing.find(n => (n.incidentId || n.id) === targetIncidentId);
  if (
    latestForIncident &&
    latestForIncident.status === notif.status &&
    (latestForIncident.department || '').trim().toUpperCase() === deptStr
  ) {
    return;
  }

  const readSet = getReadActivityIds();
  const isRead = notif.read ?? (notif.activityId ? readSet.has(notif.activityId) : false);

  const newEntry: StoredNotif = {
    id: notif.activityId || `${targetIncidentId}-${now}`,
    incidentId: targetIncidentId,
    activityId: notif.activityId,
    type: cleanIncidentType(notif.type) || 'Emergency Update',
    title: notif.title,
    message: notif.message,
    status: notif.status || 'PENDING',
    department: notif.department,
    time: notif.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: isRead,
    timestamp: notif.timestamp || now,
  };

  // Consolidate: Keep only ONE latest card per incident so citizen's inbox isn't cluttered
  const remaining = existing.filter(n => (n.incidentId || n.id) !== targetIncidentId);
  saveNotifications([newEntry, ...remaining].slice(0, 50));
}

/**
 * Reconcile local notifications with authoritative incident activities from backend.
 * Consolidates each incident into a single latest card (latest activity/status)
 * so citizens see clean, actionable cards without duplicate historical steps.
 */
export async function syncNotificationsWithBackend(): Promise<StoredNotif[]> {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) return getStoredNotifications();
    if (typeof navigator !== 'undefined' && !navigator.onLine) return getStoredNotifications();

    const res = await getMyIncidents(userId, true);
    const incidents: any[] = res?.data || [];
    if (!Array.isArray(incidents)) return getStoredNotifications();

    const existing = getStoredNotifications();
    const deletedActivityIds = getDeletedActivityIds();
    const clearedAt = Number(localStorage.getItem(CLEARED_AT_KEY) || 0);
    const readActivityIds = getReadActivityIds();
    const newNotifs: StoredNotif[] = [];

    for (const inc of incidents) {
      if (deletedActivityIds.has(inc.id)) continue;
      const cleanType = cleanIncidentType(inc.aiDetectedType) || 'Emergency Update';
      const activities: any[] = (inc.activities || []).slice().sort((a: any, b: any) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });

      // Pick the single latest activity for this incident
      const latestAct = activities[0];
      const actTime = latestAct?.createdAt ? new Date(latestAct.createdAt).getTime() : (inc.createdAt ? new Date(inc.createdAt).getTime() : Date.now());
      if (clearedAt && actTime <= clearedAt) continue;
      if (latestAct && deletedActivityIds.has(latestAct.id)) continue;

      const actId = latestAct?.id || inc.id;
      const isRead = readActivityIds.has(actId) || (existing.find(n => (n.incidentId === inc.id || n.id === inc.id) && (n.activityId === actId || n.id === actId))?.read ?? false);

      let title = 'Emergency Update';
      let message = latestAct?.description || latestAct?.title || 'Incident update received.';
      let statusKey = inc.status || 'PENDING';
      let dept = inc.assignedDepartment;

      if (latestAct) {
        if (latestAct.type === 'ASSIGNED') {
          dept = latestAct.title?.replace(/^Assigned to\s+/i, '').trim() || inc.assignedDepartment;
          title = `Unit Assigned: ${dept}`;
          message = `${dept} has been assigned to respond to your report.`;
        } else if (latestAct.type === 'STATUS_CHANGE') {
          const statusMatch = latestAct.title?.replace(/^Status changed to\s+/i, '').trim().toUpperCase();
          statusKey = statusMatch || inc.status;
          title = `Status Update: ${statusKey}`;
          if (statusKey === 'DISPATCHED') {
            title = dept ? `🚨 ${dept} Dispatched!` : '🚨 Responders Dispatched!';
          } else if (statusKey === 'RESOLVED') {
            title = 'Emergency Resolved';
          } else if (statusKey === 'REVIEWING') {
            title = 'Report Under Review';
          } else if (statusKey === 'REJECTED') {
            title = 'Report Not Approved';
          }
        } else if (latestAct.type === 'REPORTED') {
          title = 'Report Received';
          message = 'Your report was received by the command center.';
          statusKey = 'PENDING';
        }
      } else {
        if (statusKey === 'DISPATCHED') {
          title = dept ? `🚨 ${dept} Dispatched!` : '🚨 Responders Dispatched!';
        } else if (statusKey === 'RESOLVED') {
          title = 'Emergency Resolved';
        } else if (statusKey === 'REVIEWING') {
          title = 'Report Under Review';
        } else {
          title = 'Report Received';
          message = 'Your report was received by the command center.';
        }
      }

      const timeStr = (latestAct?.createdAt || inc.createdAt)
        ? new Date(latestAct?.createdAt || inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      newNotifs.push({
        id: actId,
        incidentId: inc.id,
        activityId: latestAct?.id,
        type: cleanType,
        title,
        message,
        status: statusKey,
        department: dept,
        time: timeStr,
        read: isRead,
        timestamp: actTime,
      });
    }

    // Deduplicate: Guarantee exactly ONE card per incident (the latest one)
    const incidentMap = new Map<string, StoredNotif>();

    // Add existing (which may include non-incident system notices)
    for (const item of existing) {
      const key = item.incidentId || item.id;
      if (!deletedActivityIds.has(key)) {
        incidentMap.set(key, item);
      }
    }

    // Overlay with newly fetched latest incident records
    for (const item of newNotifs) {
      const key = item.incidentId || item.id;
      const existingItem = incidentMap.get(key);
      if (!existingItem || (item.timestamp || 0) >= (existingItem.timestamp || 0)) {
        if (existingItem && existingItem.activityId === item.activityId) {
          item.read = existingItem.read;
        }
        incidentMap.set(key, item);
      }
    }

    const merged = Array.from(incidentMap.values())
      .filter(n => !deletedActivityIds.has(n.activityId || '') && !deletedActivityIds.has(n.id) && !deletedActivityIds.has(n.incidentId || ''))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 50);

    saveNotifications(merged);
    return merged;
  } catch (err) {
    console.warn('[MobileNotifications] Backend sync error:', err);
    return getStoredNotifications();
  }
}

function formatRelativeTime(timestamp?: number, fallbackTime?: string): string {
  if (!timestamp) return fallbackTime || '';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return fallbackTime || '';
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  DISPATCHED: { label: 'Responders dispatched to your location', color: '#2563EB', bg: '#EFF6FF', border: '#2563EB', icon: Truck },
  RESOLVED:   { label: 'Your report has been resolved',          color: '#16A34A', bg: '#F0FDF4', border: '#16A34A', icon: ShieldCheck },
  REJECTED:   { label: 'Report was not approved',                color: '#DC2626', bg: '#FEF2F2', border: '#DC2626', icon: XCircle },
  REVIEWING:  { label: 'Under review by MDRRMO',                 color: '#D97706', bg: '#FFFBEB', border: '#D97706', icon: Clock },
  PENDING:    { label: 'Awaiting dispatcher review',             color: '#64748B', bg: '#F8FAFC', border: '#CBD5E1', icon: AlertCircle },
};

export default function MobileNotifications() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetIncidentId = searchParams.get('incidentId');
  const [notifications, setNotifications] = useState<StoredNotif[]>(() => getStoredNotifications());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAlerts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const synced = await syncNotificationsWithBackend();
      setNotifications(synced);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // 1. Initial backend sync & realtime event listeners
  useEffect(() => {
    refreshAlerts();

    const handleUpdate = () => {
      setNotifications(getStoredNotifications());
    };
    window.addEventListener('srq-notifications-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // 2. Active short polling while on Alerts & Updates tab (every 5 seconds)
    const pollTimer = setInterval(() => {
      syncNotificationsWithBackend().then(synced => {
        setNotifications(synced);
      });
    }, 5000);

    // 3. Resume sync when app visibility returns
    const handleVisibility = () => {
      if (!document.hidden) {
        syncNotificationsWithBackend().then(synced => {
          setNotifications(synced);
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('srq-notifications-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshAlerts]);

  // Pull-to-refresh states & refs (matching History tab)
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const refreshingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePullDistance = (dist: number) => {
    pullDistanceRef.current = dist;
    setPullDistance(dist);
  };

  useEffect(() => {
    refreshingRef.current = refreshing;
  }, [refreshing]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || refreshingRef.current) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      if (deltaY > 0 && window.scrollY === 0) {
        const pull = Math.min(100, deltaY * 0.4);
        updatePullDistance(pull);
        if (pull > 5 && e.cancelable) {
          e.preventDefault();
        }
      }
    };

    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (window.scrollY !== 0 || refreshingRef.current) return;
    startYRef.current = e.touches[0].clientY;
    isPullingRef.current = true;
    setIsPulling(true);
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;
    setIsPulling(false);

    if (pullDistanceRef.current > 60) {
      setRefreshing(true);
      updatePullDistance(50);
      await refreshAlerts();
      setRefreshing(false);
    }
    updatePullDistance(0);
  };

  const handleClearAll = () => {
    clearNotifications();
    setNotifications([]);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    const ids = notifications.map(n => n.activityId || n.id);
    markActivitiesAsRead(ids);
    saveNotifications(updated);
    setNotifications(updated);
  };

  const handleMarkRead = (id: string) => {
    const target = notifications.find(n => n.id === id);
    if (target) {
      markActivitiesAsRead([target.activityId || target.id]);
    }
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
    setNotifications(updated);
  };

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = notifications.find(n => n.id === id);
    if (target) {
      addDeletedActivityIds([target.activityId || target.id, target.id]);
    }
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
    setNotifications(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="mobile-shell"
      style={{ background: '#F8FAFC' }}
    >
      <div className="mobile-page" style={{ flex: 1, paddingBottom: 85 }}>
        {/* Header (flush top, matching Emergency Alert header gradient & safe-area sizing) */}
        <div className="mobile-header-bar" style={{
          background: 'linear-gradient(160deg, #0F1F38 0%, #1D4ED8 60%, #2563EB 100%)',
          padding: 'max(env(safe-area-inset-top, 0px) + 16px, 24px) 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
          boxShadow: '0 6px 24px rgba(15, 31, 56, 0.35)',
          borderRadius: '0 0 24px 24px',
          marginBottom: 18,
        }}>
          {/* Pull-to-refresh Indicator - matching History tab */}
          {(pullDistance > 0 || refreshing) && (
            <div style={{
              height: refreshing ? 36 : Math.min(pullDistance, 45),
              opacity: pullDistance > 0 || refreshing ? 1 : 0,
              transition: isPulling ? 'none' : 'height 0.2s ease, opacity 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.95)',
              fontSize: 12,
              fontWeight: 700,
              gap: 8,
              marginBottom: 8,
            }}>
              <RefreshCw
                size={14}
                className={refreshing ? "spin" : ""}
                style={{
                  transform: refreshing ? undefined : `rotate(${pullDistance * 3}deg)`,
                  transition: refreshing ? undefined : 'transform 0.1s linear'
                }}
              />
              <span>{refreshing ? 'Syncing alerts...' : pullDistance > 60 ? 'Release to refresh' : 'Pull down to refresh'}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/mobile')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                background: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                padding: 0,
              }}
              aria-label="Back"
            >
              <ChevronLeft size={20} />
            </Button>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'white', letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', gap: 8 }}>
                Alerts & Updates
                {unreadCount > 0 && (
                  <Badge style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 800,
                    minWidth: 18, height: 18, borderRadius: 9, padding: '0 4px',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </h1>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.75)', margin: '2px 0 0' }}>Real-time notifications on your reports</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px' }}>

        {/* Action Bar (Mark all read & Clear all — static Refresh button removed per specification) */}
        {notifications.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
            padding: '0 2px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: unreadCount > 0 ? '#EF4444' : '#10B981',
                boxShadow: unreadCount > 0 ? '0 0 6px rgba(239,68,68,0.5)' : 'none',
                display: 'inline-block',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: unreadCount > 0 ? '#1E293B' : '#64748B', whiteSpace: 'nowrap' }}>
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllRead}
                  style={{
                    background: 'white', border: '1px solid #E2E8F0', borderRadius: 8,
                    padding: '5px 11px', fontSize: 11.5, fontWeight: 700, color: '#2563EB',
                    display: 'flex', alignItems: 'center', gap: 4, height: 'auto',
                  }}
                >
                  <CheckCheck size={13} /> Read all
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearAll}
                style={{
                  background: 'white', border: '1px solid #E2E8F0', borderRadius: 8,
                  padding: '5px 10px', fontSize: 11.5, fontWeight: 700, color: '#94A3B8',
                  display: 'flex', alignItems: 'center', gap: 4, height: 'auto',
                }}
              >
                <Trash2 size={13} /> Clear
              </Button>
            </div>
          </div>
        )}

        {notifications.length === 0 ? (
          /* Empty state */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '60px 24px', textAlign: 'center',
            background: 'white', borderRadius: 20, border: '1px solid #E2E8F0', marginTop: 10,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: '#EFF6FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14, overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.15)',
            }}>
              <img src="/logo.jpg" alt="SendResQPls" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
              No notifications yet
            </div>
            <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, maxWidth: 260, marginBottom: 18 }}>
              You will receive alerts here whenever your emergency reports are reviewed, dispatched, or reassigned.
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="outline"
                onClick={refreshAlerts}
                disabled={isRefreshing}
                style={{
                  padding: '10px 18px', borderRadius: 12,
                  background: 'white', border: '1.5px solid #2563EB',
                  fontSize: 13, fontWeight: 700, color: '#2563EB',
                  display: 'flex', alignItems: 'center', gap: 6,
                  minHeight: 44,
                }}
              >
                <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} /> Check for Updates
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/mobile/history')}
                style={{
                  padding: '10px 18px', borderRadius: 12,
                  background: '#F1F5F9', border: '1px solid #E2E8F0',
                  fontSize: 13, fontWeight: 700, color: '#0F172A',
                  display: 'flex', alignItems: 'center', gap: 6,
                  minHeight: 44,
                }}
              >
                View Report History <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map((n, i) => {
              const meta = STATUS_META[n.status] || STATUS_META.PENDING;
              const deptTheme = n.department ? getDepartmentTheme(n.department) : null;
              const Icon = deptTheme?.icon || meta.icon;
              const iconColor = deptTheme?.color || meta.color;
              const iconBg = deptTheme?.bgLight || meta.bg;
              const iconBorder = deptTheme?.borderLight || `${meta.color}25`;

              const cleanType = cleanIncidentType(n.type) || 'Emergency Update';
              const statusText = n.title || (
                n.department && n.status === 'DISPATCHED'
                  ? `${deptTheme?.name || n.department} Dispatched`
                  : (n.department && (n.status === 'PENDING' || n.status === 'REVIEWING')
                      ? `Unit Assigned: ${deptTheme?.shortName || n.department}`
                      : meta.label)
              );

              const targetId = n.incidentId || n.id;
              const isTargeted = Boolean(targetIncidentId && (n.id === targetIncidentId || n.incidentId === targetIncidentId));
              const isUnread = !n.read;

              return (
                <div
                  key={`${n.id}-${i}`}
                  onClick={() => { handleMarkRead(n.id); navigate(`/mobile/history?incidentId=${targetId}`); }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '14px 16px',
                    borderRadius: 16,
                    background: isUnread ? '#F0F7FF' : 'white',
                    boxShadow: isUnread
                      ? '0 4px 16px rgba(37, 99, 235, 0.08), 0 1px 3px rgba(15, 23, 42, 0.03)'
                      : '0 1px 4px rgba(15, 23, 42, 0.04)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.18s ease',
                    border: isTargeted
                      ? '2px solid #2563EB'
                      : isUnread
                      ? '1.5px solid #BFDBFE'
                      : '1px solid #E2E8F0',
                  }}
                >
                  {/* Icon square with tinted bg or SendResQPls logo */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: iconBg, flexShrink: 0,
                    border: `1.5px solid ${iconBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {deptTheme ? (
                      <Icon size={20} color={iconColor} style={{ width: 20, height: 20 }} />
                    ) : (cleanType.toLowerCase().includes('unrecognized') || cleanType.toLowerCase().includes('unknown') || Boolean(n.title && n.title.toLowerCase().includes('unrecognized'))) ? (
                      <HelpCircle size={22} color="#D97706" />
                    ) : (
                      <Icon size={20} color={meta.color} />
                    )}
                  </div>

                  {/* Text block */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.1px' }}>
                        {cleanType}
                      </div>

                      {/* Right header: Static solid red NEW pill + Relative time */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                        {isUnread && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4.5,
                            fontSize: 9.5,
                            fontWeight: 800,
                            color: '#FFFFFF',
                            background: '#EF4444',
                            boxShadow: '0 1px 3px rgba(239, 68, 68, 0.35)',
                            borderRadius: 9999,
                            padding: '2.5px 8px',
                            letterSpacing: '0.04em',
                            lineHeight: 1.2,
                          }}>
                            <span style={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              background: '#FFFFFF',
                              flexShrink: 0,
                            }} />
                            NEW
                          </span>
                        )}
                        <span style={{
                          fontSize: 10.5,
                          color: isUnread ? '#1D4ED8' : '#94A3B8',
                          fontWeight: isUnread ? 700 : 500,
                          whiteSpace: 'nowrap',
                        }}>
                          {formatRelativeTime(n.timestamp, n.time)}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: 12.5, color: iconColor, fontWeight: 700, lineHeight: 1.35 }}>
                      {statusText}
                    </div>

                    {n.message && n.message !== statusText && (
                      <div style={{ fontSize: 11.5, color: '#475569', marginTop: 3, lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                    )}

                    {/* Department pill if assigned */}
                    {deptTheme && (
                      <div style={{ marginTop: 4 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 10, fontWeight: 800, color: deptTheme.color,
                          background: deptTheme.bgLight, border: `1px solid ${deptTheme.borderLight}`,
                          padding: '1px 6px', borderRadius: 6,
                        }}>
                          Unit: {deptTheme.shortName}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      {isUnread ? (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#2563EB',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          Unread alert · Tap to view
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>Viewed</span>
                      )}
                      <button
                        onClick={(e) => handleDeleteOne(e, n.id)}
                        style={{
                          background: 'none', border: 'none', color: '#CBD5E1',
                          cursor: 'pointer', padding: 2, display: 'flex',
                        }}
                        aria-label="Delete notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
