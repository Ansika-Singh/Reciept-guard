import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';
import Footer from './components/Footer.jsx';
import UploadPage from './pages/UploadPage.jsx';
import ReviewPage from './pages/ReviewPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LandingPage from './pages/LandingPage.jsx';

/**
 * App root — manages navigation state and passes page context.
 * Uses simple state-based routing (no router dependency).
 */
export default function App() {
  // Navigation: 'landing' | 'upload' | 'review' | 'dashboard'
  const [currentPage, setCurrentPage] = useState('landing');

  // Data passed between pages
  const [reviewData, setReviewData] = useState(null);

  const navigate = (page, data) => {
    if (data) setReviewData(data);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'upload':
        return <UploadPage onExtracted={(data) => navigate('review', data)} />;
      case 'review':
        return (
          <ReviewPage
            data={reviewData}
            onSaved={() => navigate('dashboard')}
            onBack={() => navigate('upload')}
          />
        );
      case 'dashboard':
        return <DashboardPage onUpload={() => navigate('upload')} onNavigate={navigate} />;
      case 'landing':
      default:
        return <LandingPage onLaunch={() => navigate('dashboard')} />;
    }
  };

  // If on landing page, don't render the App Shell (Sidebar/Header)
  if (currentPage === 'landing') {
    return <LandingPage onLaunch={() => navigate('dashboard')} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <div className="flex flex-1">
        {/* Desktop sidebar — hidden on mobile */}
        <Sidebar currentPage={currentPage} onNavigate={navigate} />

        {/* Main content area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <Footer />

      {/* Mobile bottom nav — hidden on desktop */}
      <BottomNav currentPage={currentPage} onNavigate={navigate} />
    </div>
  );
}
