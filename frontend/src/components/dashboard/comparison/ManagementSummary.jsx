import React from 'react';
import { MdLightbulb, MdKeyboardArrowRight } from 'react-icons/md';

const ManagementSummary = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-xl shadow-lg border border-blue-800 p-8 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
          <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
            <MdLightbulb className="text-yellow-400 text-2xl" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-sm">
            Section 8: Management Insights
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-xl border border-white/10 backdrop-blur-sm">
              <MdKeyboardArrowRight className="text-blue-300 text-xl shrink-0 mt-0.5" />
              <p className="text-blue-50 font-medium leading-relaxed shadow-sm">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagementSummary;
