import React, { useMemo } from 'react';
import { MdLightbulbOutline } from 'react-icons/md';

const ExecutiveInsights = ({ overview, projects, charts }) => {
  const insights = useMemo(() => {
    const list = [];
    
    // 1. Highest Rated Project
    if (projects && projects.length > 0) {
      const highest = [...projects].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))[0];
      if (highest && highest.averageRating > 0) {
        list.push({
          title: 'Top Performing Project',
          desc: `${highest.name} leads the network with an average rating of ${highest.averageRating}/10.`,
          color: 'green'
        });
      }

      // 2. Lowest Rated Project
      const lowest = [...projects].sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0))[0];
      if (lowest && lowest.averageRating > 0) {
        list.push({
          title: 'Attention Required',
          desc: `${lowest.name} currently has the lowest network rating at ${lowest.averageRating}/10.`,
          color: 'red'
        });
      }

      // 3. Project with Max Critical Observations
      const maxCritical = [...projects].sort((a, b) => (b.criticalIssues || 0) - (a.criticalIssues || 0))[0];
      if (maxCritical && maxCritical.criticalIssues > 0) {
        list.push({
          title: 'Highest Critical Volume',
          desc: `${maxCritical.name} reported ${maxCritical.criticalIssues} critical issues in the latest cycle.`,
          color: 'orange'
        });
      }
    }

    // 4. Most Critical Category
    if (charts && charts.radarData && charts.radarData.length > 0) {
      // Find category with lowest global average (B is score * 15 in radarData)
      const lowestCategory = [...charts.radarData].sort((a, b) => (a.B || 0) - (b.B || 0))[0];
      if (lowestCategory) {
        const rating = (lowestCategory.B / 15).toFixed(1);
        list.push({
          title: 'Most Critical Asset Class',
          desc: `${lowestCategory.subject} is the lowest performing category globally with an average rating of ${rating}.`,
          color: 'indigo'
        });
      }
    }

    return list;
  }, [overview, projects, charts]);

  if (insights.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-green-600 rounded-full block"></span>
        Executive Insights
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-start gap-4">
            <div className={`p-3 bg-${insight.color}-50 text-${insight.color}-600 rounded-lg shrink-0 mt-1`}>
              <MdLightbulbOutline className="text-2xl" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">{insight.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{insight.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveInsights;
