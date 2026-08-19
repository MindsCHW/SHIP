import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat, MdOutlineDomain } from 'react-icons/md';

const ProjectIntelligence = ({ projects }) => {
  if (!projects || projects.length === 0) return null;

  // Sort by health score descending
  const sortedProjects = [...projects].sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0));

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <MdTrendingUp className="text-green-500 text-xl" />;
    if (trend === 'down') return <MdTrendingDown className="text-red-500 text-xl" />;
    return <MdTrendingFlat className="text-gray-400 text-xl" />;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'excellent':
      case 'good':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'needs attention':
      case 'warning':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'critical':
      case 'poor':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-green-600 rounded-full block"></span>
        Project Intelligence
      </h2>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-widest text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Project Name</th>
                <th className="px-6 py-4 font-bold text-center">Health Score</th>
                <th className="px-6 py-4 font-bold text-center">Average Rating</th>
                <th className="px-6 py-4 font-bold text-center">Critical Issues</th>
                <th className="px-6 py-4 font-bold text-center">Trend</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedProjects.map((project, idx) => (
                <tr key={project.id || idx} className="hover:bg-green-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded text-gray-400 border border-gray-100">
                        <MdOutlineDomain className="text-lg" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{project.name || project.code}</p>
                        <p className="text-xs font-mono text-gray-500 mt-0.5">{project.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="font-black text-lg text-gray-800">{project.healthScore || 0}</span>
                    <span className="text-gray-400 text-xs ml-1">/ 100</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-gray-700">
                    {project.averageRating || '0.0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`font-bold ${project.criticalIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {project.criticalIssues || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center">
                      {getTrendIcon(project.trend)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(project.healthStatus || 'Healthy')}`}>
                      {project.healthStatus || 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectIntelligence;
