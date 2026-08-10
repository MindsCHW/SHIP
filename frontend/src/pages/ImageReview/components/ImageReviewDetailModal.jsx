import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { MdClose, MdCheckCircle, MdCancel, MdRefresh, MdImage } from 'react-icons/md';

const ImageReviewDetailModal = ({ batch, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/image-review/batches/${batch._id}/tasks`);
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch images for review');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      await api.put(`/image-review/tasks/${taskId}`, { status });
      // Update local state
      setTasks(tasks.map(t => {
        if (t._id === taskId) {
          return { ...t, status, imageApproved: status === 'READY_FOR_RATING' };
        }
        return t;
      }));
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleReprocess = async (taskId) => {
    // Stub for reprocessing a single chainage
    alert('Reprocess triggered for task: ' + taskId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Review Images: {batch.name}</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              Verify extracted images before approving the batch.
              {tasks.length > 0 && (
                <>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md font-bold text-xs">
                    {tasks.length} {tasks.length === 1 ? 'Image' : 'Images'}
                  </span>
                  {tasks.filter(t => t.imageApproved).length > 0 && (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-md font-bold text-xs">
                      {tasks.filter(t => t.imageApproved).length} Approved
                    </span>
                  )}
                  {tasks.filter(t => t.status === 'EXTRACTION_FAILED' || t.status === 'FAILED').length > 0 && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-md font-bold text-xs">
                      {tasks.filter(t => t.status === 'EXTRACTION_FAILED' || t.status === 'FAILED').length} Failed
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading images...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No images found for this batch.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <div key={task._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                  
                  {/* Image Container */}
                  <div className="relative aspect-video bg-gray-100 flex items-center justify-center group overflow-hidden">
                    {task.image?.cloudinaryUrl ? (
                      <img 
                        src={task.image.cloudinaryUrl} 
                        alt={`Chainage ${task.chainage}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <MdImage className="text-4xl mb-2" />
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 z-10">
                      {task.imageApproved ? (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded shadow-sm">Approved</span>
                      ) : task.status === 'EXTRACTION_FAILED' ? (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded shadow-sm">Failed</span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded shadow-sm">Pending</span>
                      )}
                    </div>

                    {/* Context Thumbnails */}
                    {(task.image?.previousUrl || task.image?.nextUrl) && (
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between px-2 pointer-events-none">
                        {task.image?.previousUrl && (
                          <div className="w-16 h-12 rounded border border-white shadow-md overflow-hidden bg-black/50 pointer-events-auto cursor-help group/thumb" title="-10m Context">
                            <img src={task.image.previousUrl} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" alt="Previous 10m" />
                          </div>
                        )}
                        {task.image?.nextUrl && (
                          <div className="w-16 h-12 rounded border border-white shadow-md overflow-hidden bg-black/50 pointer-events-auto cursor-help group/thumb ml-auto" title="+10m Context">
                            <img src={task.image.nextUrl} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" alt="Next 10m" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col text-sm">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
                      <div><span className="text-gray-500">Chainage:</span> <strong className="text-gray-900">{task.chainage}</strong></div>
                      <div><span className="text-gray-500">Params:</span> <strong className="text-gray-900">{task.parameters?.length || 0}</strong></div>
                      <div><span className="text-gray-500">Road Type:</span> <strong className="text-gray-900">{task.roadType || '-'}</strong></div>
                      <div>
                        <span className="text-gray-500">Img Req:</span>{' '}
                        <strong className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${task.imageRequirement === 'NIGHT' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                          {task.imageRequirement || 'DAY'}
                        </strong>
                      </div>
                      <div className="col-span-2 text-xs text-gray-500 truncate">
                        {task.metadata?.extractedAt || 'Unknown Timestamp'}
                      </div>
                      {task.status === 'EXTRACTION_FAILED' && task.extractionDiagnostics?.failureReason && (
                        <div className="col-span-2 mt-2 p-2 bg-red-50 text-red-600 rounded text-xs border border-red-100 whitespace-pre-wrap break-words">
                          <span className="font-semibold block mb-1">Failure Reason:</span>
                          {task.extractionDiagnostics.failureReason}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    {batch.status === 'READY_FOR_REVIEW' && (
                      <div className="mt-auto grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                        <button 
                          onClick={() => handleUpdateStatus(task._id, 'READY_FOR_RATING')}
                          className={`flex flex-col items-center justify-center py-2 rounded transition-colors ${task.imageApproved ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                          <MdCheckCircle className="text-xl mb-1" />
                          <span className="text-xs font-medium">Approve</span>
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(task._id, 'FAILED')}
                          className={`flex flex-col items-center justify-center py-2 rounded transition-colors ${task.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                          <MdCancel className="text-xl mb-1" />
                          <span className="text-xs font-medium">Reject</span>
                        </button>
                        <button 
                          onClick={() => handleReprocess(task._id)}
                          className="flex flex-col items-center justify-center py-2 rounded hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                          <MdRefresh className="text-xl mb-1" />
                          <span className="text-xs font-medium">Reprocess</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageReviewDetailModal;
