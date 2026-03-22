import { useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Sidebar from '../components/common/Sidebar';
import { FiMenu } from 'react-icons/fi';

export default function DashboardLayout({ children }){
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-shell">
      <Header />
      <div className="app-layout">
        {/* Mobile Sidebar Toggle */}
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FiMenu />
        </button>
        
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
             onClick={() => setSidebarOpen(false)} />
        <main className="main-content">
          <div className="container">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
