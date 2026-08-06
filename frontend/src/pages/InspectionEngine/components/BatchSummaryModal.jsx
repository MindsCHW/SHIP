import React, { useState, useEffect } from 'react';
import { MdClose, MdRefresh } from 'react-icons/md';
import { inspectionEngineService } from '../../../services/inspectionEngine.service';

const BatchSummaryModal = ({ batchId, onClose }) => {
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [batchId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await inspectionEngineService.getBatchDetails(batchId);
      setBatch(res.data || res);
    } catch (err) {
      setError(err.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  if (!batchId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Inspection Batch Details</h3>
            <p className="text-sm text-gray-500">{batch?.name || 'Loading...'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchDetails} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <MdRefresh size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
              <MdClose size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-8">{error}</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Project</p>
                  <p className="text-xl font-bold text-gray-800">{batch.project}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Strategy</p>
                  <p className="text-xl font-bold text-gray-800">{batch.samplingStrategy} ({batch.samplingPercentage}%)</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Sampled Qs</p>
                  <p className="text-2xl font-bold text-blue-700">{batch.selectedQuestionsCount}</p>
                  <p className="text-xs text-blue-500 mt-1">out of {batch.totalMasterQuestions} Master Qs</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Unique Chainages</p>
                  <p className="text-2xl font-bold text-purple-700">{batch.uniqueChainagesCount}</p>
                  <p className="text-xs text-purple-500 mt-1">Extracted for imaging</p>
                </div>
              </div>

              {/* Tasks Preview */}
              <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Sampled Tasks Preview (First 50)</h4>
              <div className="bg-white border border-gray-100 rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Chainage</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Asset Type</th>
                      <th className="px-4 py-3 font-medium">Image Req</th>
                      <th className="px-4 py-3 font-medium">Questions</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batch.tasks?.slice(0, 50).map(task => (
                      <tr key={task._id}>
                        <td className="px-4 py-2 font-medium">{task.chainage}</td>
                        <td className="px-4 py-2 text-gray-600">{task.parameters?.[0]?.category || 'N/A'}</td>
                        <td className="px-4 py-2 text-gray-600">{task.parameters?.[0]?.assetType || 'N/A'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.imageRequirement === 'NIGHT' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                            {task.imageRequirement || 'DAY'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-600 font-bold">{task.parameters?.length || 0} Params</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700">
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {batch.tasks?.length === 0 && (
                      <tr><td colSpan="6" className="text-center py-4 text-gray-500">No tasks generated.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchSummaryModal;
