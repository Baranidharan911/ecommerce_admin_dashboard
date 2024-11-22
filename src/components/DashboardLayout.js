import React from 'react';
import { Outlet } from 'react-router-dom';  // Import Outlet to render child routes
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '20px' }}>
        <Outlet />  {/* This is where nested routes will be rendered */}
      </div>
    </div>
  );
};

export default DashboardLayout;
