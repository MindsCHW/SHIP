import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { MdSearch, MdFilterList, MdOutlineVisibility, MdCheckCircle, MdCancel } from 'react-icons/md';
import ImageReviewDetailModal from './ImageReview/components/ImageReviewDetailModal';

const ImageReviewPage = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/image-review/batches');
      setBatches(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch batches for review');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBatch = async (batchId) => {
    try {
      await api.post(`/image-review/batches/${batchId}/approve`);
      fetchBatches();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve batch. Ensure all tasks are approved.');
    }
  };

  const handleRejectBatch = async (batchId) => {
    if (!window.confirm('Are you sure you want to reject this batch?')) return;
    try {
      await api.post(`/image-review/batches/${batchId}/reject`);
      fetchBatches();
    } catch (err) {
      alert('Failed to reject batch');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Image Review</h1>
                <p className="text-sm text-gray-500 mt-1">Review extracted images before they are available for rating.</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">BATCH ID</th>
                      <th className="px-6 py-4 font-medium">PROJECT</th>
                      <th className="px-6 py-4 font-medium text-center">TOTAL QS</th>
                      <th className="px-6 py-4 font-medium text-center">UNIQUE CHAINAGES</th>
                      <th className="px-6 py-4 font-medium">DATE CREATED</th>
                      <th className="px-6 py-4 font-medium">STATUS</th>
                      <th className="px-6 py-4 font-medium text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          Loading batches...
                        </td>
                      </tr>
                    ) : (batches || []).length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          No batches currently waiting for image review.
                        </td>
                      </tr>
                    ) : (
                      (batches || []).map(batch => (
                        <tr key={batch._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{batch.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{batch.project}</td>
                          <td className="px-6 py-4 text-gray-600 text-center">{batch.totalMasterQuestions}</td>
                          <td className="px-6 py-4 text-gray-600 text-center">{batch.uniqueChainagesCount}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(batch.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              {batch.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button 
                                onClick={() => { setSelectedBatch(batch); setIsModalOpen(true); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                              >
                                <MdOutlineVisibility className="text-lg" /> View Images
                              </button>
                              {batch.status === 'READY_FOR_REVIEW' && (
                                <>
                                  <button 
                                    onClick={() => handleApproveBatch(batch._id)}
                                    className="text-blue-600 hover:text-blue-700 transition-colors"
                                    title="Approve Batch"
                                  >
                                    <MdCheckCircle className="text-2xl" />
                                  </button>
                                  <button 
                                    onClick={() => handleRejectBatch(batch._id)}
                                    className="text-red-500 hover:text-red-600 transition-colors"
                                    title="Reject Batch"
                                  >
                                    <MdCancel className="text-2xl" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && selectedBatch && (
        <ImageReviewDetailModal 
          batch={selectedBatch} 
          onClose={() => { setIsModalOpen(false); fetchBatches(); }} 
        />
      )}
    </div>
  );
};

export default ImageReviewPage;
