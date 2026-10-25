import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Car, 
  Footprints, 
  Bus, 
  ShieldCheck, 
  ExternalLink, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Info,
  Clock,
  Sparkles,
  Compass
} from 'lucide-react';

// Coordinates for Collège Isaac Newton (Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti)
const CAMPUS_COORDS: [number, number] = [18.5448, -72.2996];

interface Landmark {
  id: string;
  name: string;
  description: string;
  type: 'college' | 'junction' | 'transit' | 'corridor';
  coords: [number, number];
  distance: string;
  iconBg: string;
}

const LANDMARKS: Landmark[] = [
  {
    id: 'college',
    name: 'Collège Isaac Newton (Campus Principal)',
    description: 'Delmas 50, rue Dominique #2 bis · Secrétariat & Salles de cours',
    type: 'college',
    coords: [18.5448, -72.2996],
    distance: 'Point central',
    iconBg: '#0f274a',
  },
  {
    id: 'delmas-50-junction',
    name: 'Carrefour Delmas 50 (Autoroute de Delmas)',
    description: 'Entrée principale menant à la rue Dominique',
    type: 'junction',
    coords: [18.5462, -72.2982],
    distance: '250 m · 3 min à pied',
    iconBg: '#c99738',
  },
  {
    id: 'transit-station',
    name: 'Arrêt Tap-Taps & Taxis Delmas 50',
    description: 'Lignes régulières Delmas 33, Pétion-Ville et Centre-Ville',
    type: 'transit',
    coords: [18.5465, -72.2978],
    distance: '300 m · 4 min à pied',
    iconBg: '#2563eb',
  },
  {
    id: 'delmas-33-axis',
    name: 'Direction Delmas 33 / Carrefour Aéroport',
    description: 'Axe rapide vers l’Aéroport International Toussaint Louverture',
    type: 'corridor',
    coords: [18.5485, -72.3025],
    distance: '2.4 km · 8-10 min en voiture',
    iconBg: '#475569',
  },
  {
    id: 'petion-ville-axis',
    name: 'Direction Pétion-Ville (Haut de Delmas)',
    description: 'Accès fluide vers Delmas 60 et la place Boyer',
    type: 'corridor',
    coords: [18.5415, -72.2940],
    distance: '3.8 km · 12 min en voiture',
    iconBg: '#475569',
  },
];

type TileLayerOption = 'carto' | 'osm' | 'humanitarian';

const TILE_LAYERS: Record<TileLayerOption, { name: string; url: string; attribution: string }> = {
  carto: {
    name: 'Plan Moderne (CartoDB)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  osm: {
    name: 'Standard (OpenStreetMap)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  humanitarian: {
    name: 'Relief & Transports (HOT)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, HOT',
  },
};

