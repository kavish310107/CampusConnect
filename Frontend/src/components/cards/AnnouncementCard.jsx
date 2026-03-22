import { FiBookmark, FiExternalLink, FiCalendar, FiTag } from 'react-icons/fi';

export default function AnnouncementCard({ item, onSave, saved }){
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="announcement-card card">
      <div className="card-header">
        <div className="card-meta">
          <span className="card-type">
            <FiTag />
            {item.type || 'Announcement'}
          </span>
          {item.club_name && item.type === 'Club' && (
            <span className="card-club">{item.club_name}</span>
          )}
          {item.department && (
            <span className="card-department">{item.department}</span>
          )}
        </div>
        {item.created_at && (
          <span className="card-date">
            <FiCalendar />
            {formatDate(item.created_at)}
          </span>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title">{item.title}</h3>
        <p className="card-description">
          {item.description}
        </p>
      </div>

      <div className="card-footer">
        {onSave && (
          <button 
            className={`btn ${saved ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            onClick={() => onSave(item)}
          >
            <FiBookmark />
            {saved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}
