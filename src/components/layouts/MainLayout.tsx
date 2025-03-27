
"use client"

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      <Navbar />
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
