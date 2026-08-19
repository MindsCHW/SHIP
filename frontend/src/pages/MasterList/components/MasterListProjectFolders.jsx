import React, { useState, useEffect } from 'react';
import { masterListService } from '../../../services/masterList.service';
import { MdFolder, MdDelete, MdWarning } from 'react-icons/md';

const MasterListProjectFolders = ({ projects, onSelectProject, onProjectDeleted }) => {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (e, projectName) => {
    e.stopPropagation(); // Prevent folder click
    
    if (window.confirm(`Are you sure you want to permanently delete the entire Master List for project "${projectName}"? This will also cascade and delete any associated Extraction Tasks and their physical Cloudinary Images! This action cannot be undone.`)) {
      try {
        setDeleting(projectName);
        await masterListService.deleteProjectMasterList(projectName);
        onProjectDeleted();
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to delete project master list');
      } finally {
        setDeleting(null);
      }
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[400px] items-center justify-center text-gray-500">
        <p>No projects found in the Master List.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {projects.map((project) => (
        <div 
          key={project}
          onClick={() => onSelectProject(project)}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group relative"
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => handleDelete(e, project)}
              disabled={deleting === project}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete Project Master List"
            >
              {deleting === project ? (
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <MdDelete className="text-xl" />
              )}
            </button>
          </div>
          <MdFolder className="text-6xl text-blue-400 mb-4 group-hover:text-blue-500 transition-colors" />
          <h3 className="text-lg font-semibold text-gray-800 text-center w-full truncate">{project}</h3>
          <p className="text-xs text-gray-400 mt-2">Click to view items</p>
        </div>
      ))}
    </div>
  );
};

export default MasterListProjectFolders;
