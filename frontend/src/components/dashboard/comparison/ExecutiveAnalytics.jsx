import React from 'react';
import { MdArrowUpward, MdArrowDownward, MdRemove } from 'react-icons/md';

const StatCard = ({ title, valueA, valueB, diff, unit = '', isPositiveGood = true }) => {
  let status = 'unchanged';
  if (diff > 0) status = 'up';
  else if (diff < 0) status = 'down';

  // Determine colors based on whether positive is good (e.g. Rating) or bad (e.g. Critical Issues)
  let diffColor = 'text-gray-500 bg-gray-100';
  let Icon = MdRemove;

  if (status === 'up') {
    Icon = MdArrowUpward;
    diffColor = isPositiveGood ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100';
  } else if (status === 'down') {
    Icon = MdArrowDownward;
    diffColor = isPositiveGood ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100';
  }

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(1);
    }
    return val;
  };

  const diffAbs = Math.abs(diff);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <h4 className="text-gray-500 font-bold text-xs uppercase tracking-wide mb-3">{title}</h4>
      
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-gray-900">{formatValue(valueB)}</span>
          <span className="text-sm font-medium text-gray-500">{unit}</span>
        </div>
        
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${diffColor}`}>
          <Icon className="w-4 h-4" />
          <span>{formatValue(diffAbs)}{unit}</span>
        </div>
      </div>
      
      <div className="text-xs font-medium text-gray-400 bg-gray-50 rounded-lg p-2 border border-gray-100">
        Previous: <span className="text-gray-600">{formatValue(valueA)}{unit}</span>
      </div>
    </div>
  );
};

const ExecutiveAnalytics = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider">Executive Comparison Analytics</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Overall Rating" 
          valueA={analytics.overallRatingA} 
          valueB={analytics.overallRatingB} 
          diff={analytics.overallRatingDiff}
          unit="%"
          isPositiveGood={true}
        />
        
        <StatCard 
          title="Critical Issues" 
          valueA={analytics.criticalA} 
          valueB={analytics.criticalB} 
          diff={analytics.criticalDiff}
          isPositiveGood={false}
        />
        
        <StatCard 
          title="Perfect 10 Ratings" 
          valueA={analytics.perfect10A} 
          valueB={analytics.perfect10B} 
          diff={analytics.perfect10Diff}
          isPositiveGood={true}
        />
        
        <StatCard 
          title="Average Question Rating" 
          valueA={analytics.averageRatingA} 
          valueB={analytics.averageRatingB} 
          diff={analytics.averageRatingDiff}
          isPositiveGood={true}
        />
        
        <StatCard 
          title="Completed Questions" 
          valueA={analytics.completedA} 
          valueB={analytics.completedB} 
          diff={analytics.completedDiff}
          isPositiveGood={true}
        />
        
        <StatCard 
          title="Skipped Questions" 
          valueA={analytics.skippedA} 
          valueB={analytics.skippedB} 
          diff={analytics.skippedDiff}
          isPositiveGood={false} // usually less skips is better
        />
      </div>
    </div>
  );
};

export default ExecutiveAnalytics;
