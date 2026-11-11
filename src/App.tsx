import React, { useState } from 'react';
import { WarLokProvider, useWarLok } from './context/WarLokContext';
import { Header } from './components/common/Header';
import { LocationAndRoleBar } from './components/common/LocationAndRoleBar';
import { NotificationToast } from './components/common/NotificationToast';
import { StoreCatalogView } from './components/customer/StoreCatalogView';
import { StoreCatalogModal } from './components/customer/StoreCatalogModal';
import { PriceCompareModal } from './components/customer/PriceCompareModal';
import { ReservationCartDrawer } from './components/customer/ReservationCartDrawer';
import { CustomerReservationsView } from './components/customer/CustomerReservationsView';
import { ReportModal } from './components/customer/ReportModal';
import { XamppGuideModal } from './components/common/XamppGuideModal';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Store, UserRole } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser, switchRole } = useWarLok();
  
  // Navigation tabs: 'catalog' | 'compare' | 'reservations' | 'merchant' | 'admin'
  const [activeTab, setActiveTab] = useState<'catalog' | 'compare' | 'reservations' | 'merchant' | 'admin'>('catalog');
  
  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isXamppModalOpen, setIsXamppModalOpen] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [reportStoreId, setReportStoreId] = useState<string | null>(null);

  const handleRoleSwitched = (role: UserRole) => {
    if (role === 'merchant') setActiveTab('merchant');
    else if (role === 'admin') setActiveTab('admin');
    else setActiveTab('catalog');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      
      {/* 1. Top Navigation Bar (Strict 3-zone contract) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 2. Location & Role Persona Bar */}
      <LocationAndRoleBar 
        onRoleSwitched={handleRoleSwitched} 
        onOpenXamppModal={() => setIsXamppModalOpen(true)}
      />

      {/* 3. Main Views Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'catalog' && (
          <StoreCatalogView
            onSelectStore={(store) => setSelectedStore(store)}
            onGoToCompare={() => setActiveTab('compare')}
          />
        )}

        {activeTab === 'compare' && (
          <PriceCompareModal
            onOpenStoreModal={(store) => setSelectedStore(store)}
            onClose={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'reservations' && (
          <CustomerReservationsView
            onOpenReviewModal={(storeId) => {
              // Open store catalog on reviews tab
              const target = selectedStore || { id: storeId } as Store;
              setSelectedStore(target);
            }}
          />
        )}

        {activeTab === 'merchant' && (
          <MerchantDashboard />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* 4. Footer */}
      <footer className="mt-auto bg-stone-900 text-stone-400 py-8 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              W
            </div>
            <span className="font-bold text-stone-200">WarLok (Warung Lokal)</span>
            <span>· Jaringan Warung Kelontong Mahasiswa Kos</span>
          </div>

          <div className="flex items-center gap-6 text-stone-400">
            <span>Leaflet + OpenStreetMap Engine</span>
            <span>·</span>
            <span>Reservasi & Penguncian Stok</span>
            <span>·</span>
            <button 
              onClick={() => setIsXamppModalOpen(true)}
              className="text-amber-400 hover:underline cursor-pointer font-medium"
            >
              Panduan XAMPP (Apache + MySQL)
            </button>
          </div>

          <p className="text-stone-500">
            &copy; {new Date().getFullYear()} WarLok Indonesia.
          </p>
        </div>
      </footer>

      {/* 5. Modals & Drawers */}
      <StoreCatalogModal
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
        onOpenReport={(storeId) => setReportStoreId(storeId)}
      />

      <ReservationCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onGoToReservations={() => {
          setIsCartOpen(false);
          setActiveTab('reservations');
        }}
      />

      <ReportModal
        storeId={reportStoreId}
        onClose={() => setReportStoreId(null)}
      />

      <XamppGuideModal
        isOpen={isXamppModalOpen}
        onClose={() => setIsXamppModalOpen(false)}
      />

      {/* 6. Toast Notification System */}
      <NotificationToast />

    </div>
  );
};

export default function App() {
  return (
    <WarLokProvider>
      <MainAppContent />
    </WarLokProvider>
  );
}
