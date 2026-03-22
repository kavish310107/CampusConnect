import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import MegaphoneIcon from '../../components/icons/MegaphoneIcon';
import EventsIcon from '../../components/icons/EventsIcon';
import ClubsIcon from '../../components/icons/ClubsIcon';

export default function Landing(){
  return (
    <PublicLayout>
      <div className="container stack-lg text-center">
        <h1 style={{color:'#4576FF'}}>Welcome to CampusConnect</h1>
        <h3 className="text-muted">This is your digital hub for campus life</h3>
        <div className="card p-lg stack-lg">
          <h3 className="text-md">Discover announcements, join clubs, find events, and connect with your campus community all in one place.</h3>
          <div className="grid grid-3-cols" style={{display:'flex',flexDirection:'row',justifyContent:'space-around',marginBottom:'50px',flexWrap:'wrap',gap:'2rem'}}>
            <div className="stack-sm align-center">
              <MegaphoneIcon width={48} height={48} className="text-primary" />
              <p className="text-bold">Announcements</p>
              <p className="text-sm text-muted">Stay informed</p>
            </div>
            <div className="stack-sm align-center">
              <EventsIcon width={48} height={48} className="text-primary" />
              <p className="text-bold">Events</p>
              <p className="text-sm text-muted">Never miss out</p>
            </div>
            <div className="stack-sm align-center">
              <ClubsIcon width={48} height={48} className="text-primary" />
              <p className="text-bold">Clubs</p>
              <p className="text-sm text-muted">Join communities</p>
            </div>
          </div>
          <div className="cluster-center">
            <Link to="/login" className="btn btn-primary">Sign In to Continue</Link>
            <Link to="/signup" className="btn btn-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