export const CampusMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const [activeLayer, setActiveLayer] = useState<TileLayerOption>('carto');
  const [selectedLandmark, setSelectedLandmark] = useState<string>('college');
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLandmarkList, setShowLandmarkList] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Reset container in case of HMR or remount
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
      mapContainerRef.current.innerHTML = '';
    }

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: CAMPUS_COORDS,
      zoom: 16,
      zoomControl: false, // Custom styled zoom controls
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add minimal attribution in corner
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    // Initial tile layer
    const initialTileConfig = TILE_LAYERS[activeLayer];
    const initialTile = L.tileLayer(initialTileConfig.url, {
      attribution: initialTileConfig.attribution,
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = initialTile;

    // Create custom pin for College Isaac Newton
    const collegeIcon = L.divIcon({
      className: 'custom-college-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-2 bg-blue-600/30 rounded-full animate-ping opacity-75"></div>
          <div class="relative w-11 h-11 bg-[#0f274a] text-white rounded-2xl border-2 border-amber-400 shadow-xl flex items-center justify-center font-bold text-xs ring-4 ring-white">
            <svg class="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div class="absolute -bottom-1.5 w-2 h-2 bg-[#0f274a] rotate-45 border-r border-b border-amber-400"></div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -42],
    });

    // College Marker with rich popup
    const collegeMarker = L.marker(CAMPUS_COORDS, { icon: collegeIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: system-ui, sans-serif; min-width: 210px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #1e3a8a; background: #eff6ff; padding: 2px 6px; border-radius: 9999px;">Campus Principal</span>
          </div>
          <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.2;">Collège Isaac Newton</h3>
          <p style="margin: 3px 0 6px; font-size: 11px; color: #64748b;">Delmas 50, rue Dominique #2 bis</p>
          <div style="font-size: 10px; color: #334155; line-height: 1.4; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 4px;">
            <div>📞 <strong>Ligne 1 :</strong> +509 3316-0934</div>
            <div>📞 <strong>Ligne 2 :</strong> +509 3721-1818</div>
            <div style="margin-top: 3px;">🕒 <strong>Horaires :</strong> 7h30 - 15h30</div>
          </div>
          <div style="margin-top: 8px;">
            <a href="https://maps.google.com/?q=Delmas+50+rue+Dominique+2+bis+Port-au-Prince+Haiti" target="_blank" rel="noopener noreferrer" style="display: inline-block; width: 100%; text-align: center; background: #0f274a; color: #ffffff; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none;">
              Ouvrir dans Google Maps ↗
            </a>
          </div>
        </div>
      `, {
        closeButton: true,
        className: 'college-popup-custom',
      });

    markersRef.current['college'] = collegeMarker;

    // Add surrounding landmarks
    LANDMARKS.filter(lm => lm.id !== 'college').forEach(lm => {
      const landmarkIcon = L.divIcon({
        className: `custom-landmark-pin-${lm.id}`,
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-7 h-7 rounded-full shadow-md flex items-center justify-center text-white ring-2 ring-white" style="background-color: ${lm.iconBg};">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker(lm.coords, { icon: landmarkIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 180px; padding: 2px;">
            <div style="font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase;">Repère Accès Delmas 50</div>
            <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 2px 0;">${lm.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${lm.description}</div>
            <div style="font-size: 10px; font-weight: 600; color: #1e3a8a; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">
              📍 Distance : ${lm.distance}
            </div>
          </div>
        `);

      marker.on('click', () => {
        setSelectedLandmark(lm.id);
      });

      markersRef.current[lm.id] = marker;
    });

    // College marker click
    collegeMarker.on('click', () => {
      setSelectedLandmark('college');
    });

    // Subtle highlighted circle for campus perimeter
    L.circle(CAMPUS_COORDS, {
      radius: 80,
      color: '#c99738',
      weight: 1.5,
      fillColor: '#0f274a',
      fillOpacity: 0.08,
      dashArray: '4, 4',
    }).addTo(map);

    // Initial resize trigger
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      try {
        map.remove();
      } catch {
        // safely ignore cleanup during fast unmount
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when user toggles
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileConfig = TILE_LAYERS[activeLayer];
    const newTile = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = newTile;
  }, [activeLayer]);

  // Handle landmark selection and center
  const handleSelectLandmark = (landmarkId: string) => {
    setSelectedLandmark(landmarkId);
    const landmark = LANDMARKS.find(l => l.id === landmarkId);
    if (landmark && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(landmark.coords, landmarkId === 'college' ? 17 : 16, {
        duration: 0.8,
      });
      const marker = markersRef.current[landmarkId];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const handleResetView = () => {
    handleSelectLandmark('college');
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleCopyCoords = async () => {
    try {
      await navigator.clipboard.writeText('18.5448, -72.2996');
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2200);
    } catch {
      // Fallback
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2200);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 300);
  };

  return (
    <div className={`space-y-4 transition-all ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900/80 p-4 sm:p-6 backdrop-blur-md flex flex-col justify-center' : ''}`}>
      
      {/* Map Header & Controls Strip */}
      <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col ${isFullscreen ? 'max-w-6xl mx-auto w-full h-[90vh]' : ''}`}>
        
        {/* Top Control Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  Plan Interactif du Campus & Accès Delmas 50
                </h3>
                <span className="hidden sm:inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  GPS Précis
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Delmas 50, rue Dominique #2 bis · Port-au-Prince, Haïti
              </p>
            </div>
          </div>

          {/* Quick Action Buttons on Bar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Tile Layer Selector */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
              {(['carto', 'osm', 'humanitarian'] as TileLayerOption[]).map((layer) => (
                <button
                  key={layer}
                  type="button"
                  onClick={() => setActiveLayer(layer)}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                    activeLayer === layer 
                      ? 'bg-blue-900 text-white font-semibold shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={TILE_LAYERS[layer].name}
                >
                  {layer === 'carto' ? 'Moderne' : layer === 'osm' ? 'OSM' : 'Transports'}
                </button>
              ))}
            </div>

            {/* Reset View */}
            <button
              type="button"
              onClick={handleResetView}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Recentrer sur le campus"
              aria-label="Recentrer la carte"
            >
              <RotateCcw className="w-4 h-4 text-blue-900" />
            </button>

            {/* Toggle Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title={isFullscreen ? 'Quitter le plein écran' : 'Agrandir en plein écran'}
              aria-label="Plein écran"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-slate-700" /> : <Maximize2 className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Map Canvas + Overlay Controls */}
        <div className={`relative w-full ${isFullscreen ? 'flex-1 min-h-0' : 'h-[360px] sm:h-[440px]'}`}>
          
          {/* Leaflet container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-full z-0 outline-none"
            style={{ background: '#f8fafc' }}
          />

          {/* Floating Map Controls (Top Right) */}
          <div className="absolute top-3 right-3 z-[10] flex flex-col gap-1.5 shadow-md rounded-xl overflow-hidden bg-white/95 backdrop-blur-xs border border-slate-200/90 p-1">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition-colors cursor-pointer"
              title="Zoom avant"
              aria-label="Zoom avant"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-px bg-slate-200" />
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition-colors cursor-pointer"
              title="Zoom arrière"
              aria-label="Zoom arrière"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Campus Badge (Bottom Left) */}
          <div className="absolute bottom-3 left-3 z-[10] max-w-[280px] sm:max-w-xs bg-white/95 backdrop-blur-xs rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-lg text-xs space-y-1.5 hidden xs:block">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Collège Isaac Newton
              </span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Delmas 50
              </span>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              Rue Dominique #2 bis · Campus sécurisé avec parking et accueil des parents.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
              <span className="font-mono text-slate-500">18.5448° N, 72.2996° W</span>
              <button
                type="button"
                onClick={handleCopyCoords}
                className="text-blue-900 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedCoords ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copier GPS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick External Navigation Button (Bottom Right) */}
          <div className="absolute bottom-3 right-3 z-[10] flex items-center gap-2">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=18.5448,-72.2996"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-lg transition-all hover:scale-102 active:scale-98"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Itinéraire GPS</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          </div>

        </div>

        {/* Landmark Selector Pills / Access Points */}
        <div className="p-3 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-900" />
              <span>Points de Repère & Accès Clés à Delmas</span>
            </span>
            <span className="text-[10px] text-slate-500">
              Cliquez pour cibler un axe d'accès
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {LANDMARKS.map((lm) => {
              const isSelected = selectedLandmark === lm.id;
              return (
                <button
                  key={lm.id}
                  type="button"
                  onClick={() => handleSelectLandmark(lm.id)}
                  className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                      : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[11px] font-bold line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {lm.name}
                    </span>
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: lm.iconBg }} 
                    />
                  </div>
                  <span className={`text-[10px] line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {lm.distance}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Campus Practical Directions Guide Cards (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Card 1: By Car / Tap-tap */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
              <Car className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-sm">
              En Véhicule Personnel
            </h4>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Depuis l’Autoroute de Delmas, s’engager à <strong>Delmas 50</strong>. Poursuivre sur environ 250 mètres, puis tourner à droite sur la <strong>rue Dominique</strong> (repère n°2 bis). Parking gardé sur place.
          </p>
        </div>

        {/* Card 2: Public Transit */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Bus className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-sm">
              Transports Publics (Tap-taps)
            </h4>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Lignes régulières <strong>Delmas 33 ⇄ Pétion-Ville</strong> ou <strong>Centre-Ville ⇄ Delmas</strong>. Descendre au carrefour de <strong>Delmas 50</strong>. Le campus se trouve à 3 minutes de marche sécurisée.
          </p>
        </div>

        {/* Card 3: Security & Welcome */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-sm">
              Contrôle & Réception
            </h4>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Poste de sécurité à l'entrée avec registre des visiteurs. Présentation d'une pièce d'identité requise pour toute visite des locaux ou rendez-vous avec la direction.
          </p>
        </div>

      </div>

    </div>
  );
};
