import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdArrowForward } from 'react-icons/md';

const CorridorTimeline = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-center text-sm text-gray-400">No timeline data available.</div>;

  return (
    <div className="relative">
      <div className="absolute left-[39px] top-0 bottom-0 w-0.5 bg-gray-100"></div>
      
      <div className="space-y-6 relative z-10">
        {data.map((point, idx) => (
          <div key={idx} className="flex gap-6 items-start">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-20 text-right text-xs font-bold text-gray-500 pt-1">{point.month}</div>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-white border-4 border-green-500 shadow-sm shrink-0 z-10 mt-0.5"></div>
            
            <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono font-black text-gray-900 text-sm">CH {point.corridor}</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                  point.avgRating >= 8 ? 'bg-green-100 text-green-700' :
                  point.avgRating >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  Avg {point.avgRating}/10
                </span>
              </div>
              <div className="flex gap-4">
                <div className="text-sm">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Critical</span>
                  <span className="font-black text-gray-900">{point.critical}</span>
                </div>
                {idx < data.length - 1 && (
                  <div className="text-sm text-gray-400 flex items-center justify-center flex-1">
                    <MdArrowForward className="rotate-90 text-2xl opacity-30" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CorridorTimeline;
