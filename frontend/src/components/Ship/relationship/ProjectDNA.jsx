import React from 'react';
import { MdThumbUp, MdThumbDown, MdWarning, MdStar, MdTrendingUp, MdCheckCircle } from 'react-icons/md';

const StatRow = ({ label, value, sub, color = 'gray' }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <div className="text-right">
      <span className={`text-sm font-black text-${color}-700`}>{value}</span>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

const CategoryPill = ({ name, rating, positive }) => (
  <div className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${
    positive
      ? 'bg-green-50 border-green-200'
      : 'bg-red-50 border-red-200'
  }`}>
    <span className={`font-semibold ${positive ? 'text-green-800' : 'text-red-800'}`}>{name}</span>
    <span className={`font-black ${positive ? 'text-green-600' : 'text-red-600'}`}>{rating}/10</span>
  </div>
);

const ProjectDNA = ({ data }) => {
  if (!data) return null;

  const healthColor = data.averageRating >= 8 ? 'green' :
                      data.averageRating >= 5 ? 'yellow' : 'red';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Core Vitals Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <MdStar className="text-green-600 text-xl" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">Project Vitals</h4>
            <p className="text-xs text-gray-400">{data.projectCode}</p>
          </div>
        </div>
        <StatRow label="Average Rating" value={`${data.averageRating}/10`} color={healthColor} />
        <StatRow label="Inspection Completion" value={`${data.inspectionCompletion}%`} color="blue" />
        <StatRow label="Asset Categories" value={data.totalCategories} />
        {data.mostCriticalAsset && (
          <StatRow
            label="Most Critical"
            value={data.mostCriticalAsset.name}
            sub={`Avg ${data.mostCriticalAsset.avgRating}/10`}
            color="red"
          />
        )}
        {data.bestPerformingAsset && (
          <StatRow
            label="Best Performing"
            value={data.bestPerformingAsset.name}
            sub={`Avg ${data.bestPerformingAsset.avgRating}/10`}
            color="green"
          />
        )}
      </div>

      {/* Strengths Card */}
      <div className="bg-white rounded-xl border border-green-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <MdThumbUp className="text-green-600 text-xl" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">Primary Strengths</h4>
            <p className="text-xs text-gray-400">Categories with avg rating ≥ 8.0</p>
          </div>
        </div>
        {data.strengths && data.strengths.length > 0 ? (
          <div className="space-y-2">
            {data.strengths.map((s, i) => (
              <CategoryPill key={i} name={s.name} rating={s.avgRating} positive={true} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No categories have average rating ≥ 8.0 yet.</p>
        )}
      </div>

      {/* Weaknesses Card */}
      <div className="bg-white rounded-xl border border-red-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-red-50 rounded-lg">
            <MdThumbDown className="text-red-500 text-xl" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">Primary Weaknesses</h4>
            <p className="text-xs text-gray-400">Categories with avg rating &lt; 6.0</p>
          </div>
        </div>
        {data.weaknesses && data.weaknesses.length > 0 ? (
          <div className="space-y-2">
            {data.weaknesses.map((w, i) => (
              <CategoryPill key={i} name={w.name} rating={w.avgRating} positive={false} />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <MdCheckCircle />
            No weaknesses detected — all categories above 6.0.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDNA;
