import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { listAnnouncements } from '../../api/announcements';
import { listEvents } from '../../api/events';
import { useEffect, useState } from 'react';
import AnnouncementCard from '../../components/cards/AnnouncementCard';
import EventCard from '../../components/cards/EventCard';
import { listSaved, saveItem } from '../../api/saved';
import { FiBell, FiCalendar, FiBookmark, FiTrendingUp, FiUsers, FiBookOpen } from 'react-icons/fi';

export default function StudentDashboard(){
  const { user, token } = useAuth();
  const [anns, setAnns] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedAnns, setSavedAnns] = useState(new Set());
  const [savedEvents, setSavedEvents] = useState(new Set());

  useEffect(() => {
    (async () => {
      try{
        const [a, e, saved] = await Promise.all([listAnnouncements(), listEvents(), listSaved(token)]);
        setAnns(a); setEvents(e);
        // Build sets for quick lookup
        const sa = new Set();
        const se = new Set();
        (saved || []).forEach(s => {
          if (s.item_type === 'announcement') sa.add(s.item_id);
          else if (s.item_type === 'event') se.add(s.item_id);
        });
        setSavedAnns(sa); setSavedEvents(se);
      } catch(err){ setError('Failed to load data'); }
      finally { setLoading(false); }
    })();
  }, [token]);

  async function onSaveAnnouncement(item){
    try{
      const saved = await saveItem(token, item.id, 'announcement');
      if (saved === true) {
        setSavedAnns(prev => {
          const next = new Set(prev);
          next.add(item.id);
          return next;
        });
      } else if (saved === false) {
        setSavedAnns(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      } else {
        // null/undefined -> API failed or unexpected; do not toggle UI
      }
    } catch(err){ console.log(err); }
  }

  async function onSaveEvent(item){
    try{
      const saved = await saveItem(token, item.id, 'event');
      if (saved === true) {
        setSavedEvents(prev => {
          const next = new Set(prev);
          next.add(item.id);
          return next;
        });
      } else if (saved === false) {
        setSavedEvents(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      } else {
        // null/undefined -> API failed or unexpected; do not toggle UI
      }
    } catch(err){ console.log(err); }
  }

  const stats = [
    {
      title: 'Total Announcements',
      value: anns.length,
      icon: FiBell,
    },
    {
      title: 'Upcoming Events',
      value: events.length,
      icon: FiCalendar,
    },
    {
      title: 'Saved Items',
      value: savedAnns.size + savedEvents.size,
      icon: FiBookmark,
    },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name || 'Student'}!</h1>
          <p className="page-subtitle">
            Here's what's happening on campus today. Stay updated with the latest announcements and events.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon">
                <Icon />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.title}</div>
                <div className={`stat-change ${stat.changeType}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="content-section">
          <div className="skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton skeleton-card"></div>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <div className="content-section">
          <div className="auth-error">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Announcements Section */}
      <div className="content-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Latest Announcements</h2>
            <p className="section-subtitle">
              Stay informed with important updates from your department and faculty
            </p>
          </div>
          <div className="section-actions">
            <button className="btn btn-ghost btn-sm">
              View All
            </button>
          </div>
        </div>
        
        {anns.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiBell />
            </div>
            <h3 className="empty-state-title">No announcements yet</h3>
            <p className="empty-state-description">
              Check back later for the latest announcements from your campus.
            </p>
          </div>
        ) : (
          <div className="grid grid-auto">
            {anns.slice(0, 6).map(a => (
              <AnnouncementCard 
                key={a.id} 
                item={a} 
                onSave={onSaveAnnouncement} 
                saved={savedAnns.has(a.id)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Events Section */}
      <div className="content-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">
              Discover and participate in exciting campus events and activities
            </p>
          </div>
          <div className="section-actions">
            <button className="btn btn-ghost btn-sm">
              View All
            </button>
          </div>
        </div>
        
        {events.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiCalendar />
            </div>
            <h3 className="empty-state-title">No upcoming events</h3>
            <p className="empty-state-description">
              Stay tuned for exciting events and activities on campus.
            </p>
          </div>
        ) : (
          <div className="grid grid-auto">
            {events.slice(0, 6).map(ev => (
              <EventCard 
                key={ev.id} 
                item={ev} 
                onSave={onSaveEvent} 
                saved={savedEvents.has(ev.id)} 
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
