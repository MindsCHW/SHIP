import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-pageBg">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden p-6 overflow-y-auto">
          <Outlet />
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
