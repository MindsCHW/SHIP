import React from 'react';
import { MdDelete, MdVisibility } from 'react-icons/md';

const BatchListTable = ({ batches, loading, onDelete, onView }) => {
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[400px] items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-sm">Loading inspection batches...</p>
      </div>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[300px] items-center justify-center text-gray-500">
        <p>No inspection batches found. Generate one above.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'WAITING_FOR_IMAGES': return 'bg-yellow-100 text-yellow-700';
      case 'READY_FOR_REVIEW': return 'bg-orange-100 text-orange-700';
      case 'READY_FOR_RATING': return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700';
      case 'PROCESSING': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-4 font-medium">Batch Name</th>
              <th className="px-5 py-4 font-medium">Project</th>
              <th className="px-5 py-4 font-medium">Strategy</th>
              <th className="px-5 py-4 font-medium text-right">Master Qs</th>
              <th className="px-5 py-4 font-medium text-right">Sampled Qs</th>
              <th className="px-5 py-4 font-medium text-right">Unique Chainages</th>
              <th className="px-5 py-4 font-medium text-center">Status</th>
              <th className="px-5 py-4 font-medium">Created Date</th>
              <th className="px-5 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {batches.map((batch) => (
              <tr key={batch._id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-800">{batch.name}</td>
                <td className="px-5 py-3 text-gray-600 font-medium">{batch.project}</td>
                <td className="px-5 py-3 text-gray-600">
                  {batch.samplingStrategy} ({batch.samplingPercentage}%)
                </td>
                <td className="px-5 py-3 text-gray-600 text-right">{batch.totalMasterQuestions}</td>
                <td className="px-5 py-3 text-gray-800 font-bold text-right">{batch.selectedQuestionsCount}</td>
                <td className="px-5 py-3 text-gray-600 text-right">{batch.uniqueChainagesCount}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(batch.status)}`}>
                    {batch.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {new Date(batch.createdAt).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onView(batch)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="View Details"
                    >
                      <MdVisibility size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this batch?')) {
                          onDelete(batch._id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Delete Batch"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatchListTable;
