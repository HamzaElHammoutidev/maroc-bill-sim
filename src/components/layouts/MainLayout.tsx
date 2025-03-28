
"use client"

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar-compact';
import { useLocation } from 'react-router-dom';
import { 
  BarChart2, 
  Users, 
  FileText, 
  ShoppingBag, 
  CreditCard, 
  PieChart, 
  Settings 
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  const links = [
    { 
      label: 'Dashboard', 
      href: '/dashboard', 
      icon: <BarChart2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
    },
    { 
      label: 'Clients', 
      href: '/clients', 
      icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
    },
    { 
      label: 'Products', 
      href: '/products', 
      icon: <ShoppingBag className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
    },
    { 
      label: 'Invoices', 
      href: '/invoices', 
      icon: <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
    },
    { 
      label: 'Quotes', 
      href: '/quotes', 
      icon: <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
    },
    { 
      label: 'Payments', 
      href: '/payments', 
      icon: <CreditCard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
    },
    { 
      label: 'Reports', 
      href: '/reports', 
      icon: <PieChart className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
    },
    { 
      label: 'Settings', 
      href: '/settings', 
      icon: <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> 
    },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              MarocBill
            </div>
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={{
                    ...link,
                    icon: React.cloneElement(link.icon as React.ReactElement, {
                      className: `${location.pathname === link.href 
                        ? "text-primary" 
                        : "text-neutral-700 dark:text-neutral-200"} h-5 w-5 flex-shrink-0`
                    })
                  }} 
                />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
