import React from 'react';
import AllProjectsMap from '../dashboard/AllProjectsMap';

const GeographicIntelligence = ({ mapData }) => {
  if (!mapData) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-green-600 rounded-full block"></span>
        Geographic Intelligence
      </h2>
      
      <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm h-[600px] overflow-hidden">
        {/* We reuse the existing AllProjectsMap component but give it a clean container */}
        <AllProjectsMap data={mapData} />
      </div>
    </div>
  );
};

export default GeographicIntelligence;
