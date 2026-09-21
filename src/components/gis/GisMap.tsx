import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { DISTRICT_CENTER } from '../../data/mockData';
import { DiseaseCluster, CaseReport } from '../../types/surveillance';
import { I18nService } from '../../services/i18nService';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { 
  AlertTriangle, 
  MapPin, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  CheckCircle2,
  Activity,
  Layers
} from 'lucide-react';

export const GisMap: React.FC = () => {
  const { state } = useSurveillanceStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Selected entities for concise inspection panel
  const [selectedCluster, setSelectedCluster] = useState<DiseaseCluster | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseReport | null>(null);
  const [dossierCase, setDossierCase] = useState<CaseReport | null>(null);

  // Strict 4-Item Layer Filters
  const [filter, setFilter] = useState({
    highRisk: true,
    mediumRisk: true,
    lowRisk: true,
    clusters: true
  });

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [DISTRICT_CENTER.lat, DISTRICT_CENTER.lng],
        zoom: 12,
        zoomControl: false
      });

      // Professional dark geospatial tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 18
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }
  }, []);

  // 2. Render ONLY the 4 strict items: High Risk, Medium Risk, Low Risk, and Clusters
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // A. HIGH RISK: Red Risk Zone Buffers
    if (filter.highRisk) {
      state.clusters.forEach(cl => {
        if (cl.status !== 'CONTAINED') {
          const redZone = L.circle([cl.centerCoordinates.lat, cl.centerCoordinates.lng], {
            radius: cl.radiusKm * 1000,
            color: '#ef4444',
            weight: 2,
            dashArray: '5, 8',
            fillColor: '#ef4444',
            fillOpacity: 0.14
          });

          redZone.on('click', () => {
            setSelectedCluster(cl);
            setSelectedCase(null);
          });

          layerGroup.addLayer(redZone);
        }
      });
    }

    // B. DISEASE CLUSTERS: Distinct Cluster Markers
    if (filter.clusters) {
      state.clusters.forEach(cl => {
        const isContained = cl.status === 'CONTAINED';
        const clusterIcon = L.divIcon({
          className: 'cluster-marker-div',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              ${!isContained ? '<span class="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-rose-500 opacity-60"></span>' : ''}
              <div class="relative w-8 h-8 rounded-full ${isContained ? 'bg-emerald-600' : 'bg-rose-600'} text-white font-extrabold text-[10px] flex flex-col items-center justify-center shadow-2xl border-2 border-white transition-transform group-hover:scale-110">
                <span class="leading-none text-[8px]">${cl.id}</span>
                <span class="leading-none text-[9px] font-mono">${cl.totalCases}</span>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const clusterMarker = L.marker([cl.centerCoordinates.lat, cl.centerCoordinates.lng], {
          icon: clusterIcon,
          zIndexOffset: 1000
        });

        clusterMarker.on('click', () => {
          setSelectedCluster(cl);
          setSelectedCase(null);
        });

        layerGroup.addLayer(clusterMarker);
      });
    }

    // C. INDIVIDUAL CASES: Filtered strictly into High, Medium, and Low Risk
    state.cases.forEach(c => {
      if (c.riskLevel === 'HIGH' && !filter.highRisk) return;
      if (c.riskLevel === 'MEDIUM' && !filter.mediumRisk) return;
      if (c.riskLevel === 'LOW' && !filter.lowRisk) return;

      const markerColor = c.riskLevel === 'HIGH' 
        ? '#ef4444' 
        : c.riskLevel === 'MEDIUM' 
        ? '#eab308' 
        : '#10b981';

      const pinIcon = L.divIcon({
        className: 'case-marker-div',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${c.riskLevel === 'HIGH' ? '<span class="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-rose-500 opacity-50"></span>' : ''}
            <div class="w-4 h-4 rounded-full border-2 border-slate-900 shadow-md transition-transform group-hover:scale-125" style="background-color: ${markerColor};"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const caseMarker = L.marker([c.coordinates.lat, c.coordinates.lng], { icon: pinIcon });
      caseMarker.on('click', () => {
        setSelectedCase(c);
        setSelectedCluster(null);
      });

      layerGroup.addLayer(caseMarker);
    });

  }, [filter, state.cases, state.clusters]);

  const resetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([DISTRICT_CENTER.lat, DISTRICT_CENTER.lng], 12);
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Top Filter Bar (Strict 4 Items Only) */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-white shadow-xl pointer-events-auto flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Surveillance GIS Risk Map</span>
        </div>

        {/* 4 Strict Layer Toggles */}
        <div className="bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl flex items-center gap-1 text-[11px] pointer-events-auto">
          <button
            onClick={() => setFilter(f => ({ ...f, highRisk: !f.highRisk }))}
            className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              filter.highRisk 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>HIGH RISK</span>
          </button>

          <button
            onClick={() => setFilter(f => ({ ...f, mediumRisk: !f.mediumRisk }))}
            className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              filter.mediumRisk 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>MEDIUM</span>
          </button>

          <button
            onClick={() => setFilter(f => ({ ...f, lowRisk: !f.lowRisk }))}
            className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              filter.lowRisk 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>LOW</span>
          </button>

          <button
            onClick={() => setFilter(f => ({ ...f, clusters: !f.clusters }))}
            className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              filter.clusters 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>CLUSTERS</span>
          </button>
        </div>
      </div>

      {/* The Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-[520px] z-0" />

      {/* Floating Strict Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1.5 max-w-[200px]">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-800 pb-1">
          Surveillance Legend
        </span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 border border-white shrink-0"></span>
          <span className="text-rose-300 font-semibold text-[11px]">🔴 HIGH RISK</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 border border-white shrink-0"></span>
          <span className="text-amber-300 font-semibold text-[11px]">🟡 MEDIUM RISK</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shrink-0"></span>
          <span className="text-emerald-300 font-semibold text-[11px]">🟢 LOW RISK</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-rose-600 border border-white flex items-center justify-center text-[7px] text-white font-black shrink-0">
            CL
          </div>
          <span className="text-slate-200 font-semibold text-[11px]">● DISEASE CLUSTER</span>
        </div>
      </div>

      {/* Minimal Navigation & Reset Controls (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="bg-slate-900/95 hover:bg-slate-800 text-slate-200 p-2 rounded-xl border border-slate-800 shadow-xl transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-slate-900/95 hover:bg-slate-800 text-slate-200 p-2 rounded-xl border border-slate-800 shadow-xl transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetMapView}
          className="bg-slate-900/95 hover:bg-slate-800 text-slate-200 p-2 rounded-xl border border-slate-800 shadow-xl transition-all"
          title="Reset Center View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Concise Cluster Information Panel */}
      {selectedCluster && (
        <div className="absolute top-16 right-4 z-[400] w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-rose-500/50 p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-right">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-rose-500/20 text-rose-300 text-xs font-black px-2 py-0.5 rounded border border-rose-500/40">
                {selectedCluster.id}
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {selectedCluster.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedCluster(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white">{selectedCluster.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Surveillance Radius: {selectedCluster.radiusKm} km | Risk Score: <b className="text-rose-400">{selectedCluster.riskScore}/100</b>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Total Cases</span>
              <span className="font-black text-white text-sm">{selectedCluster.totalCases} Incidents</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Deaths</span>
              <span className="font-black text-rose-400 text-sm">{selectedCluster.totalDeaths} Animals</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-900">
              <span className="text-slate-400 text-[10px] uppercase block">Affected Villages</span>
              <span className="text-slate-200 font-medium">{selectedCluster.villages.join(', ')}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-900">
              <span className="text-slate-400 text-[10px] uppercase block">Primary Symptoms</span>
              <span className="text-rose-300 font-medium">{selectedCluster.primarySymptoms.join(', ')}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Proximity alert radius actively notifying livestock owners within {selectedCluster.radiusKm} km.
          </p>
        </div>
      )}

      {/* Concise Case Information Panel */}
      {selectedCase && (
        <div className="absolute top-16 right-4 z-[400] w-80 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-right">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">{selectedCase.id}</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                selectedCase.riskLevel === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : selectedCase.riskLevel === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {selectedCase.riskLevel}
              </span>
            </div>
            <button
              onClick={() => setSelectedCase(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs space-y-1 text-slate-200">
            <p><b>Farmer:</b> {selectedCase.farmerName} ({selectedCase.village})</p>
            <p><b>Species:</b> {selectedCase.animalType} • {selectedCase.sickCount} Sick, {selectedCase.deadCount} Dead</p>
            <p><b>Risk Score:</b> <span className="font-bold text-rose-400">{selectedCase.riskScore}/100</span></p>
            <p className="text-[11px] text-slate-400 truncate">
              <b>Symptoms:</b> {selectedCase.symptoms.join(', ')}
            </p>
          </div>

          <button
            onClick={() => {
              setDossierCase(selectedCase);
              setSelectedCase(null);
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold py-2 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1"
          >
            Inspect Full Case Dossier →
          </button>
        </div>
      )}

      {/* Case Detail Modal if clicked from GIS */}
      {dossierCase && (
        <CaseDetailModal
          isOpen={true}
          onClose={() => setDossierCase(null)}
          caseItem={dossierCase}
        />
      )}
    </div>
  );
};
