import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { 
  MdMap, MdStarRate, MdCheckCircle, MdPendingActions, 
  MdWarning, MdHealthAndSafety, MdTrendingUp, MdUpdate 
} from 'react-icons/md';

const sparklineData1 = [{v: 10},{v: 15},{v: 13},{v: 18},{v: 25},{v: 22},{v: 30}];
const sparklineData2 = [{v: 30},{v: 25},{v: 35},{v: 28},{v: 40},{v: 45},{v: 50}];
const sparklineData3 = [{v: 50},{v: 45},{v: 30},{v: 20},{v: 15},{v: 10},{v: 5}]; // going down

const KPICard = ({ item, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-borderColor rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden relative"
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${item.bg} text-xl shadow-inner`}>
          {item.icon}
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-full ${item.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {item.trend}
        </div>
      </div>
      
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{item.title}</h3>
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-black text-gray-800">{item.value}</h2>
      </div>

      <div className="h-10 w-full mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={item.sparkline}>
            <defs>
              <linearGradient id={`colorUv-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={item.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={item.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={item.color} strokeWidth={2} fillOpacity={1} fill={`url(#colorUv-${index})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

const KPICards = ({ selectedProject }) => {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    if (selectedProject) {
      import('../../services/dashboard.service').then(({ dashboardService }) => {
        dashboardService.getProjectKPIs(selectedProject).then(setData).catch(console.error);
      });
    }
  }, [selectedProject]);

  if (!data) return null;

  const kpiData = [
    { 
      title: 'Total Roads', value: data.totalRoads || 0, trend: 'N/A', isPositive: true, 
      icon: <MdMap className="text-blue-500" />, bg: 'bg-blue-50', 
      sparkline: data.sparklines?.totalRatings || sparklineData1, color: '#3b82f6'
    },
    { 
      title: 'Total Inspections', value: data.totalRatings || 0, trend: 'Live', isPositive: true, 
      icon: <MdStarRate className="text-indigo-500" />, bg: 'bg-indigo-50', 
      sparkline: data.sparklines?.totalRatings || sparklineData2, color: '#6366f1'
    },
    { 
      title: 'Completed Inspections', value: data.completedRatings || 0, trend: 'Live', isPositive: true, 
      icon: <MdCheckCircle className="text-green-500" />, bg: 'bg-green-50', 
      sparkline: data.sparklines?.completedRatings || sparklineData2, color: '#22c55e'
    },
    { 
      title: 'Pending Inspections', value: data.pendingRatings || 0, trend: 'Live', isPositive: true, 
      icon: <MdPendingActions className="text-orange-500" />, bg: 'bg-orange-50', 
      sparkline: data.sparklines?.pendingRatings || sparklineData3, color: '#f97316'
    },
    { 
      title: 'Critical Issues', value: data.criticalIssues || 0, trend: 'Alert', isPositive: false, 
      icon: <MdWarning className="text-red-500" />, bg: 'bg-red-50', 
      sparkline: data.sparklines?.criticalIssues || sparklineData1, color: '#ef4444'
    },
    { 
      title: 'Perfect 10 Ratings', value: `${data.perfect10Percentage || 0}%`, trend: 'Live', isPositive: true, 
      icon: <MdHealthAndSafety className="text-teal-500" />, bg: 'bg-teal-50', 
      sparkline: data.sparklines?.avgHealthScore || sparklineData2, color: '#14b8a6'
    },
    { 
      title: 'Monthly Progress', value: `${data.monthlyProgress || 0}%`, trend: 'Live', isPositive: true, 
      icon: <MdTrendingUp className="text-purple-500" />, bg: 'bg-purple-50', 
      sparkline: data.sparklines?.monthlyProgress || sparklineData1, color: '#a855f7'
    },
    { 
      title: 'Last Updated', value: data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : 'N/A', trend: 'Live', isPositive: true, 
      icon: <MdUpdate className="text-gray-500" />, bg: 'bg-gray-50', 
      sparkline: data.sparklines?.totalRatings || sparklineData1, color: '#6b7280'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {kpiData.map((item, index) => (
        <KPICard key={index} item={item} index={index} />
      ))}
    </div>
  );
};

export default KPICards;
