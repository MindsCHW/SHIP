import React from 'react';
import { MdCategory } from 'react-icons/md';

const ProjectHealthRelationship = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <MdCategory className="text-green-600" />
          Primary Contributing Categories
        </h3>
      </div>
      <div className="space-y-3">
        {data.map((cat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-bold text-gray-800">{cat.name}</span>
                <span className={`ml-3 text-xs font-bold px-2 py-0.5 rounded ${
                  cat.averageRating < 5 ? 'bg-red-50 text-red-600' :
                  cat.averageRating < 8 ? 'bg-yellow-50 text-yellow-700' :
                  'bg-green-50 text-green-700'
                }`}>
                  {cat.averageRating} / 10
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-900">{cat.contribution}%</span>
                {cat.criticalCount > 0 && (
                  <p className="text-xs text-red-500 font-medium">{cat.criticalCount} critical</p>
                )}
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  cat.averageRating < 5 ? 'bg-red-500' :
                  cat.averageRating < 8 ? 'bg-yellow-400' :
                  'bg-green-500'
                }`}
                style={{ width: `${cat.contribution}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectHealthRelationship;
