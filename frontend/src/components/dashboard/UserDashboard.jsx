import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdAssignment, MdPendingActions, MdCheckCircle, MdWarning, MdAccessTime, MdPlayArrow } from 'react-icons/md';
import { dashboardService } from '../../services/dashboard.service';
import api from '../../services/api';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4"
  >
    <div className={`p-3 rounded-xl ${colorClass} text-white shadow-inner`}>
      <Icon className="text-2xl" />
    </div>
    <div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{title}</p>
      <h3 className="text-3xl font-black text-gray-800">{value}</h3>
    </div>
  </motion.div>
);

const UserDashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [kpiData, assignRes] = await Promise.all([
          dashboardService.getUserKPIs(),
          api.get('/work-assignments/my')
        ]);
        
        setKpis(kpiData);
        if (assignRes.data?.success) {
          // Sort assignments by due date
          const sorted = (assignRes.data.data || []).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          setAssignments(sorted);
        }
      } catch (err) {
        console.error("Failed to load user dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;
  }

  const activeAssignments = assignments.filter(a => a.status === 'Assigned' || a.status === 'In Progress');

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Hello, here is what you need to do today.</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your active inspection tasks and track your progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Pending" value={kpis?.pendingAssignments || 0} icon={MdAssignment} colorClass="bg-blue-500" />
        <StatCard title="In Progress" value={kpis?.inProgress || 0} icon={MdPendingActions} colorClass="bg-orange-500" />
        <StatCard title="Due Today" value={kpis?.dueToday || 0} icon={MdAccessTime} colorClass="bg-yellow-500" />
        <StatCard title="Overdue" value={kpis?.overdue || 0} icon={MdWarning} colorClass="bg-red-500" />
        <StatCard title="Completed Today" value={kpis?.completedToday || 0} icon={MdCheckCircle} colorClass="bg-green-500" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-4">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">My Assignments</h2>
          <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs">
            {activeAssignments.length} Active
          </span>
        </div>
        
        {activeAssignments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdCheckCircle className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">You're all caught up!</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You have no assigned inspections at the moment. Take a break or check back later for new tasks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="p-4 font-bold">Project</th>
                  <th className="p-4 font-bold">Batch / Category</th>
                  <th className="p-4 font-bold">Pages</th>
                  <th className="p-4 font-bold">Due Date</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeAssignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{assignment.project}</div>
                      <div className="text-xs font-medium text-gray-500 mt-0.5">Priority: {assignment.priority || 'Medium'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-gray-700">{assignment.batchName || 'Inspection Batch'}</div>
                      <div className="text-xs text-gray-500">{assignment.category || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-600">
                      {assignment.pages || 'All'}
                    </td>
                    <td className="p-4">
                      <div className={`text-sm font-bold ${new Date(assignment.dueDate) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        assignment.status === 'In Progress' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                        assignment.status === 'Assigned' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate(`/rating/inspector/${assignment.batchId?._id || assignment.batchId}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95"
                      >
                        <MdPlayArrow className="text-lg" />
                        Start Rating
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
