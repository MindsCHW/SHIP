import React from 'react';
import { MdClose, MdVideocam, MdVideoLibrary } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const SurveyProcessingModal = ({ batch, onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <MdVideocam className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Process Survey Video</h2>
              <p className="text-xs text-gray-500">Batch: {batch.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          <MdVideoLibrary className="text-6xl text-primary mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Workflow Updated</h3>
          <p className="text-sm text-gray-600 mb-6">
            Video uploads and image extraction are now managed through the new <span className="font-semibold text-textColor">Survey Library</span> module. 
            Please navigate to the Survey Library to upload assets and process pending batches for this project.
          </p>
          
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/survey-library');
              }}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Survey Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyProcessingModal;
