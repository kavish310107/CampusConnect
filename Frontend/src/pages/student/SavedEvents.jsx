import DashboardLayout from '../../layouts/DashboardLayout';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { listSavedEvents, saveItem } from '../../api/saved';
import EventCard from '../../components/cards/EventCard';
import { FiBookmark, FiInbox, FiSearch, FiFilter, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom'

export default function SavedEvents(){
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    (async () => {
      try{
        setItems(await listSavedEvents(token));
      }
       catch(err){ setError('Failed to load saved events'); }
      finally{ setLoading(false); }
    })();
  }, [token]);

  const handleUnsave = async (item) => {
    try {
      const result = await saveItem(token, item.id, 'event');
      if (result === false) {
        setItems(prev => prev.filter(e => e.id !== item.id));
      }
    } catch (err) {
      console.error('Failed to unsave event:', err);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const uniqueCategories = [...new Set(items.map(item => item.category).filter(Boolean))];

  const upcomingEvents = items.filter(item => new Date(item.event_date) >= new Date());
  const pastEvents = items.filter(item => new Date(item.event_date) < new Date());

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Saved Events</h1>
          <p className="page-subtitle">
            Your personal collection of campus events and activities
          </p>
        </div>
        <div className="page-actions">
          <div className="text-muted">
            {upcomingEvents.length} upcoming, {pastEvents.length} past
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="content-section">
        <div className="search-filters">
          <div className="search-bar">
            <FiSearch />
            <input
              type="text"
              placeholder="Search saved events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <div className="filter-dropdown">
            <FiFilter />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="select"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
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

      {!loading && !error && (
        <>
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="content-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Upcoming Events</h2>
                  <p className="section-subtitle">
                    Events you've saved that are coming up soon
                  </p>
                </div>
              </div>
              <div className="grid grid-auto">
                {upcomingEvents
                  .filter(item => {
                    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     item.description?.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesFilter = filterCategory === 'all' || item.category === filterCategory;
                    return matchesSearch && matchesFilter;
                  })
                  .map(item => (
                    <EventCard 
                      key={item.id} 
                      item={item} 
                      onSave={handleUnsave}
                      saved={true}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="content-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Past Events</h2>
                  <p className="section-subtitle">
                    Events you've saved that have already taken place
                  </p>
                </div>
              </div>
              <div className="grid grid-auto">
                {pastEvents
                  .filter(item => {
                    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     item.description?.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesFilter = filterCategory === 'all' || item.category === filterCategory;
                    return matchesSearch && matchesFilter;
                  })
                  .map(item => (
                    <EventCard 
                      key={item.id} 
                      item={item} 
                      onSave={handleUnsave}
                      saved={true}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {items.length === 0 && (
            <div className="content-section">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FiCalendar />
                </div>
                <h3 className="empty-state-title">No saved events yet</h3>
                <p className="empty-state-description">
                  Start saving events that interest you to build your personal calendar of campus activities.
                </p>
                <div className="empty-state-actions">
                  <Link to='/dashboard/student' className="btn btn-primary">Browse Events</Link>
                </div>
              </div>
            </div>
          )}

          {/* No Results State */}
          {items.length > 0 && filteredItems.length === 0 && (
            <div className="content-section">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FiSearch />
                </div>
                <h3 className="empty-state-title">No matching events found</h3>
                <p className="empty-state-description">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
