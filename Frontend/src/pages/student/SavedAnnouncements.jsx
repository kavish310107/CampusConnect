import DashboardLayout from '../../layouts/DashboardLayout';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { listSavedAnnouncements, saveItem } from '../../api/saved';
import AnnouncementCard from '../../components/cards/AnnouncementCard';
import { FiBookmark, FiInbox, FiSearch, FiFilter } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function SavedAnnouncements(){
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    (async () => {
      try{
        setItems(await listSavedAnnouncements(token));
      } catch(err){ setError('Failed to load saved announcements'); }
      finally{ setLoading(false); }
    })();
  }, [token]);

  const handleUnsave = async (item) => {
    try {
      const result = await saveItem(token, item.id, 'announcement');
      if (result === false) {
        setItems(prev => prev.filter(a => a.id !== item.id));
      }
    } catch (err) {
      console.error('Failed to unsave announcement:', err);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const uniqueTypes = [...new Set(items.map(item => item.type).filter(Boolean))];

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Saved Announcements</h1>
          <p className="page-subtitle">
            Your personal collection of important announcements and updates
          </p>
        </div>
        <div className="page-actions">
          <div className="text-muted">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
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
              placeholder="Search saved announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <div className="filter-dropdown">
            <FiFilter />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="select"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
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
        <div className="content-section">
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                {searchTerm || filterType !== 'all' ? <FiSearch /> : <FiInbox />}
              </div>
              <h3 className="empty-state-title">
                {searchTerm || filterType !== 'all' 
                  ? 'No matching announcements found' 
                  : 'No saved announcements yet'
                }
              </h3>
              <p className="empty-state-description">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  : 'Start saving announcements that interest you to build your personal collection.'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <div className="empty-state-actions">
                  {/* <button 
                    
                    onClick={() => window.history.back()}
                  >
                    
                  </button> */}
                  <Link to='/dashboard/student' className="btn btn-primary">Browse Announcements</Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-auto">
              {filteredItems.map(item => (
                <AnnouncementCard 
                  key={item.id} 
                  item={item} 
                  onSave={handleUnsave}
                  saved={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
