import React from 'react';
import { MdTrendingUp, MdWarning, MdCheckCircle, MdInfo } from 'react-icons/md';

const typeConfig = {
  critical: { icon: MdWarning, color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  warning: { icon: MdInfo, color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
  good: { icon: MdCheckCircle, color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
};

const SpatialInsights = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Not enough spatial data to generate geographic insights.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {data.map((insight, idx) => {
        const cfg = typeConfig[insight.type] || typeConfig.warning;
        const Icon = cfg.icon;
        return (
          <div key={idx} className={`flex flex-col bg-white rounded-xl border ${cfg.border} shadow-sm overflow-hidden transition-all hover:shadow-md`}>
            {/* Header Area */}
            <div className={`px-5 py-4 flex items-start gap-4 border-b ${cfg.border} ${cfg.bg}`}>
              <div className="p-2 rounded-lg bg-white shadow-sm shrink-0">
                <Icon className={`text-2xl ${cfg.text}`} />
              </div>
              <div className="flex-1 pt-1">
                <h4 className={`font-extrabold text-sm uppercase tracking-wider mb-1 ${cfg.text}`}>{insight.title}</h4>
                <p className="text-gray-800 text-sm font-medium leading-relaxed">{insight.body}</p>
              </div>
            </div>

            {/* Metrics Area */}
            {insight.metrics && (
              <div className="px-5 py-4 grid grid-cols-3 gap-4 bg-gray-50/50">
                {insight.metrics.map((metric, i) => (
                  <div key={i} className="flex flex-col border-l-2 border-gray-200 pl-3">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{metric.label}</span>
                    <span className="text-lg font-black text-gray-900">{metric.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendation Area */}
            {insight.recommendation && (
              <div className="px-5 py-3 bg-gray-900 mt-auto border-t border-gray-800">
                <div className="flex gap-2 items-start">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0 mt-0.5">ACTION:</span>
                  <p className="text-sm text-gray-200 font-medium leading-tight">{insight.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SpatialInsights;
