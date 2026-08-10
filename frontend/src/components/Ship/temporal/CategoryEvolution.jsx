import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat } from 'react-icons/md';

const statusConfig = {
  Improving: { icon: MdTrendingUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  Stable: { icon: MdTrendingFlat, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
  Declining: { icon: MdTrendingDown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
};

const CategoryEvolution = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-6 text-sm text-gray-400 text-center">No category evolution data found.</div>;

  return (
    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
      {data.map((cat, i) => {
        const conf = statusConfig[cat.status] || statusConfig.Stable;
        const Icon = conf.icon;
        return (
          <div key={i} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">{cat.category}</h4>
              <div className="flex gap-1.5 mt-2">
                {cat.history.map((h, j) => (
                  <div key={j} className="flex flex-col items-center group relative">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${
                      h.rating >= 8 ? 'bg-green-100 text-green-700' :
                      h.rating >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {h.rating}
                    </div>
                    {/* Tiny tooltip for month */}
                    <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                      {h.month}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border ${conf.bg} ${conf.color} ${conf.border}`}>
                <Icon /> {cat.status}
              </span>
              <div className="text-xs text-gray-400 font-medium mt-1">Current: {cat.currentRating}/10</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryEvolution;
