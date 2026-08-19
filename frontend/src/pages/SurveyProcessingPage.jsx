import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { MdOutlineVideoCameraFront, MdOutlineCloudUpload } from 'react-icons/md';
import { surveyProcessingService } from '../services/surveyProcessing.service';
import SurveyProcessingModal from './SurveyProcessing/components/SurveyProcessingModal';

const SurveyProcessingPage = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await surveyProcessingService.getPendingBatches();
      setBatches(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleProcessComplete = () => {
    setSelectedBatch(null);
    fetchBatches();
  };

  return (
    <Layout title="Survey Processing">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header section */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <MdOutlineVideoCameraFront className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Survey Processing</h1>
            <p className="text-sm text-gray-500">Upload survey videos to automatically extract and upload frame images for inspection batches.</p>
          </div>
        </div>

        {/* Batches Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-800">Pending Batches</h2>
            <div className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              {batches.length} Waiting
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Batch Name</th>
                  <th className="px-6 py-4 font-medium">Project</th>
                  <th className="px-6 py-4 font-medium">Strategy</th>
                  <th className="px-6 py-4 font-medium">Questions</th>
                  <th className="px-6 py-4 font-medium">Chainages</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      Loading pending batches...
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No inspection batches waiting for images.
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => (
                    <tr key={batch._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {batch.name}
                          {batch.status === 'FAILED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                              Failed
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{new Date(batch.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {batch.project}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {batch.samplingStrategy} ({batch.samplingPercentage}%)
                      </td>
                      <td className="px-6 py-4 text-gray-600">{batch.selectedQuestionsCount}</td>
                      <td className="px-6 py-4 text-gray-600">{batch.uniqueChainagesCount}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedBatch(batch)}
                          className={`inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors text-sm ${
                            batch.status === 'FAILED'
                              ? 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'
                          }`}
                        >
                          <MdOutlineCloudUpload className="text-lg" />
                          {batch.status === 'FAILED' ? 'Retry Upload' : 'Upload Video'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedBatch && (
          <SurveyProcessingModal 
            batch={selectedBatch} 
            onClose={() => setSelectedBatch(null)} 
            onSuccess={handleProcessComplete}
          />
        )}
        
      </div>
    </Layout>
  );
};

export default SurveyProcessingPage;
