
import React, { useEffect, useRef, useState } from 'react';
import { Property } from '../types';
import L from 'leaflet';

interface PropertyMapProps {
  properties: Property[];
  onClose: () => void;
  onSelectProperty: (property: Property) => void;
}

// Haversine formula to calculate distance between two coordinates in KM
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ properties, onClose, onSelectProperty }) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number, y: number } | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    // Initialize map
    const yiwuCenter: [number, number] = [29.3068, 120.0751];
    mapRef.current = L.map(mapContainerRef.current, {
      center: userLocation || yiwuCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Add Dark Mode Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Add User Location Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative">
            <div class="absolute -inset-4 bg-dashboard-blue/20 rounded-full animate-ping"></div>
            <div class="size-4 bg-dashboard-blue border-2 border-white rounded-full shadow-lg relative z-10"></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker(userLocation, { icon: userIcon }).addTo(mapRef.current).bindPopup('您的当前位置');
    }

    // Add Property Markers
    properties.forEach((property) => {
      if (!property.coords) return;

      const dist = userLocation ? calculateDistance(userLocation[0], userLocation[1], property.coords[0], property.coords[1]) : null;

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div id="marker-${property.id}" class="marker-bubble bg-white text-primary border-2 border-primary px-3 py-1.5 rounded-full font-black text-xs shadow-xl transition-all flex flex-col items-center gap-0 hover:scale-110 hover:bg-primary hover:text-white hover:border-white">
            <div class="flex items-center gap-1">
              ¥${property.price.toLocaleString()}
            </div>
          </div>
        `,
        iconSize: [70, 36],
        iconAnchor: [35, 18],
      });

      const marker = L.marker(property.coords, { icon })
        .addTo(mapRef.current!)
        .on('mouseover', (e) => {
          setHoveredProperty(property);
          if (mapRef.current) {
            const point = mapRef.current.latLngToContainerPoint(property.coords!);
            setPopoverPosition({ x: point.x, y: point.y });
          }
        })
        .on('mouseout', () => {
          setHoveredProperty(null);
          setPopoverPosition(null);
        })
        .on('click', () => onSelectProperty(property));

      markersRef.current[property.id] = marker;
    });

    // Update popover position when map moves while hovering
    const handleMapMove = () => {
      if (hoveredProperty && hoveredProperty.coords && mapRef.current) {
        const point = mapRef.current.latLngToContainerPoint(hoveredProperty.coords);
        setPopoverPosition({ x: point.x, y: point.y });
      }
    };

    mapRef.current.on('move', handleMapMove);
    mapRef.current.on('zoom', handleMapMove);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [properties, viewMode, userLocation, hoveredProperty]);

  // Sync hovered state with marker appearance
  useEffect(() => {
    if (viewMode === 'map') {
      properties.forEach(p => {
        const el = document.getElementById(`marker-${p.id}`);
        if (el) {
          if (hoveredProperty?.id === p.id) {
            el.classList.add('bg-primary', 'text-white', 'border-white', 'scale-110', 'z-[400]');
            el.classList.remove('bg-white', 'text-primary', 'border-primary');
          } else {
            el.classList.remove('bg-primary', 'text-white', 'border-white', 'scale-110', 'z-[400]');
            el.classList.add('bg-white', 'text-primary', 'border-primary');
          }
        }
      });
    }
  }, [hoveredProperty, properties, viewMode]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleLocate = () => {
    if (userLocation) {
      mapRef.current?.setView(userLocation, 15);
    } else {
      mapRef.current?.locate({ setView: true, maxZoom: 15 });
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-background-dark flex flex-col animate-fadeIn">
      {/* Map Header */}
      <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-card-dark/80 backdrop-blur-xl border-b border-white/10 z-[310]">
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={onClose} className="size-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-sm md:text-lg font-bold text-white whitespace-nowrap">地图寻房</h2>
        </div>
        
        <div className="flex items-center gap-1 bg-background-dark/50 p-1 rounded-full border border-white/10 shrink-0">
          <button 
            onClick={() => setViewMode('map')}
            className={`px-3 md:px-6 py-1.5 text-[10px] md:text-xs font-bold rounded-full transition-all ${
              viewMode === 'map' ? 'bg-dashboard-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            地图模式
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`px-3 md:px-6 py-1.5 text-[10px] md:text-xs font-bold rounded-full transition-all ${
              viewMode === 'list' ? 'bg-dashboard-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            列表模式
          </button>
        </div>

        <div className="hidden sm:block">
          <button className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold text-slate-300 hover:bg-white/10 transition-all">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            筛选
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative flex-1 bg-[#0F0F0F] overflow-hidden">
        {viewMode === 'map' ? (
          /* MAP VIEW */
          <div className="w-full h-full animate-fadeIn">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Hover Popover Overlay */}
            {hoveredProperty && popoverPosition && (
              <div 
                className="absolute z-[350] w-64 bg-[#1e293b] rounded-2xl border border-white/20 shadow-2xl overflow-hidden animate-popIn pointer-events-none"
                style={{ 
                  left: `${popoverPosition.x}px`, 
                  top: `${popoverPosition.y - 12}px`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="relative h-32 bg-cover bg-center" style={{ backgroundImage: `url("${hoveredProperty.imageUrls[0]}")` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent"></div>
                  {hoveredProperty.hasVideo && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px] fill-1">play_circle</span>
                      视频
                    </div>
                  )}
                </div>
                <div className="p-4 bg-[#1e293b]">
                  <h4 className="text-sm font-bold text-white truncate mb-1">{hoveredProperty.title}</h4>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{hoveredProperty.layout} · {hoveredProperty.area}㎡</span>
                      <span className="text-[9px] text-slate-500 truncate w-32">{hoveredProperty.address}</span>
                    </div>
                    <span className="text-base font-black text-primary italic">¥{hoveredProperty.price.toLocaleString()}</span>
                  </div>
                </div>
                {/* Popover Arrow */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-[#1e293b] border-r border-b border-white/20 rotate-45"></div>
              </div>
            )}

            {/* Map Navigation Controls */}
            <div className="absolute right-4 md:right-6 bottom-36 flex flex-col gap-2 z-[305]">
              <button onClick={handleZoomIn} className="size-10 md:size-12 bg-card-dark rounded-xl flex items-center justify-center border border-white/10 text-white hover:bg-white/5 shadow-xl transition-all">
                <span className="material-symbols-outlined">add</span>
              </button>
              <button onClick={handleZoomOut} className="size-10 md:size-12 bg-card-dark rounded-xl flex items-center justify-center border border-white/10 text-white hover:bg-white/5 shadow-xl transition-all">
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>

            <div className="absolute left-4 md:left-6 bottom-36 z-[305]">
              <button onClick={handleLocate} className="size-10 md:size-12 bg-dashboard-blue rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
                <span className="material-symbols-outlined">my_location</span>
              </button>
            </div>

            {/* Bottom Slider for Map Mode */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-sidebar-dark/80 backdrop-blur-2xl border-t border-white/10 p-4 flex gap-4 overflow-x-auto no-scrollbar z-[305] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              {properties.map((p) => {
                const dist = (userLocation && p.coords) ? calculateDistance(userLocation[0], userLocation[1], p.coords[0], p.coords[1]) : null;
                return (
                  <div 
                    key={p.id}
                    onClick={() => onSelectProperty(p)}
                    onMouseEnter={() => {
                      setHoveredProperty(p);
                      if (p.coords && mapRef.current) {
                        mapRef.current.panTo(p.coords, { animate: true });
                        const point = mapRef.current.latLngToContainerPoint(p.coords);
                        setPopoverPosition({ x: point.x, y: point.y });
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredProperty(null);
                      setPopoverPosition(null);
                    }}
                    className={`shrink-0 flex items-center gap-4 bg-white/5 border rounded-2xl p-3 cursor-pointer transition-all hover:bg-white/10 ${
                      hoveredProperty?.id === p.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-white/5'
                    }`}
                  >
                    <div className="size-16 rounded-xl bg-cover bg-center border border-white/5" style={{ backgroundImage: `url("${p.imageUrls[0]}")` }}></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white w-32 md:w-40 truncate">{p.title}</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-500">{p.layout} · {dist ? (dist < 1 ? Math.round(dist * 1000) + 'm' : dist.toFixed(1) + 'km') : ''}</span>
                        <span className="text-xs text-primary font-black ml-4">¥{p.price}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="w-full h-full flex flex-col bg-[#0A0A0B] animate-fadeIn overflow-y-auto no-scrollbar px-4 md:px-0">
            <div className="max-w-4xl mx-auto w-full py-8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">发现 {properties.length} 套相关房源</span>
              </div>

              {properties.map((p) => {
                const dist = (userLocation && p.coords) ? calculateDistance(userLocation[0], userLocation[1], p.coords[0], p.coords[1]) : null;
                return (
                  <div 
                    key={p.id}
                    onClick={() => onSelectProperty(p)}
                    className="flex flex-col md:flex-row gap-4 md:gap-6 bg-[#161618] border border-white/5 p-4 rounded-2xl md:rounded-[2rem] hover:bg-white/[0.03] hover:border-white/10 transition-all group cursor-pointer"
                  >
                    <div className="relative w-full md:w-64 aspect-video md:aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden shrink-0">
                      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url("${p.imageUrls[0]}")` }}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      {p.hasVideo && (
                        <div className="absolute top-3 left-3 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] fill-1">play_circle</span>
                          视频看房
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors leading-tight">{p.title}</h3>
                          <span className="text-xl font-black text-primary italic">¥{p.price}<span className="text-[10px] text-slate-500 not-italic ml-1">/月</span></span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-slate-400 text-xs font-bold mb-4">
                          <span>{p.layout}</span>
                          <span className="size-1 rounded-full bg-slate-700"></span>
                          <span>{p.area}㎡</span>
                          <span className="size-1 rounded-full bg-slate-700"></span>
                          <span>{p.district}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2 text-slate-500">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <p className="text-[11px] font-medium truncate flex-1">{p.address}</p>
                        <button className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline whitespace-nowrap">查看详情 {'>'}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .marker-bubble {
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        @keyframes popIn {
          from { opacity: 0; transform: translate(-50%, -85%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-popIn {
          animation: popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
};
