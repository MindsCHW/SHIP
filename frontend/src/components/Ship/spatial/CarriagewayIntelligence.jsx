import React from 'react';
import { MdTrendingDown, MdOutlineVerticalSplit } from 'react-icons/md';

const CarriagewayCard = ({ title, data, isWorse }) => {
  const isNA = !data || data.avgRating === 'N/A';
  const score = isNA ? 0 : parseFloat(data.avgRating);
  const color = score >= 8 ? 'green' : score >= 5 ? 'yellow' : 'red';
  
  return (
    <div className={`flex-1 bg-white rounded-xl border ${isWorse ? 'border-orange-300 shadow-md ring-1 ring-orange-100' : 'border-gray-200 shadow-sm'} p-5 relative overflow-hidden`}>
      {isWorse && (
        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
          Higher Deterioration
        </div>
      )}
      <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <MdOutlineVerticalSplit /> {title} Carriageway
      </h3>
      <div className="flex items-end gap-3 mb-4">
        <div className={`text-4xl font-black ${isNA ? 'text-gray-300' : `text-${color}-600`}`}>
          {isNA ? 'N/A' : data.avgRating}
        </div>
        <div className="text-gray-400 text-sm font-medium pb-1">/ 10 avg rating</div>
      </div>
      
      <div className="space-y-2 mt-5">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-medium">Critical Issues</span>
          <span className={`font-black ${data?.critical > 0 ? 'text-red-600' : 'text-gray-900'}`}>{data?.critical || 0}</span>
        </div>
        <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-2">
          <span className="text-gray-600 font-medium">Total Observations</span>
          <span className="font-bold text-gray-900">{data?.total || 0}</span>
        </div>
      </div>
    </div>
  );
};

const CarriagewayIntelligence = ({ data }) => {
  if (!data || (!data.LHS && !data.RHS)) return null;

  const lhsScore = data.LHS?.avgRating !== 'N/A' ? parseFloat(data.LHS.avgRating) : 10;
  const rhsScore = data.RHS?.avgRating !== 'N/A' ? parseFloat(data.RHS.avgRating) : 10;
  
  const lhsWorse = lhsScore < rhsScore;
  const rhsWorse = rhsScore < lhsScore;

  return (
    <div className="flex flex-col sm:flex-row gap-5">
      <CarriagewayCard title="LHS" data={data.LHS} isWorse={lhsWorse} />
      <CarriagewayCard title="RHS" data={data.RHS} isWorse={rhsWorse} />
    </div>
  );
};

export default CarriagewayIntelligence;
