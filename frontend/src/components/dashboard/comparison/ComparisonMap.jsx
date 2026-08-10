import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { projectCoordinates } from '../../../data/projectCoordinates';

const createColoredIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  'Improved': createColoredIcon('green'),
  'Deteriorated': createColoredIcon('red'),
  'New Observation': createColoredIcon('blue'),
  'No Change': createColoredIcon('grey')
};

const ComparisonMap = ({ mapPoints }) => {
  const center = mapPoints && mapPoints.length > 0 
    ? [mapPoints[0].lat, mapPoints[0].lng] 
    : [21.15, 79.11]; // Default to Nagpur

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0 relative">
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapPoints && mapPoints.map((pt, idx) => (
          <Marker 
            key={idx} 
            position={[pt.lat, pt.lng]} 
            icon={icons[pt.status] || icons['No Change']}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Chainage</span>
                  <span className="font-mono font-black text-blue-700">{pt.chainage}</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Parameter</span>
                  <span className="font-bold text-gray-800">{pt.type}</span>
                </div>
                
                <div className={`text-center py-2 rounded-lg font-bold text-sm shadow-sm ${
                  pt.status === 'Improved' ? 'bg-green-100 text-green-700 border border-green-200' :
                  pt.status === 'Deteriorated' ? 'bg-red-100 text-red-700 border border-red-200' :
                  pt.status === 'New Observation' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                  'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {pt.status}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ComparisonMap;
