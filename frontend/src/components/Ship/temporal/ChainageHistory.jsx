import React, { useState } from 'react';
import { MdSearch, MdLocationOn } from 'react-icons/md';

const ChainageHistory = ({ data }) => {
  const [search, setSearch] = useState('');

  if (!data || data.length === 0) return <div className="p-6 text-sm text-gray-400 text-center">No chainage history found.</div>;

  const filtered = search ? data.filter(d => d.chainage.toLowerCase().includes(search.toLowerCase())) : data;

  return (
    <div className="flex flex-col h-[500px]">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
        <MdSearch className="text-xl text-gray-400" />
        <input 
          type="text" 
          placeholder="Search chainage (e.g., 145.320)..."
          className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full text-gray-800 placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filtered.map((item, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="font-mono font-black text-gray-900 flex items-center gap-1.5 mb-4 border-b border-gray-100 pb-2">
              <MdLocationOn className="text-gray-400" /> CH {item.chainage}
            </h4>
            <div className="space-y-3">
              {item.history.map((h, j) => (
                <div key={j} className="flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700">{h.month}</span>
                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">{h.assetType}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-black ${
                    h.taskAvg >= 8 ? 'bg-green-100 text-green-700' :
                    h.taskAvg >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    Rating {h.taskAvg.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChainageHistory;
