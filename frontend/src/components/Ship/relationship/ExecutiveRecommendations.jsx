import React from 'react';
import { MdFlag, MdOutlineFlag, MdArrowForward } from 'react-icons/md';

const priorityConfig = {
  Critical: { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', dot: 'bg-red-500' },
  High: { color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200', dot: 'bg-orange-400' },
  Medium: { color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200', dot: 'bg-blue-400' },
  Low: { color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', dot: 'bg-gray-400' },
};

const ExecutiveRecommendations = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No recommendations generated from available data.
      </div>
    );
  }

  // Sort: Critical → High → Medium → Low
  const sortOrder = ['Critical', 'High', 'Medium', 'Low'];
  const sorted = [...data].sort((a, b) =>
    sortOrder.indexOf(a.priority) - sortOrder.indexOf(b.priority)
  );

  return (
    <div className="space-y-3">
      {sorted.map((rec, idx) => {
        const cfg = priorityConfig[rec.priority] || priorityConfig.Low;
        return (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className={`w-2 h-2 rounded-full ${cfg.dot}`}></div>
              {idx < sorted.length - 1 && <div className="w-0.5 h-8 bg-gray-200 rounded"></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-gray-900 text-sm leading-snug flex-1">{rec.action}</p>
                <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{rec.rationale}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExecutiveRecommendations;
