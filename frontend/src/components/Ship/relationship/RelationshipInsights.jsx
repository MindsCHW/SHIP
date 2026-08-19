import React from 'react';
import { MdTrendingUp, MdWarning, MdCheckCircle, MdInfo } from 'react-icons/md';

const typeConfig = {
  critical: { icon: MdWarning, color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  warning: { icon: MdInfo, color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
  good: { icon: MdCheckCircle, color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
};

const RelationshipInsights = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Not enough data to generate relationship insights for this project.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {data.map((insight, idx) => {
        const cfg = typeConfig[insight.type] || typeConfig.warning;
        const Icon = cfg.icon;
        return (
          <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
            <div className={`p-2.5 rounded-lg bg-white shadow-sm shrink-0 mt-0.5`}>
              <Icon className={`text-xl ${cfg.text}`} />
            </div>
            <div>
              <h4 className={`font-bold text-sm mb-1 ${cfg.text}`}>{insight.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{insight.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RelationshipInsights;
