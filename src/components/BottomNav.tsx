import { NavLink } from 'react-router-dom';
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

export default function BottomNav() {
  const unread = getStoredNotifications().filter(n => !n.read).length;

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
          background: linear-gradient(160deg, #0F1F38 0%, #1D4ED8 60%, #2563EB 100%) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-top: 1px solid rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 -6px 24px rgba(15, 31, 56, 0.45) !important;
          z-index: 99999 !important;
          padding: 0 4px env(safe-area-inset-bottom, 0px) !important;
          box-sizing: border-box !important;
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
          color: rgba(255, 255, 255, 0.65);
          padding: 6px 0;
          min-width: 60px;
          min-height: 56px;
          border-radius: 16px;
          transition: color 0.2s ease;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          position: relative;
          flex: 1;
          cursor: pointer;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        .bn-tab:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        /* Active state — crisp white with bold weight */
        .bn-tab.active {
          color: #FFFFFF;
          font-weight: 800;
        }

        /* Report tab active — prominent soft red */
        .bn-report-tab.active {
          color: #FECACA;
        }

        /* Icon wrapper — subtle luminous glass background on active */
        .bn-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
        }
        .bn-tab.active .bn-icon-wrap {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25);
          transform: translateY(-2px) scale(1.08);
          animation: bnTabActiveBounce 0.36s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .bn-report-tab.active .bn-icon-wrap {
          background: rgba(239, 68, 68, 0.35);
          box-shadow: 0 2px 10px rgba(220, 38, 38, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        @keyframes bnTabActiveBounce {
          0% {
            transform: scale(0.85);
          }
          60% {
            transform: scale(1.15) translateY(-3px);
          }
          100% {
            transform: scale(1.08) translateY(-2px);
          }
        }

        /* Press / tap state */
        .bn-tab:active .bn-icon-wrap {
          transform: scale(0.88);
        }

        /* Notification badge */
        .bn-badge {
          position: absolute;
          top: -5px;
          right: -5px;
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
          border: 2px solid #0F1F38;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
          animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes badgePop {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }
      `}</style>

      {tabs.map(({ to, icon: Icon, label, end, isReport, isBell }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          draggable={false}
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
