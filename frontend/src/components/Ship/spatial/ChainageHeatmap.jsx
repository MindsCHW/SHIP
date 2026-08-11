import React, { useState } from 'react';
import { MdLinearScale } from 'react-icons/md';

const ChainageHeatmap = ({ data }) => {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) {
    return <div className="text-center text-sm text-gray-400 py-6">No chainage data available.</div>;
  }

  // To draw a continuous strip, we calculate width percentages based on total span.
  const minCh = Math.min(...data.map(d => d.chainage));
  const maxCh = Math.max(...data.map(d => d.chainage));
  const totalSpan = Math.max(maxCh - minCh + 1, 1);

  const getColor = (rating) => {
    const r = parseFloat(rating);
    if (r <= 1) return 'bg-red-600';
    if (r <= 5) return 'bg-orange-500';
    if (r < 8) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  return (
    <div className="relative pt-8 pb-12">
      {/* Tooltip Overlay */}
      {hovered && (
        <div 
          className="absolute top-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs w-56 transform -translate-x-1/2 -translate-y-full mb-2 pointer-events-none transition-all duration-100"
          style={{ left: `${((hovered.chainage - minCh) / totalSpan) * 100}%` }}
        >
          <div className="font-black text-gray-900 border-b border-gray-100 pb-1 mb-1">{hovered.label}</div>
          <div className="flex justify-between py-0.5"><span className="text-gray-500">Observations</span><span className="font-bold">{hovered.observations}</span></div>
          <div className="flex justify-between py-0.5"><span className="text-gray-500">Avg Rating</span><span className="font-bold">{hovered.avgRating}/10</span></div>
          
          <div className="mt-2 pt-2 border-t border-gray-100">
            <span className="text-gray-400 font-bold mb-1 block uppercase" style={{fontSize: '10px'}}>Asset Types Present</span>
            <div className="flex flex-wrap gap-1">
              {hovered.categories.length > 0 ? hovered.categories.map(cat => (
                <span key={cat} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-gray-200">{cat}</span>
              )) : <span className="text-gray-400 italic text-xs">No assets recorded</span>}
            </div>
          </div>
          {/* Caret */}
          <div className="absolute w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45 -bottom-1.5 left-1/2 -ml-1.5"></div>
        </div>
      )}

      {/* Axis markers */}
      <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 px-1">
        <span>CH {minCh}</span>
        <span className="flex items-center gap-1"><MdLinearScale /> Structural Health Heatmap</span>
        <span>CH {maxCh}</span>
      </div>

      {/* The Strip */}
      <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden flex shadow-inner relative group">
        {data.map((bin, i) => (
          <div
            key={i}
            className={`h-full cursor-pointer transition-opacity ${getColor(bin.avgRating)} ${hovered && hovered.chainage !== bin.chainage ? 'opacity-50' : 'opacity-100 hover:opacity-90'}`}
            style={{ width: `${(1 / totalSpan) * 100}%`, left: `${((bin.chainage - minCh) / totalSpan) * 100}%`, position: 'absolute' }}
            onMouseEnter={() => setHovered(bin)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </div>

      <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-gray-500">
        <div className="flex items-center gap-2"><div className="w-4 h-2 bg-green-500 rounded-full"></div> 8-10 (Good)</div>
        <div className="flex items-center gap-2"><div className="w-4 h-2 bg-yellow-400 rounded-full"></div> 5-8 (Fair)</div>
        <div className="flex items-center gap-2"><div className="w-4 h-2 bg-orange-500 rounded-full"></div> 1-5 (Poor)</div>
        <div className="flex items-center gap-2"><div className="w-4 h-2 bg-red-600 rounded-full"></div> 0-1 (Critical)</div>
      </div>
    </div>
  );
};

export default ChainageHeatmap;
