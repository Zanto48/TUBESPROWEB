import React from 'react';
import { useWarLok } from '../../context/WarLokContext';
import { MapPin, Navigation, UserCheck, ShieldCheck, Store as StoreIcon, Database } from 'lucide-react';
import { UserRole } from '../../types';

interface LocationAndRoleBarProps {
  onRoleSwitched?: (role: UserRole) => void;
  onOpenXamppModal?: () => void;
}

export const LocationAndRoleBar: React.FC<LocationAndRoleBarProps> = ({ onRoleSwitched, onOpenXamppModal }) => {
  const {
    isBackendConnected,
    refreshFromBackend,
    currentLocation,
    campusList,
    setCustomLocation,
    detectDeviceLocation,
    selectedRadiusKm,
    setSelectedRadiusKm,
    currentUser,
    switchRole
  } = useWarLok();

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    if (onRoleSwitched) onRoleSwitched(role);
  };

  return (
    <div className="bg-stone-100/90 border-b border-stone-200 py-2.5 px-4 sm:px-6 lg:px-8 text-xs text-stone-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Geolocation & Campus Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-stone-800">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Lokasi Kos / Kampus:</span>
          </div>

          {/* Campus Location Dropdown */}
          <select
            value={currentLocation.id}
            onChange={(e) => {
              const found = campusList.find(c => c.id === e.target.value);
              if (found) setCustomLocation(found);
            }}
            className="bg-white border border-stone-300 rounded-md px-2.5 py-1 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-xs"
          >
            {campusList.map(campus => (
              <option key={campus.id} value={campus.id}>
                {campus.name} ({campus.city})
              </option>
            ))}
          </select>

          {/* GPS Auto-detect button */}
          <button
            onClick={() => detectDeviceLocation()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 transition-colors cursor-pointer shadow-xs"
            title="Deteksi posisi GPS perangkat saya"
          >
            <Navigation className="w-3 h-3 text-blue-600" />
            <span className="hidden sm:inline">GPS Akurat</span>
          </button>

          {/* Radius segmented buttons */}
          <div className="flex items-center gap-1 ml-1 sm:ml-3 bg-stone-200/70 p-0.5 rounded-md">
            <span className="text-[11px] text-stone-500 px-1 font-medium hidden sm:inline">Radius:</span>
            {[
              { label: '500m', val: 0.5 },
              { label: '1km', val: 1 },
              { label: '3km', val: 3 },
              { label: '5km', val: 5 },
              { label: 'Semua', val: 0 }
            ].map(r => (
              <button
                key={r.val}
                onClick={() => setSelectedRadiusKm(r.val)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedRadiusKm === r.val
                    ? 'bg-white text-emerald-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Quick Role Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-stone-500 text-[11px] font-medium">Mode Pengguna:</span>
          <div className="inline-flex rounded-md bg-stone-200/80 p-0.5 text-xs">
            <button
              onClick={() => handleRoleChange('customer')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                currentUser.role === 'customer'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Mahasiswa</span>
            </button>

            <button
              onClick={() => handleRoleChange('merchant')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                currentUser.role === 'merchant'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <StoreIcon className="w-3.5 h-3.5" />
              <span>Pemilik Warung</span>
            </button>

            <button
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                currentUser.role === 'admin'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          <button
            onClick={() => refreshFromBackend()}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-semibold transition-colors cursor-pointer text-xs ${
              isBackendConnected
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                : 'bg-stone-200 hover:bg-stone-300 border-stone-300 text-stone-700'
            }`}
            title={isBackendConnected ? 'Terhubung ke Backend Laravel 11 & Database MySQL (warlok_db). Klik untuk sinkronisasi ulang.' : 'Mode Offline / LocalStorage. Klik untuk coba hubungkan ke Laravel 11 API.'}
          >
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
            <Database className="w-3.5 h-3.5" />
            <span>{isBackendConnected ? 'Laravel 11 + MySQL' : 'Mode Lokal'}</span>
          </button>

          {onOpenXamppModal && (
            <button
              onClick={onOpenXamppModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-100 hover:bg-orange-200 border border-orange-200 text-orange-950 font-semibold transition-colors cursor-pointer text-xs ml-1"
              title="Lihat skrip backend PHP & SQL untuk XAMPP"
            >
              <span>Kode XAMPP</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
