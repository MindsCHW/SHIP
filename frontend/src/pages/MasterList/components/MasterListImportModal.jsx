import React, { useState } from 'react';
import { MdClose, MdUploadFile } from 'react-icons/md';
import { masterListService } from '../../../services/masterList.service';
import { projectService } from '../../../services/project.service';

const MasterListImportModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [project, setProject] = useState('');
  const [isNewProject, setIsNewProject] = useState(false);
  const [newProjectCode, setNewProjectCode] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [projectsList, setProjectsList] = useState([]);
  const [importMode, setImportMode] = useState('append');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  React.useEffect(() => {
    projectService.getAllProjects()
      .then(data => {
        // Assume data might be an array of projects with `code` or `name`
        setProjectsList(data || []);
      })
      .catch(console.error);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let targetProject = project;

    if (isNewProject) {
      if (!newProjectCode || !newProjectName) {
        setError('Both Project Code and Project Name are required for a new project.');
        return;
      }
      targetProject = newProjectCode.toUpperCase();
    }

    if (!file || !targetProject) {
      setError('Project and File are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Auto-create new project if needed
      if (isNewProject) {
        const exists = projectsList.find(p => p.code === targetProject);
        if (!exists) {
          await projectService.createProject({
            code: targetProject,
            fullName: newProjectName
          });
        }
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('project', targetProject);
      formData.append('importMode', importMode);

      const res = await masterListService.importMasterList(formData);
      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.message || 'Import failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (result) {
      onSuccess(); // Refresh the list if we succeeded
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Import Master List</h3>
            <p className="text-sm text-gray-500">Upload CSV or Excel file</p>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
            <MdClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {result ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <MdUploadFile size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Import Complete!</h4>
              
              <div className="grid grid-cols-2 gap-4 mt-6 text-left">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Rows</p>
                  <p className="text-2xl font-bold text-gray-800">{result.totalRows}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-600 mb-1">Imported</p>
                  <p className="text-2xl font-bold text-green-700">{result.imported}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <p className="text-sm text-yellow-600 mb-1">Duplicates (Skipped)</p>
                  <p className="text-2xl font-bold text-yellow-700">{result.duplicates}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <p className="text-sm text-red-600 mb-1">Invalid (Skipped)</p>
                  <p className="text-2xl font-bold text-red-700">{result.invalid}</p>
                </div>
              </div>

              <button 
                onClick={handleClose}
                className="mt-8 w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {error}
                </div>
              )}

              {/* Project Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Project</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsNewProject(!isNewProject);
                      setError(null);
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-none"
                  >
                    {isNewProject ? 'Select Existing Project' : '+ Add New Project'}
                  </button>
                </div>
                
                {isNewProject ? (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Project Code (e.g., APEL)"
                      value={newProjectCode}
                      onChange={(e) => setNewProjectCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Project Full Name (e.g., Ahmedabad Project)"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <select
                    required
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
                  >
                    <option value="" disabled>Select a project</option>
                    {projectsList.map(p => (
                      <option key={p._id || p.code} value={p.code}>
                        {p.code} - {p.fullName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Import Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Import Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="importMode" 
                      value="append"
                      checked={importMode === 'append'}
                      onChange={(e) => setImportMode(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-800">Append (Keep existing)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="importMode" 
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={(e) => setImportMode(e.target.value)}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-sm text-red-600 font-medium">Replace Existing</span>
                  </label>
                </div>
              </div>

              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (CSV, XLS, XLSX)</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <MdUploadFile className="text-4xl text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700 text-center">
                    {file ? file.name : "Click or drag file here to upload"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Required Columns: Project, Category, Asset Type, Chainage, Parameter
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !file || (isNewProject ? (!newProjectCode || !newProjectName) : !project)}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {loading ? 'Importing...' : 'Import Master List'}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterListImportModal;
