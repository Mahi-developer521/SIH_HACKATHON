import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { DISTRICT_CENTER } from '../../data/mockData';
import { 
  Layers, 
  MapPin, 
  Eye, 
  ShieldAlert, 
  Syringe, 
  Building2, 
  FlaskConical, 
  CloudSun 
} from 'lucide-react';

export const GisMap: React.FC = () => {
  const { state, setActiveRole, createMission } = useSurveillanceStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer Visibility State (Sections 12 & 13)
  const [layers, setLayers] = useState({
    cases: true,
    riskZones: true,
    clusters: true,
    villages: true,
    farmers: true,
    vetCenters: true,
    laboratories: true,
    vaccinationGaps: true,
    weather: true
  });

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [DISTRICT_CENTER.lat, DISTRICT_CENTER.lng],
        zoom: 12,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark theme map tiles from CartoDB
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive across tab switching or clean up on unmount
    };
  }, []);

  // Update Layers when state or toggles change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. High-Risk Red Zones (Section 12: RED ZONE buffer)
    if (layers.riskZones) {
      state.clusters.forEach(cl => {
        if (cl.status !== 'CONTAINED') {
          // Red outer danger buffer (6.5 km)
          const buffer = L.circle([cl.centerCoordinates.lat, cl.centerCoordinates.lng], {
            radius: cl.radiusKm * 1000,
            color: '#ef4444',
            weight: 2,
            dashArray: '6, 8',
            fillColor: '#ef4444',
            fillOpacity: 0.15
          });

          buffer.bindPopup(`
            <div class="p-1 text-slate-100 font-sans">
              <div class="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
                🔴 HIGH-RISK SURVEILLANCE ZONE
              </div>
              <h4 class="font-bold text-sm text-white">${cl.name}</h4>
              <p class="text-xs text-slate-300 mt-1">Radius: ${cl.radiusKm} km | Risk Score: <span class="text-rose-400 font-bold">${cl.riskScore}/100</span></p>
              <div class="mt-2 text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                Proximity alerts automatically dispatched to registered livestock owners within this zone.
              </div>
            </div>
          `);
          layerGroup.addLayer(buffer);
        }
      });
    }

    // 2. Disease Clusters (Section 11 & 13)
    if (layers.clusters) {
      state.clusters.forEach(cl => {
        const clusterIcon = L.divIcon({
          className: 'custom-cluster-icon',
          html: `
            <div class="relative flex items-center justify-center w-10 h-10">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${
                cl.status === 'CONTAINED' ? 'bg-emerald-400' : 'bg-rose-500'
              } opacity-60"></span>
              <div class="relative w-8 h-8 rounded-full ${
                cl.status === 'CONTAINED' ? 'bg-emerald-600' : 'bg-rose-600'
              } text-white font-bold text-xs flex flex-col items-center justify-center shadow-lg border-2 border-white">
                <span class="text-[9px] leading-none">${cl.id}</span>
                <span class="text-[10px] leading-none">${cl.totalCases}</span>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const clusterMarker = L.marker([cl.centerCoordinates.lat, cl.centerCoordinates.lng], { icon: clusterIcon });
        clusterMarker.bindPopup(`
          <div class="p-2 text-slate-100 font-sans min-w-[240px]">
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                ${cl.id} • ${cl.status}
              </span>
              <span class="text-xs font-bold text-rose-400">Score: ${cl.riskScore}/100</span>
            </div>
            <h3 class="font-bold text-sm text-white mb-2">${cl.name}</h3>
            <div class="grid grid-cols-2 gap-2 text-xs mb-3 bg-slate-900/80 p-2 rounded border border-slate-800">
              <div><span class="text-slate-400">Total Cases:</span> <b class="text-white">${cl.totalCases}</b></div>
              <div><span class="text-slate-400">Deaths:</span> <b class="text-rose-400">${cl.totalDeaths}</b></div>
              <div class="col-span-2"><span class="text-slate-400">Villages:</span> <b class="text-white">${cl.villages.join(', ')}</b></div>
            </div>
            <div class="text-[11px] text-slate-300 mb-3">
              <span class="text-slate-400 block font-semibold mb-0.5">Primary Symptoms:</span>
              ${cl.primarySymptoms.slice(0, 3).join(', ')}
            </div>
          </div>
        `);
        layerGroup.addLayer(clusterMarker);
      });
    }

    // 3. Individual Disease Cases (Section 4 & 13)
    if (layers.cases) {
      state.cases.forEach(c => {
        const color = c.riskLevel === 'HIGH' ? '#ef4444' : c.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981';
        const caseIcon = L.divIcon({
          className: 'custom-case-icon',
          html: `
            <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white" style="background-color: ${color}">
              <span class="text-[10px] font-bold text-white">📍</span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([c.coordinates.lat, c.coordinates.lng], { icon: caseIcon });
        marker.bindPopup(`
          <div class="p-1 text-slate-100 font-sans text-xs">
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="font-bold text-white">${c.id}</span>
              <span class="px-1.5 py-0.2 rounded font-bold text-[10px]" style="background-color: ${color}33; color: ${color}; border: 1px solid ${color}66">
                ${c.riskLevel} (${c.riskScore})
              </span>
            </div>
            <p class="text-slate-300"><b>Animal:</b> ${c.animalType} | <b>Sick:</b> ${c.sickCount}, <b>Dead:</b> ${c.deadCount}</p>
            <p class="text-slate-300"><b>Farmer:</b> ${c.farmerName} (${c.village})</p>
            <p class="text-slate-400 mt-1"><b>Symptoms:</b> ${c.symptoms.slice(0, 3).join(', ')}</p>
            <div class="mt-2 text-[10px] text-slate-400 bg-slate-900 p-1.5 rounded">
              Status: <b class="text-emerald-400">${c.status}</b>
            </div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    // 4. Villages & Vaccination Coverage / Gaps (Section 26)
    if (layers.villages || layers.vaccinationGaps) {
      state.villages.forEach(v => {
        const hasGap = v.coveragePercent < 60;
        
        if (layers.vaccinationGaps && hasGap) {
          // Highlight vaccination gap with red amber hatched circle
          const gapZone = L.circle([v.coordinates.lat, v.coordinates.lng], {
            radius: 1200,
            color: '#f43f5e',
            weight: 2,
            dashArray: '4, 4',
            fillColor: '#f43f5e',
            fillOpacity: 0.25
          });
          gapZone.bindPopup(`
            <div class="p-1 text-slate-100 font-sans text-xs">
              <div class="text-rose-400 font-bold uppercase text-[10px]">⚠️ VACCINATION DEFICIT GAP</div>
              <h4 class="font-bold text-white">${v.name}</h4>
              <p class="text-slate-300 mt-1">Coverage: <b class="text-rose-400">${v.coveragePercent}%</b> (${v.vaccinatedLivestock}/${v.totalLivestock} animals)</p>
              <p class="text-slate-400 text-[11px] mt-1">Critical vulnerability: High transmission risk if pathogen enters village herd.</p>
            </div>
          `);
          layerGroup.addLayer(gapZone);
        }

        if (layers.villages) {
          const villageIcon = L.divIcon({
            className: 'custom-village-icon',
            html: `
              <div class="bg-slate-900/90 text-slate-200 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap shadow-md flex items-center gap-1">
                <span>🏘️</span> ${v.name.split(' ')[0]} (${v.coveragePercent}%)
              </div>
            `,
            iconSize: [80, 24],
            iconAnchor: [40, 12]
          });

          const vMarker = L.marker([v.coordinates.lat, v.coordinates.lng], { icon: villageIcon });
          vMarker.bindPopup(`
            <div class="p-1 text-slate-100 font-sans text-xs">
              <h4 class="font-bold text-white">${v.name}</h4>
              <p class="text-slate-300">Total Livestock: <b>${v.totalLivestock}</b></p>
              <p class="text-slate-300">Vaccinated: <b>${v.vaccinatedLivestock} (${v.coveragePercent}%)</b></p>
              <p class="text-slate-400 mt-1">Risk Status: <b class="${v.activeRiskZone === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'}">${v.activeRiskZone || 'NORMAL'}</b></p>
            </div>
          `);
          layerGroup.addLayer(vMarker);
        }
      });
    }

    // 5. Registered Farmers (Section 14)
    if (layers.farmers) {
      state.farmers.forEach(f => {
        const farmerIcon = L.divIcon({
          className: 'custom-farmer-icon',
          html: `
            <div class="w-5 h-5 rounded-full bg-emerald-700 border border-emerald-400 text-white flex items-center justify-center text-[10px] shadow">
              👨‍🌾
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const fMarker = L.marker([f.coordinates.lat, f.coordinates.lng], { icon: farmerIcon });
        fMarker.bindPopup(`
          <div class="p-1 text-slate-100 font-sans text-xs">
            <span class="text-[10px] text-emerald-400 font-bold uppercase">Registered Livestock Owner</span>
            <h4 class="font-bold text-white">${f.name}</h4>
            <p class="text-slate-300">Phone: ${f.phone}</p>
            <p class="text-slate-300">Village: ${f.village}</p>
            <div class="mt-1 text-[11px] text-slate-400">
              Animals: ${f.animals.map(a => `${a.count} ${a.species}`).join(', ')}
            </div>
          </div>
        `);
        layerGroup.addLayer(fMarker);
      });
    }

    // 6. Veterinary Facilities & Laboratories (Section 13)
    if (layers.vetCenters || layers.laboratories) {
      state.facilities.forEach(fac => {
        const isLab = fac.type === 'DIAGNOSTIC_LAB';
        if (isLab && !layers.laboratories) return;
        if (!isLab && !layers.vetCenters) return;

        const facIcon = L.divIcon({
          className: 'custom-facility-icon',
          html: `
            <div class="w-7 h-7 rounded-lg ${
              isLab ? 'bg-purple-600 border-purple-300' : 'bg-blue-600 border-blue-300'
            } border text-white flex items-center justify-center text-xs shadow-lg">
              ${isLab ? '🧪' : '🏥'}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const facMarker = L.marker([fac.coordinates.lat, fac.coordinates.lng], { icon: facIcon });
        facMarker.bindPopup(`
          <div class="p-1 text-slate-100 font-sans text-xs">
            <span class="text-[10px] ${isLab ? 'text-purple-400' : 'text-blue-400'} font-bold uppercase">
              ${fac.type.replace('_', ' ')}
            </span>
            <h4 class="font-bold text-white">${fac.name}</h4>
            <p class="text-slate-300">Contact: ${fac.contactPerson}</p>
            <p class="text-slate-300">Phone: ${fac.phone}</p>
          </div>
        `);
        layerGroup.addLayer(facMarker);
      });
    }
  }, [layers, state]);

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Layer Control Panel Floating Overlay (Section 13) */}
      <div className="absolute top-4 right-4 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-2xl max-w-xs text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-emerald-400" /> GIS Layer Controls
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">9 Layers Active</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
            <input 
              type="checkbox" 
              checked={layers.riskZones} 
              onChange={() => toggleLayer('riskZones')}
              className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">🔴 High-Risk Zones</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
            <input 
              type="checkbox" 
              checked={layers.clusters} 
              onChange={() => toggleLayer('clusters')}
              className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">⭕ Disease Clusters (CL-001)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
            <input 
              type="checkbox" 
              checked={layers.cases} 
              onChange={() => toggleLayer('cases')}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">📍 Reported Disease Cases</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
            <input 
              type="checkbox" 
              checked={layers.vaccinationGaps} 
              onChange={() => toggleLayer('vaccinationGaps')}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">💉 Vaccination Gaps (44% Alert)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
            <input 
              type="checkbox" 
              checked={layers.villages} 
              onChange={() => toggleLayer('villages')}
              className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">🏘️ Villages & Demographics</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
            <input 
              type="checkbox" 
              checked={layers.farmers} 
              onChange={() => toggleLayer('farmers')}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">👨‍🌾 Registered Livestock Owners</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
            <input 
              type="checkbox" 
              checked={layers.vetCenters} 
              onChange={() => toggleLayer('vetCenters')}
              className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">🏥 Veterinary Hospitals & Clinics</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
            <input 
              type="checkbox" 
              checked={layers.laboratories} 
              onChange={() => toggleLayer('laboratories')}
              className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">🧪 Diagnostic Laboratories (RDDL)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
            <input 
              type="checkbox" 
              checked={layers.weather} 
              onChange={() => toggleLayer('weather')}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">🌦️ Weather & Vector Layer</span>
          </label>
        </div>
      </div>

      {/* Environmental & Vector Risk Indicator (Section 13 Weather Layer) */}
      {layers.weather && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-white flex items-center gap-1.5">
              <span>District Climate Telemetry: 29.4°C</span>
              <span className="text-slate-400">• Humidity: 76%</span>
            </div>
            <div className="text-[11px] text-amber-400">
              Vector Multiplier: 1.4x (High Culicoides / Tabanid fly activity in lowlands)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
