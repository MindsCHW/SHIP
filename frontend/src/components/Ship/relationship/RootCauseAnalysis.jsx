import React, { useState } from 'react';
import { MdExpandMore, MdWarning } from 'react-icons/md';

const RootCauseAnalysis = ({ data }) => {
  const [expanded, setExpanded] = useState(0);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">No critical patterns detected for this project.</div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
            item.criticalRate >= 30 ? 'border-red-200' :
            item.criticalRate >= 15 ? 'border-yellow-200' :
            'border-gray-200'
          }`}
        >
          {/* Header */}
          <button
            onClick={() => setExpanded(prev => prev === idx ? -1 : idx)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                item.criticalRate >= 30 ? 'bg-red-50 text-red-500' :
                item.criticalRate >= 15 ? 'bg-yellow-50 text-yellow-600' :
                'bg-gray-50 text-gray-400'
              }`}>
                <MdWarning className="text-lg" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{item.category}</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.criticalCount} critical out of {item.totalRatings} ratings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className={`text-2xl font-black ${
                  item.criticalRate >= 30 ? 'text-red-600' :
                  item.criticalRate >= 15 ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>{item.criticalRate}%</span>
                <p className="text-xs text-gray-400">critical rate</p>
              </div>
              <MdExpandMore className={`text-gray-400 transition-transform ${expanded === idx ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Body */}
          {expanded === idx && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Root Contributors</p>
              <div className="space-y-2">
                {item.topContributors.map((contrib, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-700 truncate max-w-[280px]">{contrib.name}</span>
                        <span className="text-sm font-bold text-gray-900 ml-2 shrink-0">{contrib.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full">
                        <div
                          className={`h-full rounded-full ${
                            contrib.percentage >= 40 ? 'bg-red-500' :
                            contrib.percentage >= 20 ? 'bg-yellow-400' :
                            'bg-blue-400'
                          }`}
                          style={{ width: `${Math.min(contrib.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RootCauseAnalysis;
