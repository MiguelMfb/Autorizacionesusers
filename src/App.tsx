import React, { useState, useEffect } from 'react';
import { Menu, Info } from 'lucide-react';
import UserManagementView from './components/UserManagementView';
import UserDetailView from './components/UserDetailView';
import AuthorizationManagementView from './components/AuthorizationManagementView';
import CreateAuthorizationModal from './components/CreateAuthorizationModal';
import Sidebar from './components/Sidebar';
import LatestChangesModal from './components/LatestChangesModal';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('usuarios');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLatestChangesModalOpen, setIsLatestChangesModalOpen] = useState(false);
  const [isCreateAuthModalOpen, setIsCreateAuthModalOpen] = useState(false);

  // Show the latest changes modal when the app loads
  useEffect(() => {
    const hasSeenLatestChanges = localStorage.getItem('hasSeenLatestChanges_2025-06-18');
    if (!hasSeenLatestChanges) {
      setIsLatestChangesModalOpen(true);
    }
  }, []);

  const handleCloseLatestChangesModal = () => {
    setIsLatestChangesModalOpen(false);
    localStorage.setItem('hasSeenLatestChanges_2025-06-18', 'true');
  };

  const handleNavigateToChange = (changeId: string) => {
    // Navigate to the appropriate section based on the change ID
    switch (changeId) {
      case 'user-detail-status':
        // Navigate to user management and open detail of first user
        setActiveView('usuarios');
        // Simulate opening user detail for the first user
        setTimeout(() => {
          setSelectedUserId('1'); // Open detail for first user
          setActiveView('userDetail');
        }, 100);
        break;
      case 'authorization-delete-protection':
        setActiveView('autorizaciones');
        break;
      case 'tariff-dropdown':
      case 'multiple-authorizations':
        // Open the create authorization modal
        setActiveView('autorizaciones');
        setTimeout(() => {
          setIsCreateAuthModalOpen(true);
        }, 100);
        break;
      default:
        break;
    }
  };

  const handleNavigate = (viewKey: string) => {
    setActiveView(viewKey);
    setSelectedUserId(null);
  };

  const handleNavigateToDetail = (userId: string) => {
    setSelectedUserId(userId);
    setActiveView('userDetail');
  };

  const handleNavigateBack = () => {
    setSelectedUserId(null);
    setActiveView('usuarios');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        activeItem={activeView}
        onNavigate={handleNavigate}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-900 shadow-sm px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            {isSidebarCollapsed && (
              <img 
                src="https://web.tnrapp.com.co/assets/image/logo-menu.png"
                alt="Logo"
                className="h-8"
              />
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-white font-semibold">
              COORDITUTELAS
            </div>
            <button
              onClick={() => setIsLatestChangesModalOpen(true)}
              className="px-3 py-1.5 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors flex items-center text-sm font-medium"
            >
              <Info size={16} className="mr-1" />
              Ver cambios
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {activeView === 'usuarios' && (
            <UserManagementView onNavigateToDetail={handleNavigateToDetail} />
          )}
          {activeView === 'userDetail' && selectedUserId && (
            <UserDetailView 
              userId={selectedUserId}
              onNavigateBack={handleNavigateBack}
            />
          )}
          {activeView === 'autorizaciones' && (
            <AuthorizationManagementView />
          )}
        </main>
      </div>

      {/* Latest Changes Modal */}
      <LatestChangesModal
        isOpen={isLatestChangesModalOpen}
        onClose={handleCloseLatestChangesModal}
        onNavigateToChange={handleNavigateToChange}
      />

      {/* Create Authorization Modal */}
      <CreateAuthorizationModal
        isOpen={isCreateAuthModalOpen}
        onClose={() => setIsCreateAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;
