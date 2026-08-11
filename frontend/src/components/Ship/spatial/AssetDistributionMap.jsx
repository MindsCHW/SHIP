import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapFitter = ({ data }) => {
  const map = useMap();
  React.useEffect(() => {
    if (data && data.length > 0) {
      // Find average lat/lng of assets to center map
      let latSum = 0; let lngSum = 0; let count = 0;
      data.forEach(d => {
        if (d.lat && d.lng) { latSum += d.lat; lngSum += d.lng; count++; }
      });
      if (count > 0) {
        map.setView([latSum / count, lngSum / count], 12);
      }
    }
  }, [data, map]);
  return null;
};

const AssetDistributionMap = ({ data }) => {
  const [selectedAsset, setSelectedAsset] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');

  if (!data || data.length === 0) return <div className="h-[400px] flex items-center justify-center text-gray-400">No spatial asset data available.</div>;

  const categories = ['All', ...new Set(data.map(d => d.type))];
  
  const filteredData = data.filter(d => {
    const matchCategory = selectedAsset === 'All' || d.type === selectedAsset;
    
    let matchRating = true;
    if (selectedRating === 'Good') matchRating = d.rating >= 8;
    else if (selectedRating === 'Fair') matchRating = d.rating >= 5 && d.rating < 8;
    else if (selectedRating === 'Critical') matchRating = d.rating < 5;
    
    return matchCategory && matchRating;
  });

  const getColor = (rating) => {
    if (rating >= 8) return '#10b981';
    if (rating >= 5) return '#eab308';
    return '#ef4444';
  };

  const ratings = ['All', 'Good', 'Fair', 'Critical'];

  return (
    <div className="flex flex-col h-[600px]">
      <div className="bg-gray-50 border-b border-gray-200 flex flex-col p-4 gap-3">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedAsset(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedAsset === cat ? 'bg-green-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Rating Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {ratings.map(rating => (
            <button
              key={rating}
              onClick={() => setSelectedRating(rating)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedRating === rating 
                  ? (rating === 'Critical' ? 'bg-red-500 text-white shadow' : rating === 'Fair' ? 'bg-yellow-500 text-white shadow' : rating === 'Good' ? 'bg-green-500 text-white shadow' : 'bg-gray-800 text-white shadow')
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 relative z-0">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <MapFitter data={filteredData} />
          {filteredData.map(asset => {
            if (!asset.lat || !asset.lng) return null;
            return (
              <CircleMarker
                key={asset.id}
                center={[asset.lat, asset.lng]}
                radius={asset.rating < 5 ? 6 : 4}
                pathOptions={{
                  color: getColor(asset.rating),
                  fillColor: getColor(asset.rating),
                  fillOpacity: 0.8,
                  weight: 1
                }}
              >
                <Tooltip>
                  <div className="text-xs">
                    <div className="font-bold text-gray-900 mb-1">{asset.type}</div>
                    <div className="text-gray-500">Chainage: {asset.chainage}</div>
                    <div className="text-gray-500">Rating: <span className="font-bold text-gray-900">{asset.rating.toFixed(1)}/10</span></div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-gray-200 shadow-sm z-[400] text-xs flex flex-col gap-2">
          <div className="font-bold text-gray-700 border-b border-gray-100 pb-1 mb-1">Asset Rating</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#10b981] rounded-full"></div> Good</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#eab308] rounded-full"></div> Fair</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#ef4444] rounded-full"></div> Critical</div>
        </div>
      </div>
    </div>
  );
};

export default AssetDistributionMap;
