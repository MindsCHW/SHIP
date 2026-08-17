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
            (() => {
              // Calculate exactly how many underlying Master List parameters are DAY vs NIGHT
              let dayQuestionsCount = 0;
              let nightQuestionsCount = 0;
              let dayTasksCount = 0;
              let nightTasksCount = 0;
              let bothTasksCount = 0;

              if (batch.tasks) {
                batch.tasks.forEach(task => {
                  if (task.imageRequirement === 'DAY') dayTasksCount++;
                  else if (task.imageRequirement === 'NIGHT') nightTasksCount++;
                  else if (task.imageRequirement === 'BOTH') bothTasksCount++;

                  if (task.parameters && task.parameters.length > 0) {
                    task.parameters.forEach(p => {
                      if (p.imageRequirement === 'NIGHT') {
                        nightQuestionsCount++;
                      } else {
                        dayQuestionsCount++;
                      }
                    });
                  } else if (task.ratings && task.ratings.length > 0) {
                    task.ratings.forEach(p => {
                      if (task.imageRequirement === 'NIGHT') {
                        nightQuestionsCount++;
                      } else {
                        dayQuestionsCount++;
                      }
                    });
                  }
                });
              }

              return (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Project</p>
                      <p className="text-lg font-bold text-gray-800 truncate">{batch.project}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Strategy</p>
                      <p className="text-lg font-bold text-gray-800">{batch.samplingStrategy}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Sampled Qs</p>
                      <p className="text-xl font-black text-blue-700">{batch.selectedQuestionsCount}</p>
                      <p className="text-[10px] font-medium text-blue-500 mt-0.5">out of {batch.totalMasterQuestions}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">Chainages</p>
                      <p className="text-xl font-black text-purple-700">{batch.uniqueChainagesCount}</p>
                      <p className="text-[10px] font-medium text-purple-500 mt-0.5">Locations</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10 text-orange-600">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                      </div>
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1 z-10">Day Images</p>
                      <p className="text-xl font-black text-orange-700 z-10">{dayQuestionsCount}</p>
                      <p className="text-[10px] font-medium text-orange-600 mt-0.5 z-10">{dayTasksCount} Tasks (+{bothTasksCount} Mixed)</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10 text-indigo-600">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                      </div>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1 z-10">Night Images</p>
                      <p className="text-xl font-black text-indigo-700 z-10">{nightQuestionsCount}</p>
                      <p className="text-[10px] font-medium text-indigo-600 mt-0.5 z-10">{nightTasksCount} Tasks (+{bothTasksCount} Mixed)</p>
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
                          <th className="px-4 py-3 font-medium max-w-[200px]">Extraction Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {batch.tasks?.slice(0, 50).map(task => (
                          <tr key={task._id}>
                            <td className="px-4 py-2 font-medium">{task.chainage}</td>
                            <td className="px-4 py-2 text-gray-600">{task.parameters?.[0]?.category || 'Roadway'}</td>
                            <td className="px-4 py-2 text-gray-600">{task.parameters?.[0]?.assetType || task.assetType || 'N/A'}</td>
                            <td className="px-4 py-2">
                              {task.imageRequirement === 'BOTH' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                                  DAY/NIGHT
                                </span>
                              ) : (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.imageRequirement === 'NIGHT' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {task.imageRequirement || 'DAY'}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600 font-bold">{task.parameters?.length || task.ratings?.length || 0} Params</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.status === 'EXTRACTION_FAILED' ? 'bg-red-100 text-red-700' : task.status === 'READY_FOR_REVIEW' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs text-red-500 max-w-[200px] truncate" title={task.extractionDiagnostics?.failureReason}>
                              {task.extractionDiagnostics?.failureReason || '-'}
                            </td>
                          </tr>
                        ))}
                        {batch.tasks?.length === 0 && (
                          <tr><td colSpan="7" className="text-center py-4 text-gray-500">No tasks generated.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchSummaryModal;
