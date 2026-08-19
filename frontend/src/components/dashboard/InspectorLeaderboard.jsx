import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdStar, MdCheckCircle } from 'react-icons/md';

const InspectorLeaderboard = ({ selectedProject }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    import('../../services/dashboard.service').then(({ dashboardService }) => {
      dashboardService.getInspectorLeaderboard(selectedProject || '').then(res => {
        setData(Array.isArray(res) ? res : (res.data || []));
      }).catch(console.error);
    });
  }, [selectedProject]);

  return (
    <div className="bg-white border border-borderColor rounded-xl p-5 shadow-sm h-full">
      <h3 className="text-gray-700 font-bold text-sm tracking-wide mb-4 uppercase flex justify-between items-center">
        <span>Top Inspectors</span>
      </h3>
      
      {data.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No data available</div>
      ) : (
        <div className="space-y-4">
          {data.map((inspector, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                  index === 1 ? 'bg-gray-200 text-gray-700' : 
                  index === 2 ? 'bg-orange-100 text-orange-700' : 
                  'bg-blue-50 text-blue-600'
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">{inspector.name || 'Unknown'}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MdCheckCircle className="text-green-500" /> {inspector.inspections} Inspections
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 font-bold text-gray-800">
                  <MdStar className="text-yellow-400" />
                  {inspector.avgScore}
                </div>
                <div className="text-[10px] text-gray-400 font-medium">Avg Score</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InspectorLeaderboard;
