import React from 'react';
import { motion } from 'framer-motion';
import { MdTrendingUp, MdCheckCircle, MdWarning, MdShowChart } from 'react-icons/md';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const KPICard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const ExecutiveOverview = ({ data }) => {
  if (!data) return null;

  const healthData = [
    { name: 'Healthy', value: data.networkHealth },
    { name: 'Risk', value: 100 - data.networkHealth }
  ];

  return (
    <div className="space-y-6">
      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Network Health"
          value={`${data.networkHealth}%`}
          subtitle="Overall infrastructure condition"
          icon={MdShowChart}
          colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600"
        />
        <KPICard
          title="Active Projects"
          value={data.activeProjects}
          subtitle={`Out of ${data.totalProjects} total projects`}
          icon={MdTrendingUp}
          colorClass="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <KPICard
          title="Critical Issues"
          value={data.criticalIssues}
          subtitle="Requiring immediate attention"
          icon={MdWarning}
          colorClass="bg-gradient-to-br from-red-400 to-red-600"
        />
        <KPICard
          title="Inspection Progress"
          value={`${data.inspectionProgress}%`}
          subtitle={`${data.totalImages.toLocaleString()} images extracted`}
          icon={MdCheckCircle}
          colorClass="bg-gradient-to-br from-indigo-400 to-indigo-600"
        />
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">System Volume</h3>
          <div className="grid grid-cols-3 gap-6 text-center divide-x divide-gray-100">
            <div>
              <p className="text-sm text-gray-500">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{data.totalAssets.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{data.totalQuestions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{data.averageRating} / 10</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-gray-900 mb-4 w-full text-left">Health Index</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f3f4f6" />
                </Pie>
                <RechartsTooltip cursor={{fill: 'transparent'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none mt-6">
             <span className="text-3xl font-bold text-gray-900">{data.networkHealth}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveOverview;
