import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdWarning, MdPendingActions } from 'react-icons/md';

const RecentActivityTimeline = ({ selectedProject }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    import('../../services/dashboard.service').then(({ dashboardService }) => {
      dashboardService.getRecentActivity(selectedProject || '').then(res => {
        setData(Array.isArray(res) ? res : (res.data || []));
      }).catch(console.error);
    });
  }, [selectedProject]);

  return (
    <div className="bg-white border border-borderColor rounded-xl p-5 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-700 font-bold text-sm tracking-wide uppercase">Recent Activity</h3>
        <span className="text-xs text-primary font-medium cursor-pointer hover:underline">View Full Log</span>
      </div>

      {data.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No recent activity</div>
      ) : (
        <div className="relative border-l border-gray-200 ml-3 space-y-6">
          {data.map((activity, index) => {
            const isCritical = activity.score <= 5;
            
            return (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-6 group"
              >
                {/* Timeline dot */}
                <div className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                  isCritical ? 'bg-red-500' : 'bg-green-500'
                }`}>
                </div>

                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      {activity.project} 
                      <span className="text-gray-400 font-normal text-xs">•</span>
                      <span className="text-xs font-normal text-gray-600">{activity.assetType}</span>
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-semibold">{activity.parameter}</span> rated <span className={`font-bold ${isCritical ? 'text-red-500' : 'text-green-500'}`}>{activity.score}</span> by {activity.actor}
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                    {new Date(activity.date).toLocaleString()}
                  </span>
                </div>
                
                <div className="mt-2 inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-gray-100 text-gray-600">
                  Chainage: {activity.chainage}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivityTimeline;
