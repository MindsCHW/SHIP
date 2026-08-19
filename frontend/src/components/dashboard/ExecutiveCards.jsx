import React, { useEffect, useState } from 'react';
import { MdStar, MdFolder, MdListAlt, MdWarning, MdArrowDropUp, MdArrowDropDown } from 'react-icons/md';

const ExecutiveCards = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    import('../../services/dashboard.service').then(({ dashboardService }) => {
      dashboardService.getExecutiveKPIs().then(setData).catch(console.error);
    });
  }, []);

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      
      {/* Perfect 10 Ratings */}
      <div className="bg-white border border-gray-300 shadow-sm rounded flex flex-col p-3 relative h-full">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <MdStar className="text-yellow-400 text-lg" />
          <h3 className="text-gray-700 font-bold text-xs uppercase tracking-tight text-center leading-tight">Perfect 10 Ratings</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center mt-2">
          <span className="text-3xl font-bold text-green-600">{data.perfect10Percentage}%</span>
        </div>
        <div className="text-[10px] text-gray-500 font-medium text-center mt-2 border-t pt-1">
          Percentage of 10s
        </div>
      </div>

      {/* Total Projects */}
      <div className="bg-white border border-gray-300 shadow-sm rounded flex flex-col p-3 relative h-full">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <MdFolder className="text-yellow-500 text-lg" />
          <h3 className="text-gray-700 font-bold text-xs uppercase tracking-tight">Total Projects</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">{data.totalProjects}</span>
        </div>
        <div className="text-[10px] text-transparent font-medium text-center mt-2 border-t pt-1">
          -
        </div>
      </div>

      {/* Images Evaluated */}
      <div className="bg-white border border-gray-300 shadow-sm rounded flex flex-col p-3 relative h-full">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <MdListAlt className="text-pink-400 text-lg" />
          <h3 className="text-gray-700 font-bold text-[10px] uppercase tracking-tight text-center">Images Evaluated</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-blue-500">
            {data.ratedInspections >= 1000 
              ? (data.ratedInspections / 1000).toFixed(1) + 'K' 
              : data.ratedInspections}
          </span>
        </div>
        <div className="text-[10px] text-gray-500 font-medium text-center mt-2 border-t pt-1">
          By All Users
        </div>
      </div>

      {/* Critical Observations */}
      <div className="bg-white border border-gray-300 shadow-sm rounded flex flex-col p-3 relative h-full">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <MdWarning className="text-orange-400 text-lg" />
          <h3 className="text-gray-700 font-bold text-[10px] uppercase tracking-tight text-center">Critical Observations</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-red-500">{data.criticalObservations}</span>
        </div>
        <div className="text-[10px] text-gray-500 font-medium text-center mt-2 border-t pt-1">
          Ratings {'<='} 5
        </div>
      </div>

      {/* Green Rated Projects */}
      <div className="bg-white border border-gray-300 shadow-sm rounded flex flex-col p-3 relative h-full">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <h3 className="text-gray-700 font-bold text-xs uppercase tracking-tight text-center">Green Rated<br/>Projects</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center mt-1">
          <span className="text-3xl font-bold text-green-600">{data.greenRatedProjects}</span>
        </div>
        <div className="text-[10px] text-gray-500 font-medium text-center mt-2 border-t pt-1">
          Projects {'(Avg >= 7)'}
        </div>
      </div>

    </div>
  );
};

export default ExecutiveCards;
