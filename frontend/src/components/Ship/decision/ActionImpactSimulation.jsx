import React, { useState } from 'react';
import { MdArrowForward, MdCheckCircle, MdExpandMore, MdExpandLess } from 'react-icons/md';

const priorityColors = {
  Critical: 'border-red-400 bg-red-50',
  High:     'border-orange-400 bg-orange-50',
  Medium:   'border-amber-400 bg-amber-50',
  Low:      'border-gray-300 bg-gray-50',
};

const ActionImpactSimulation = ({ data }) => {
  const [expanded, setExpanded] = useState(null);

  if (!data || data.length === 0) return <div className="p-6 text-center text-sm text-gray-400">No actions available.</div>;

  return (
    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
      {data.map((action, i) => {
        const isOpen = expanded === i;
        return (
          <div key={i} className={`border-l-4 ${priorityColors[action.priority] || 'border-gray-300 bg-gray-50'} transition-all`}>
            <button
              className="w-full text-left p-5 flex items-start justify-between gap-4"
              onClick={() => setExpanded(isOpen ? null : i)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                    action.priority === 'Critical' ? 'bg-red-600 text-white' :
                    action.priority === 'High' ? 'bg-orange-500 text-white' :
                    action.priority === 'Medium' ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>{action.priority}</span>
                  <span className="text-[10px] font-bold text-gray-400">~{action.estimatedTimeWeeks} weeks</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm">{action.action}</h4>
                <p className="text-xs text-gray-500 mt-1">Targets {action.assetsTargeted} critical assets · Expected avg gain: <strong>+{action.expectedRatingGain} pts</strong></p>
              </div>
              {isOpen ? <MdExpandLess className="text-gray-400 text-xl shrink-0" /> : <MdExpandMore className="text-gray-400 text-xl shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-5 pb-5 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Downstream Benefits</div>
                {action.downstreamBenefits.map((b, j) => (
                  <div key={j} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                    <MdCheckCircle className="text-green-500 text-base shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{b.asset}</span>
                        <MdArrowForward className="text-gray-300 text-xs" />
                        <span className="text-xs font-bold text-green-700">+{(b.ratingImprovementFactor * 10).toFixed(0)}% improvement</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{b.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ActionImpactSimulation;
