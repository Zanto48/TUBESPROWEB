import React, { useState } from 'react';
import { useWarLok } from '../../context/WarLokContext';
import { ShoppingBag, Wallet, Plus } from 'lucide-react';
import { formatRupiah } from '../../utils/geo';
import { TopUpModal } from './TopUpModal';

interface HeaderProps {
  activeTab: 'catalog' | 'compare' | 'reservations' | 'merchant' | 'admin';
  setActiveTab: (tab: 'catalog' | 'compare' | 'reservations' | 'merchant' | 'admin') => void;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenCart }) => {
  const { currentUser, cart, reservations, walletBalance } = useWarLok();
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);

  // Pending reservations for customer badge or merchant incoming orders
  const activeReservationsCount = reservations.filter(
    r => r.status === 'pending' || r.status === 'accepted'
  ).length;

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Wordmark Brand */}
        <button
          onClick={() => setActiveTab('catalog')}
          className="flex items-center gap-2 text-left cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-emerald-800 transition-colors">
            W
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap">
            WarLok
          </span>
        </button>

        {/* Zone 2: Navigation Links (single line, clean text) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'catalog'
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800 pb-0.5'
                : 'hover:text-stone-900'
            }`}
          >
            Jelajah Warung
          </button>
          
          <button
            onClick={() => setActiveTab('compare')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'compare'
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800 pb-0.5'
                : 'hover:text-stone-900'
            }`}
          >
            Bandingkan Harga
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reservations'
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800 pb-0.5'
                : 'hover:text-stone-900'
            }`}
          >
            <span>Reservasi Saya</span>
            {activeReservationsCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono font-medium">
                {activeReservationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('merchant')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'merchant'
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800 pb-0.5'
                : 'hover:text-stone-900'
            }`}
          >
            Portal Warung
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'admin'
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800 pb-0.5'
                : 'hover:text-stone-900'
            }`}
          >
            Super Admin
          </button>
        </nav>

        {/* Zone 3: Primary Actions (WarLok Pay Currency & Cart Drawer) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* WarLok Pay Currency Pill & Top-Up Trigger */}
          <button
            onClick={() => setIsTopUpOpen(true)}
            title="Klik untuk Top-Up Saldo WarLok Pay (Presentasi UI)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Wallet className="w-3 h-3" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-emerald-700 font-bold tracking-wider uppercase block -mb-0.5">
                WarLok Pay
              </span>
              <span className="text-xs font-mono font-extrabold text-stone-900">
                {formatRupiah(walletBalance)}
              </span>
            </div>
            <span className="text-xs font-mono font-extrabold text-stone-900 sm:hidden">
              {formatRupiah(walletBalance)}
            </span>
            <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center ml-0.5 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Plus className="w-3 h-3" />
            </span>
          </button>

          <button
            onClick={onOpenCart}
            aria-label="Keranjang Reservasi"
            className="relative px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Keranjang Ambil</span>
            {totalCartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-bold text-xs flex items-center justify-center font-mono">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Modal Top-Up WarLok Pay */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
      />
    </header>
  );
};
