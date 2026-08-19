import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { MdOutlinePrecisionManufacturing } from 'react-icons/md';
import { inspectionEngineService } from '../services/inspectionEngine.service';
import BatchCreationForm from './InspectionEngine/components/BatchCreationForm';
import BatchListTable from './InspectionEngine/components/BatchListTable';
import BatchSummaryModal from './InspectionEngine/components/BatchSummaryModal';

const InspectionEnginePage = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  
  const [showAllInspectedModal, setShowAllInspectedModal] = useState(false);
  const [pendingBatchData, setPendingBatchData] = useState(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await inspectionEngineService.listBatches();
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

  const handleBatchCreated = async (batchData) => {
    try {
      const res = await inspectionEngineService.createBatch(batchData);
      if (res.success) {
        await fetchBatches();
        setSelectedBatchId(res.data._id); // Auto-open modal to show summary
      }
    } catch (err) {
      if (err.response?.data?.code === 'ALL_INSPECTED') {
        setPendingBatchData(batchData);
        setShowAllInspectedModal(true);
      }
      throw err;
    }
  };

  const handleRetryBatch = async (options) => {
    if (!pendingBatchData) return;
    
    setShowAllInspectedModal(false);
    
    // We recreate the batch directly with the new options
    const newPayload = {
      ...pendingBatchData,
      excludePreviouslyInspected: false,
      resetHistory: options.resetHistory || false
    };
    
    try {
      // Create manually without form's error handling
      const res = await inspectionEngineService.createBatch(newPayload);
      if (res.success) {
        await fetchBatches();
        setSelectedBatchId(res.data._id);
        setPendingBatchData(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create batch');
    }
  };

  const handleDeleteBatch = async (id) => {
    try {
      await inspectionEngineService.deleteBatch(id);
      await fetchBatches();
    } catch (err) {
      alert(err.message || 'Failed to delete batch');
    }
  };

  return (
    <Layout title="Inspection Engine (Sampling)">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header section */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MdOutlinePrecisionManufacturing className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inspection Engine</h1>
            <p className="text-sm text-gray-500">Generate inspection batches by sampling the Master List Question Bank.</p>
          </div>
        </div>

        {/* Batch Generator */}
        <BatchCreationForm onBatchCreated={handleBatchCreated} />

        {/* Generated Batches List */}
        <h2 className="text-lg font-bold text-gray-800">Generated Batches</h2>
        <BatchListTable 
          batches={batches} 
          loading={loading} 
          onDelete={handleDeleteBatch}
          onView={(batch) => setSelectedBatchId(batch._id)}
        />

        {/* Summary Modal */}
        {selectedBatchId && (
          <BatchSummaryModal 
            batchId={selectedBatchId} 
            onClose={() => setSelectedBatchId(null)} 
          />
        )}

        {/* All Inspected Modal */}
        {showAllInspectedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sampling Complete</h3>
              <p className="text-gray-600 mb-6">
                All Master List questions for this project have already been inspected.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleRetryBatch({ resetHistory: true })}
                  className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Start New Inspection History (Reset)
                </button>
                <button
                  onClick={() => handleRetryBatch({ resetHistory: false })}
                  className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Allow Duplicate Questions
                </button>
                <button
                  onClick={() => {
                    setShowAllInspectedModal(false);
                    setPendingBatchData(null);
                  }}
                  className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors mt-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </Layout>
  );
};

export default InspectionEnginePage;
