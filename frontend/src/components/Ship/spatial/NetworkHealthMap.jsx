import React from 'react';
import { MapContainer, TileLayer, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Component to dynamically fit bounds based on the selected project
const MapFitter = ({ data, selectedProject }) => {
  const map = useMap();
  React.useEffect(() => {
    if (data && data.length > 0) {
      const proj = data.find(d => d.code === selectedProject);
      if (proj && proj.lat && proj.lng) {
        map.setView([proj.lat, proj.lng], 10);
      }
    }
  }, [data, selectedProject, map]);
  return null;
};

const NetworkHealthMap = ({ data, selectedProject }) => {
  if (!data || data.length === 0) return <div className="h-[400px] flex items-center justify-center text-gray-400">No map data available</div>;

  const colorMap = {
    green: '#10b981',
    yellow: '#eab308',
    orange: '#f97316',
    red: '#ef4444'
  };

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden relative z-0">
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <MapFitter data={data} selectedProject={selectedProject} />
        {data.map((p, idx) => {
          // Drawing a horizontal line segment to represent the corridor for demo purposes
          const lat = p.lat || 20.5937 + (idx * 0.5);
          const lng = p.lng || 78.9629 + (idx * 0.5);
          const positions = [
            [lat, lng],
            [lat + 0.1, lng + 0.3],
            [lat + 0.15, lng + 0.7]
          ];
          
          const isSelected = p.code === selectedProject;

          return (
            <Polyline 
              key={p.code} 
              positions={positions} 
              pathOptions={{ 
                color: colorMap[p.color] || '#cbd5e1', 
                weight: isSelected ? 8 : 4,
                opacity: isSelected ? 1 : 0.6
              }}
            >
              <Tooltip sticky>
                <div className="text-xs">
                  <div className="font-bold text-gray-900 mb-1">{p.name} ({p.code})</div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Avg Rating:</span>
                    <span className="font-bold" style={{ color: colorMap[p.color] }}>{p.avgRating}/10</span>
                  </div>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-gray-200 shadow-sm z-[400] text-xs flex gap-4">
        <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-[#10b981] rounded"></div> Healthy (≥8.5)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-[#eab308] rounded"></div> Moderate (7-8.5)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-[#f97316] rounded"></div> Poor (5-7)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-[#ef4444] rounded"></div> Critical (&lt;5)</div>
      </div>
    </div>
  );
};

export default NetworkHealthMap;
