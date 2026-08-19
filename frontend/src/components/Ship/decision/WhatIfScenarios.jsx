import React, { useState } from 'react';
import { MdTrendingUp, MdArrowForward, MdCheckCircle } from 'react-icons/md';

const ICON_MAP = {
  water: '💧',
  clipboard: '📋',
  wrench: '🔧',
};

const WhatIfScenarios = ({ data }) => {
  const [active, setActive] = useState(null);

  if (!data || data.length === 0) return <div className="text-center text-sm text-gray-400 py-6">No scenarios available.</div>;

  return (
    <div className="space-y-4">
      {data.map((scenario, i) => {
        const isOpen = active === i;
        return (
          <div key={i} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ${isOpen ? 'border-green-400 shadow-md' : 'border-gray-200'}`}>
            <button
              className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              onClick={() => setActive(isOpen ? null : i)}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl" aria-hidden>{ICON_MAP[scenario.icon] || '⚡'}</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{scenario.label}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{scenario.assumptions.join(' · ')}</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isOpen ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {isOpen ? 'Close' : 'Simulate →'}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 p-5 bg-gradient-to-br from-green-50/50 to-white">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <MdTrendingUp className="text-green-600" /> Projected Improvements
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {scenario.projections.map((proj, j) => (
                    <div key={j} className="bg-white border border-green-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <MdCheckCircle className="text-green-500 text-base shrink-0" />
                        <span className="font-bold text-gray-900 text-sm">{proj.metric}</span>
                      </div>
                      <div className="text-lg font-black text-green-700 mb-1">{proj.improvement}</div>
                      <p className="text-xs text-gray-500 leading-relaxed">{proj.rationale}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400">
                  ℹ These are rule-based projections derived from asset dependency analysis. Not AI-generated predictions.
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WhatIfScenarios;
