import React from 'react';
import { MdNetworkCheck, MdDomainVerification, MdOutlineWarningAmber, MdTimeline, MdStarRate, MdImage, MdOutlineRoute } from 'react-icons/md';

const KPICard = ({ title, value, subtitle, icon: Icon, color = 'green' }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-600`}></div>
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-widest">{title}</h3>
      <div className={`p-2 bg-${color}-50 text-${color}-600 rounded-lg`}>
        <Icon className="text-xl" />
      </div>
    </div>
    <div className="mt-auto">
      <span className="text-3xl font-black text-gray-900 tracking-tight">{value}</span>
      {subtitle && <p className="text-sm text-gray-400 mt-1 font-medium">{subtitle}</p>}
    </div>
  </div>
);

const GlobalHealth = ({ data }) => {
  if (!data) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-green-600 rounded-full block"></span>
        Global Network Health
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
          <KPICard 
            title="Overall Network Health" 
            value={`${data.networkHealth || 0}%`}
            subtitle="Weighted average across all regions"
            icon={MdNetworkCheck}
            color="green"
          />
        </div>
        
        <KPICard 
          title="Projects Healthy" 
          value={data.activeProjects || 0}
          subtitle="Currently active projects"
          icon={MdDomainVerification}
          color="blue"
        />
        
        <KPICard 
          title="Critical Issues" 
          value={data.criticalIssues || 0}
          subtitle="Requires immediate attention"
          icon={MdOutlineWarningAmber}
          color="red"
        />
        
        <KPICard 
          title="Inspection Progress" 
          value={`${data.inspectionProgress || 0}%`}
          subtitle="Cycle completion rate"
          icon={MdTimeline}
          color="indigo"
        />
        
        <KPICard 
          title="Average Rating" 
          value={data.averageRating || '0.0'}
          subtitle="Out of 10.0"
          icon={MdStarRate}
          color="yellow"
        />
        
        <KPICard 
          title="Images Captured" 
          value={(data.totalImages || 0).toLocaleString()}
          subtitle="Visual evidence database"
          icon={MdImage}
          color="teal"
        />
        
        <KPICard 
          title="Total Data Points" 
          value={(data.totalQuestions || 0).toLocaleString()}
          subtitle="Evaluations completed"
          icon={MdOutlineRoute}
          color="gray"
        />
      </div>
    </div>
  );
};

export default GlobalHealth;
