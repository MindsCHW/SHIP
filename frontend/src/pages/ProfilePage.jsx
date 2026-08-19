import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth'; 
import { LuUser } from 'react-icons/lu';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-pageBg">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-textColor">My Profile</h1>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 max-w-2xl">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl shadow-inner border border-green-200">
                <LuUser />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h2>
                <p className="text-gray-500 font-medium">@{user?.username || 'username'}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                  {user?.role || 'User'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-gray-800 font-medium">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Road Assignment</p>
                <p className="text-gray-800 font-medium">{user?.roadAssignment || 'None'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Designation</p>
                <p className="text-gray-800 font-medium">{user?.designation || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
