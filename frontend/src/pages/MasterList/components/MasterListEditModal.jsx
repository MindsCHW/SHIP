import React, { useState } from 'react';
import { MdClose, MdSave } from 'react-icons/md';
import { masterListService } from '../../../services/masterList.service';

const MasterListEditModal = ({ item, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    project: item.project || '',
    category: item.category || '',
    assetType: item.assetType || '',
    roadType: item.roadType || '',
    direction: item.direction || '',
    placement: item.placement || '',
    chainage: item.chainage || '',
    parameter: item.parameter || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await masterListService.updateMasterListItem(item._id, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update item');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">Edit Master List Item</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <form id="editMasterListForm" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <input 
                type="text" 
                name="project" 
                value={formData.project} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input 
                type="text" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
              <input 
                type="text" 
                name="assetType" 
                value={formData.assetType} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Road Type</label>
              <input 
                type="text" 
                name="roadType" 
                value={formData.roadType} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
              <input 
                type="text" 
                name="direction" 
                value={formData.direction} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
              <input 
                type="text" 
                name="placement" 
                value={formData.placement} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chainage / Location</label>
              <input 
                type="text" 
                name="chainage" 
                value={formData.chainage} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Parameter / Question</label>
              <textarea 
                name="parameter" 
                value={formData.parameter} 
                onChange={handleChange} 
                required
                rows="3"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              ></textarea>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="editMasterListForm"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <MdSave className="text-lg" />
                Save Changes
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MasterListEditModal;
