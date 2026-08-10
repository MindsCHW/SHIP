import React from 'react';
import { MdInsertPhoto, MdMap, MdStars, MdWarning, MdAssessment, MdArrowUpward, MdArrowDownward } from 'react-icons/md';

const KPIBox = ({ title, previous, current, diff, unit = '', isPositiveGood = true, icon }) => {
  const isUp = diff > 0;
  const isDown = diff < 0;
  
  let statusColor = 'text-gray-500 bg-gray-100';
  let diffIcon = null;

  if (isUp) {
    statusColor = isPositiveGood ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100';
    diffIcon = <MdArrowUpward className="w-4 h-4" />;
  } else if (isDown) {
    statusColor = isPositiveGood ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100';
    diffIcon = <MdArrowDownward className="w-4 h-4" />;
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">{icon}</div>
      </div>
      
      {diff !== undefined ? (
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Previous</p>
              <p className="text-xl font-bold text-gray-700">{previous}{unit}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 text-right">Current</p>
              <p className="text-2xl font-black text-gray-900">{current}{unit}</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Difference</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-bold ${statusColor}`}>
              {diffIcon}
              <span>{diff > 0 ? '+' : ''}{diff}{unit}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-4xl font-black text-blue-600">{current}</p>
        </div>
      )}
    </div>
  );
};

const ComparisonKPIs = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider border-b border-gray-100 pb-3">Section 1: Executive Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <KPIBox 
          title="Overall Rating" 
          previous={data.overallRatingA} 
          current={data.overallRatingB} 
          diff={data.overallRatingDiff} 
          unit="%" 
          isPositiveGood={true}
          icon={<MdAssessment className="w-6 h-6 text-indigo-500" />}
        />
        <KPIBox 
          title="Critical Issues" 
          previous={data.criticalA} 
          current={data.criticalB} 
          diff={data.criticalDiff} 
          isPositiveGood={false}
          icon={<MdWarning className="w-6 h-6 text-red-500" />}
        />
        <KPIBox 
          title="Perfect 10 Ratings" 
          previous={data.perfect10A} 
          current={data.perfect10B} 
          diff={data.perfect10Diff} 
          unit="%" 
          isPositiveGood={true}
          icon={<MdStars className="w-6 h-6 text-amber-500" />}
        />
        <KPIBox 
          title="Images Compared" 
          current={data.imagesCompared} 
          icon={<MdInsertPhoto className="w-6 h-6 text-blue-500" />}
        />
        <KPIBox 
          title="Chainages Compared" 
          current={data.chainagesCompared} 
          icon={<MdMap className="w-6 h-6 text-emerald-500" />}
        />
      </div>
    </div>
  );
};

export default ComparisonKPIs;
