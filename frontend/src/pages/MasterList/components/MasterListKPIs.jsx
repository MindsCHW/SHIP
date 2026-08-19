import React from 'react';
import { MdOutlineLibraryBooks, MdOutlineBusiness, MdOutlineCategory, MdOutlineLayers, MdOutlineAnalytics } from 'react-icons/md';

const MasterListKPIs = ({ stats }) => {
  const kpis = [
    { title: 'Total Questions', value: stats?.totalQuestions || 0, icon: MdOutlineLibraryBooks, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Projects', value: stats?.totalProjects || 0, icon: MdOutlineBusiness, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Categories', value: stats?.totalCategories || 0, icon: MdOutlineCategory, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Asset Types', value: stats?.totalAssetTypes || 0, icon: MdOutlineLayers, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Parameters', value: stats?.totalParameters || 0, icon: MdOutlineAnalytics, color: 'text-rose-600', bg: 'bg-rose-50' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 line-clamp-1">{kpi.title}</span>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <Icon className={`text-lg ${kpi.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {kpi.value.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MasterListKPIs;
