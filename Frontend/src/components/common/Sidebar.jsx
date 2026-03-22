import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiHome, 
  FiUser, 
  FiUsers, 
  FiBookmark, 
  FiCalendar, 
  FiPlusCircle, 
  FiSettings,
  FiMessageSquare,
  FiTrendingUp,
  FiX
} from 'react-icons/fi';

export default function Sidebar({ isOpen, onClose }){
  const { user } = useAuth();
  const { pathname } = useLocation();

  const itemsByRole = {
    student: [
      { to:'/dashboard/student', label:'Overview', icon: FiHome },
      { to:'/dashboard/student/profile', label:'Profile', icon: FiUser },
      { to:'/dashboard/student/clubs', label:'Clubs', icon: FiUsers },
      { to:'/dashboard/student/saved/announcements', label:'Saved Announcements', icon: FiBookmark },
      { to:'/dashboard/student/saved/events', label:'Saved Events', icon: FiCalendar },
    ],
    faculty: [
      { to:'/dashboard/faculty', label:'Overview', icon: FiHome },
      { to:'/dashboard/faculty/profile', label:'Profile', icon: FiUser },
      { to:'/dashboard/faculty/announcements/create', label:'Create Announcement', icon: FiMessageSquare },
      { to:'/dashboard/faculty/events/create', label:'Create Event', icon: FiCalendar },
      { to:'/dashboard/faculty/saved/announcements', label:'Saved Announcements', icon: FiBookmark },
      { to:'/dashboard/faculty/saved/events', label:'Saved Events', icon: FiCalendar },
    ],
    admin: [
      { to:'/dashboard/admin', label:'Overview', icon: FiHome },
      { to:'/dashboard/admin/profile', label:'Profile', icon: FiUser },
      { to:'/dashboard/admin/announcements/create', label:'Create Announcement', icon: FiMessageSquare },
      { to:'/dashboard/admin/events/create', label:'Create Event', icon: FiCalendar },
      { to:'/dashboard/admin/clubs/create', label:'Create Club', icon: FiPlusCircle },
      { to:'/dashboard/admin/requests', label:'Join Requests', icon: FiUsers },
      { to:'/dashboard/admin/members', label:'Club Members', icon: FiTrendingUp },
    ],
  };

  const items = itemsByRole[user?.role] || [];

  const isActive = (path) => {
    if (path === pathname) return true;
    // For overview pages, also match exact path
    if (path.includes('/dashboard/') && path === pathname) return true;
    return false;
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            <FiUser />
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role-badge">{user?.role}</div>
          </div>
        </div>
        <button 
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <FiX />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Main Menu</div>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-item ${active ? 'nav-item-active' : ''}`}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {active && <div className="nav-indicator" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-help">
          <Link to="/help" className="help-link">
            <FiSettings />
            <span>Help & Support</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
