import React, { useState } from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { masterListService } from '../../../services/masterList.service';
import MasterListEditModal from './MasterListEditModal';

const MasterListTable = ({ data, loading, onRefresh }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this master list item? This will also cascade and delete any associated Extraction Tasks and their Cloudinary Images if no other parameters remain. This action cannot be undone.')) {
      try {
        setDeletingId(id);
        await masterListService.deleteMasterListItem(id);
        if (onRefresh) onRefresh();
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to delete item');
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[400px] items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-sm">Loading master list data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[400px] items-center justify-center text-gray-500">
        <p>No records found matching your filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 font-medium">Question ID</th>
                <th className="px-5 py-4 font-medium">Project</th>
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium">Asset Type</th>
                <th className="px-5 py-4 font-medium">Chainage</th>
                <th className="px-5 py-4 font-medium">Parameter</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Created Date</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{item.questionId}</td>
                  <td className="px-5 py-3 text-gray-600">{item.project}</td>
                  <td className="px-5 py-3 text-gray-600">{item.category}</td>
                  <td className="px-5 py-3 text-gray-600">{item.assetType}</td>
                  <td className="px-5 py-3 text-gray-600">{item.chainage}</td>
                  <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate" title={item.parameter}>{item.parameter}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Item"
                      >
                        <MdEdit className="text-lg" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Delete Item"
                      >
                        {deletingId === item._id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <MdDelete className="text-lg" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingItem && (
        <MasterListEditModal 
          item={editingItem} 
          onClose={() => setEditingItem(null)} 
          onSuccess={() => {
            setEditingItem(null);
            if (onRefresh) onRefresh();
          }} 
        />
      )}
    </>
  );
};

export default MasterListTable;
