import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaBell, FaUser } from 'react-icons/fa';
import { FaCirclePlus } from 'react-icons/fa6';
import { RiChatHistoryFill } from 'react-icons/ri';
import { getStoredNotifications } from '../pages/mobile/MobileNotifications';

const tabs = [
  { to: '/mobile',               icon: FaHome,            label: 'Home',    end: true,  isBell: false },
  { to: '/mobile/report',        icon: FaCirclePlus,      label: 'Report',  end: false, isBell: false },
  { to: '/mobile/notifications', icon: FaBell,            label: 'Alerts',  end: false, isBell: true  },
  { to: '/mobile/history',       icon: RiChatHistoryFill, label: 'History', end: false, isBell: false },
  { to: '/mobile/profile',       icon: FaUser,            label: 'Profile', end: false, isBell: false },
];

export default function BottomNav() {
  const unread = getStoredNotifications().filter(n => !n.read).length;
  const location = useLocation();
  const [optimisticTab, setOptimisticTab] = useState<string | null>(null);

  // Clear optimistic tab when route settles
  useEffect(() => {
    setOptimisticTab(null);
  }, [location.pathname]);

  const isTabActive = (to: string, end: boolean) => {
    if (optimisticTab !== null) {
      return optimisticTab === to;
    }
    if (end) {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

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
          display: grid !important;
          grid-template-columns: repeat(5, 1fr) !important;
          align-items: stretch !important;
          background: #FFFFFF !important;
          border-top: 1px solid #E2E8F0 !important;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05) !important;
          z-index: 99999 !important;
          padding: 0 0 env(safe-area-inset-bottom, 0px) !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          touch-action: manipulation !important;
        }

        /* ── Individual Tab ── */
        .bn-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 8px;
          text-decoration: none;
          font-size: 9.5px;
          font-weight: 600;
          color: #94A3B8;
          height: 68px;
          transition: none !important; /* Instant 0ms response */
          letter-spacing: 0.04em;
          text-transform: uppercase;
          position: relative;
          cursor: pointer;
          z-index: 2;
          box-sizing: border-box;
          touch-action: manipulation !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        /* Top accent line directly inside each tab — lights up instantly */
        .bn-top-bar {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 3px;
          border-radius: 0 0 3px 3px;
          background: linear-gradient(90deg, #3B82F6, #2563EB);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.45);
          opacity: 0;
          transition: none !important; /* Instant 0ms response */
          pointer-events: none;
        }

        .bn-tab:active .bn-top-bar,
        .bn-tab.active .bn-top-bar {
          opacity: 1 !important;
        }

        /* Glowing soft squircle pill directly behind the icon — lights up instantly */
        .bn-pill {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 44px;
          height: 34px;
          border-radius: 12px;
          background: rgba(37, 99, 235, 0.12);
          border: 1px solid rgba(37, 99, 235, 0.18);
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.12);
          opacity: 0;
          transition: none !important; /* Instant 0ms response */
          pointer-events: none;
          z-index: 1;
        }

        .bn-tab:active .bn-pill,
        .bn-tab.active .bn-pill {
          opacity: 1 !important;
        }

        .bn-label {
          font-size: 9.5px;
          font-weight: 600;
          margin-top: 4px;
          line-height: 1;
          letter-spacing: 0.04em;
          position: relative;
          z-index: 2;
          transition: none !important;
        }

        /* Active & Pressed state — immediate blue color */
        .bn-tab:active,
        .bn-tab.active {
          color: #2563EB !important;
          font-weight: 800 !important;
        }

        /* Icon wrapper */
        .bn-icon-wrap {
          width: 44px;
          height: 34px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.06s ease;
          position: relative;
          z-index: 2;
          box-sizing: border-box;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
        }

        .bn-tab:active .bn-icon-wrap,
        .bn-tab.active .bn-icon-wrap {
          transform: scale(1.06);
        }

        /* Notification badge */
        .bn-badge {
          position: absolute;
          top: -2px;
          right: 2px;
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
          .bn-tab,
          .bn-icon-wrap,
          .bn-badge,
          .bn-top-bar,
          .bn-pill {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      {tabs.map(({ to, icon: Icon, label, end, isBell }) => {
        const active = isTabActive(to, end);
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={() => setOptimisticTab(to)}
            className={`bn-tab${active ? ' active' : ''}`}
          >
            {/* Top accent glow bar — lights up instantly when selected/pressed */}
            <div className="bn-top-bar" />

            {/* Under-icon glowing soft pill — lights up instantly when selected/pressed */}
            <div className="bn-pill" />

            {/* Icon with optional badge */}
            <div className="bn-icon-wrap" draggable={false}>
              <Icon size={20} />
              {isBell && unread > 0 && (
                <span className="bn-badge">{unread > 9 ? '9+' : unread}</span>
              )}
            </div>

            {/* Label */}
            <span className="bn-label">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
