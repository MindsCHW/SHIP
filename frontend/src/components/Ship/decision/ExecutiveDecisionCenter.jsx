import React from 'react';
import { MdWarning, MdKeyboardDoubleArrowUp, MdArrowUpward, MdArrowDownward, MdInfo } from 'react-icons/md';

const PRIORITY_CONFIG = {
  Critical: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-600', dot: 'bg-red-600', icon: MdWarning },
  High:     { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500', dot: 'bg-orange-500', icon: MdKeyboardDoubleArrowUp },
  Medium:   { bg: 'bg-amber-400', text: 'text-white', border: 'border-amber-400', dot: 'bg-amber-400', icon: MdArrowUpward },
  Low:      { bg: 'bg-gray-200', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400', icon: MdArrowDownward },
};

const ExecutiveDecisionCenter = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-gray-400 text-sm">
      No decisions generated. The network appears healthy.
    </div>
  );

  return (
    <div className="space-y-4">
      {data.map((dec, i) => {
        const conf = PRIORITY_CONFIG[dec.priority] || PRIORITY_CONFIG.Low;
        const Icon = conf.icon;
        return (
          <div key={i} className={`bg-white rounded-xl border-l-4 ${conf.border} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 items-start">

              {/* Priority Badge */}
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full ${conf.bg} ${conf.text}`}>
                  <Icon className="text-sm" /> {dec.priority}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">#{i + 1}</span>
              </div>

              {/* Main content */}
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-1">{dec.recommendation}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase tracking-wider">{dec.strategicImpact || 'Operational Excellence'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 uppercase tracking-wider">Est. ROI: {dec.roi || 'Medium'}</span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Business Context & Risk Assessment</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{dec.reason}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white">
                  <div className="border-l-2 border-gray-200 pl-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Asset Portfolio</div>
                    <div className="text-sm font-bold text-gray-800">{dec.project}</div>
                  </div>
                  <div className="border-l-2 border-gray-200 pl-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Location / Zone</div>
                    <div className="text-sm font-mono font-bold text-gray-800">{dec.chainage}</div>
                  </div>
                  <div className="border-l-2 border-gray-200 pl-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Asset Category</div>
                    <div className="text-sm font-bold text-gray-800">{dec.category}</div>
                  </div>
                  <div className="border-l-2 border-gray-200 pl-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Operational Impact</div>
                    <div className="text-sm font-bold text-green-700">{dec.estimatedImpact}</div>
                  </div>
                </div>
              </div>

              {/* Benefit & Action */}
              <div className="flex flex-col gap-3 min-w-[240px] max-w-[280px]">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <div className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Strategic Value Delivery</div>
                  </div>
                  <p className="text-xs text-green-900 font-medium leading-relaxed">{dec.expectedBenefit}</p>
                </div>
                <button className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm">
                  Approve Initiative
                </button>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExecutiveDecisionCenter;
