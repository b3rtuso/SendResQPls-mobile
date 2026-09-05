import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaHome, FaBell, FaUser } from 'react-icons/fa';
import { FaCirclePlus } from 'react-icons/fa6';
import { RiChatHistoryFill } from 'react-icons/ri';
import { getStoredNotifications } from '../pages/mobile/MobileNotifications';

const tabs = [
  { to: '/mobile',               icon: FaHome,            label: 'Home',    end: true,  isReport: false, isBell: false },
  { to: '/mobile/report',        icon: FaCirclePlus,      label: 'Report',  end: false, isReport: true,  isBell: false },
  { to: '/mobile/notifications', icon: FaBell,            label: 'Alerts',  end: false, isReport: false, isBell: true  },
  { to: '/mobile/history',       icon: RiChatHistoryFill, label: 'History', end: false, isReport: false, isBell: false },
  { to: '/mobile/profile',       icon: FaUser,            label: 'Profile', end: false, isReport: false, isBell: false },
];

let lastActiveTab = -1;

export default function BottomNav() {
  const location = useLocation();
  const unread = getStoredNotifications().filter(n => !n.read).length;

  const getActiveTab = () => {
    const p = location.pathname.replace(/\/$/, '');
    if (p === '/mobile' || p === '') return 0;
    if (p.startsWith('/mobile/report')) return 1;
    if (p.startsWith('/mobile/notifications')) return 2;
    if (p.startsWith('/mobile/history')) return 3;
    if (p.startsWith('/mobile/profile')) return 4;
    return -1;
  };

  const activeTab = getActiveTab();
  const [sliderIndex, setSliderIndex] = useState(() => (lastActiveTab !== -1 ? lastActiveTab : (activeTab !== -1 ? activeTab : 0)));

  useEffect(() => {
    if (activeTab === -1) return;
    if (sliderIndex !== activeTab) {
      const raf = requestAnimationFrame(() => {
        setSliderIndex(activeTab);
      });
      lastActiveTab = activeTab;
      return () => cancelAnimationFrame(raf);
    }
    lastActiveTab = activeTab;
  }, [activeTab, sliderIndex]);

  return (
    <nav className="bottom-nav">
      <style>{`
        /* ── Bottom Nav Shell ── */
        .bottom-nav {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          margin: 0 auto !important;
          width: 100% !important;
          max-width: 480px !important;
          height: 68px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-around !important;
          background: #FFFFFF !important;
          border-top: 1px solid #E2E8F0 !important;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05) !important;
          z-index: 99999 !important;
          padding: 0 4px env(safe-area-inset-bottom, 0px) !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }

        /* ── Individual Tab ── */
        .bn-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          text-decoration: none;
          font-size: 9.5px;
          font-weight: 600;
          color: #94A3B8;
          padding: 6px 0;
          min-width: 60px;
          min-height: 56px;
          border-radius: 16px;
          transition: color 0.2s ease, transform 0.15s ease;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          position: relative;
          flex: 1;
          cursor: pointer;
          z-index: 2;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        /* Active state — default blue */
        .bn-tab.active {
          color: #2563EB;
          font-weight: 800;
        }

        /* Report tab active — red */
        .bn-report-tab.active {
          color: #DC2626;
        }

        /* Icon wrapper */
        .bn-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease;
          position: relative;
          z-index: 2;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
        }

        .bn-tab.active .bn-icon-wrap {
          transform: translateY(-2px) scale(1.1);
          animation: bnTabActiveBounce 0.36s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes bnTabActiveBounce {
          0% {
            transform: scale(0.92);
          }
          50% {
            transform: scale(1.18) translateY(-3px);
          }
          100% {
            transform: scale(1.1) translateY(-2px);
          }
        }

        /* Press / tap state */
        .bn-tab:active .bn-icon-wrap {
          transform: scale(0.86);
          transition: transform 0.1s ease;
        }

        /* Notification badge */
        .bn-badge {
          position: absolute;
          top: -4px;
          right: -6px;
          min-width: 17px;
          height: 17px;
          border-radius: 9px;
          background: #EF4444;
          color: white;
          font-size: 9px;
          font-weight: 800;
          line-height: 17px;
          text-align: center;
          padding: 0 4px;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.45);
          animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          z-index: 3;
        }

        @keyframes badgePop {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .bn-sliding-track,
          .bn-tab,
          .bn-icon-wrap,
          .bn-badge {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      {/* ── Sliding Active Indicator Pill Track ── */}
      {activeTab !== -1 && (
        <div
          className="bn-sliding-track"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '20%',
            pointerEvents: 'none',
            transform: `translateX(${sliderIndex * 100}%)`,
            transition: 'transform 0.34s cubic-bezier(0.34, 1.45, 0.64, 1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            zIndex: 1,
          }}
        >
          {/* Top accent glow bar */}
          <div
            style={{
              width: 32,
              height: 3,
              borderRadius: '0 0 3px 3px',
              background: sliderIndex === 1
                ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                : 'linear-gradient(90deg, #3B82F6, #2563EB)',
              boxShadow: sliderIndex === 1
                ? '0 2px 8px rgba(220, 38, 38, 0.5)'
                : '0 2px 8px rgba(37, 99, 235, 0.45)',
              transition: 'background 0.25s ease, box-shadow 0.25s ease',
            }}
          />

          {/* Under-icon soft squircle pill */}
          <div
            style={{
              marginTop: 6,
              width: 44,
              height: 34,
              borderRadius: 12,
              background: sliderIndex === 1
                ? 'rgba(220, 38, 38, 0.12)'
                : 'rgba(37, 99, 235, 0.12)',
              boxShadow: sliderIndex === 1
                ? 'inset 0 0 0 1px rgba(220, 38, 38, 0.1)'
                : 'inset 0 0 0 1px rgba(37, 99, 235, 0.1)',
              transition: 'background 0.25s ease, box-shadow 0.25s ease',
            }}
          />
        </div>
      )}

      {tabs.map(({ to, icon: Icon, label, end, isReport, isBell }, idx) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          draggable={false}
          onClick={() => {
            lastActiveTab = idx;
            setSliderIndex(idx);
          }}
          onContextMenu={(e) => e.preventDefault()}
          className={({ isActive }) =>
            `bn-tab${isReport ? ' bn-report-tab' : ''}${isActive ? ' active' : ''}`
          }
        >
          {/* Icon with optional badge */}
          <div className="bn-icon-wrap" draggable={false}>
            <Icon size={20} />
            {isBell && unread > 0 && (
              <span className="bn-badge">{unread > 9 ? '9+' : unread}</span>
            )}
          </div>

          {/* Label */}
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
