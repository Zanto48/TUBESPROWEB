import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useWarLok } from '../../context/WarLokContext';
import { formatDistance, formatRupiah } from '../../utils/geo';
import { Store } from '../../types';

interface LeafletMapProps {
  onSelectStore: (store: Store) => void;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({ onSelectStore, className = 'h-[440px] w-full rounded-2xl overflow-hidden' }) => {
  const { currentLocation, nearbyStores, selectedRadiusKm } = useWarLok();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Map already initialized

    const map = L.map(mapContainerRef.current, {
      center: [currentLocation.lat, currentLocation.lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // OpenStreetMap Standard Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kontributor',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map view and markers when location or stores change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Pan to current location
    map.setView([currentLocation.lat, currentLocation.lng], map.getZoom() < 14 ? 15 : map.getZoom());

    // Update radius circle
    if (circleLayerRef.current) {
      map.removeLayer(circleLayerRef.current);
      circleLayerRef.current = null;
    }

    if (selectedRadiusKm > 0) {
      const circle = L.circle([currentLocation.lat, currentLocation.lng], {
        radius: selectedRadiusKm * 1000,
        color: '#059669', // Emerald
        fillColor: '#10b981',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '4, 6'
      }).addTo(map);
      circleLayerRef.current = circle;
    }

    // Clear existing markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      // 1. User Position Marker (Custom DivIcon)
      const userIcon = L.divIcon({
        className: 'user-pin-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-7 h-7 bg-blue-500 rounded-full animate-ping opacity-40"></span>
            <div class="w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-md flex items-center justify-center text-white">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const userMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: userIcon })
        .bindPopup(`
          <div class="p-2 text-xs font-sans">
            <p class="font-bold text-blue-900">${currentLocation.name}</p>
            <p class="text-stone-500">${currentLocation.campus} · Titik Anda</p>
          </div>
        `);
      markersLayerRef.current.addLayer(userMarker);

      // 2. Warung Store Markers
      nearbyStores.forEach((store) => {
        const is24Jam = store.opening_hours.toLowerCase().includes('24');
        const storeIcon = L.divIcon({
          className: 'store-pin-marker',
          html: `
            <div class="group relative flex flex-col items-center cursor-pointer transition-transform duration-150 hover:scale-110">
              <div class="px-2 py-0.5 rounded-md text-[11px] font-bold text-white shadow-md flex items-center gap-1 ${
                is24Jam ? 'bg-amber-600' : 'bg-emerald-700'
              }">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
                <span>${store.distance_km ? formatDistance(store.distance_km) : 'Warung'}</span>
              </div>
              <div class="w-2 h-2 bg-stone-800 rotate-45 -mt-1 shadow-sm"></div>
            </div>
          `,
          iconSize: [70, 36],
          iconAnchor: [35, 36],
          popupAnchor: [0, -32]
        });

        const storeMarker = L.marker([store.lat, store.lng], { icon: storeIcon });

        // Popup HTML with click handler bridge
        const popupContent = `
          <div class="p-3 font-sans min-w-[210px] text-stone-900">
            <div class="flex items-center justify-between gap-2 mb-1">
              <h4 class="font-bold text-sm text-stone-900 leading-tight">${store.name}</h4>
            </div>
            <p class="text-xs text-stone-500 mb-1 leading-snug">${store.address}</p>
            <div class="flex items-center gap-2 text-xs text-stone-600 mb-2">
              <span class="text-amber-600 font-semibold flex items-center gap-0.5">
                ★ ${store.rating > 0 ? store.rating : 'Baru'}
              </span>
              <span>·</span>
              <span class="text-emerald-700 font-medium">${store.opening_hours}</span>
            </div>
            <button 
              id="btn-open-store-${store.id}"
              class="w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer text-center block"
            >
              Buka Katalog & Reservasi →
            </button>
          </div>
        `;

        storeMarker.bindPopup(popupContent);
        
        storeMarker.on('popupopen', () => {
          const btn = document.getElementById(`btn-open-store-${store.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.preventDefault();
              onSelectStore(store);
            };
          }
        });

        markersLayerRef.current?.addLayer(storeMarker);
      });
    }
  }, [currentLocation, nearbyStores, selectedRadiusKm, onSelectStore]);

  return (
    <div className={`relative ${className} border border-stone-200 shadow-inner`}>
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      
      {/* Floating map status summary */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm text-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span className="text-stone-700 font-medium">{currentLocation.campus}</span>
        </div>
        <span className="text-stone-300">|</span>
        <div className="text-stone-600">
          <strong className="text-emerald-800 tabular-nums">{nearbyStores.length}</strong> warung terjangkau ({selectedRadiusKm > 0 ? `radius ≤${selectedRadiusKm}km` : 'semua jarak'})
        </div>
      </div>
    </div>
  );
};
