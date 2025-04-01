"use client"

import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Sidebar, SidebarBody } from '@/components/ui/sidebar-compact';
import { useLocation } from 'react-router-dom';
import { 
  BarChart2, 
  Users, 
  FileText, 
  ShoppingBag, 
  CreditCard, 
  PieChart, 
  Settings,
  Package,
  UserCog,
  Shield,
  ActivitySquare,
  User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Define the Links interface
interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

// Custom NavLink component that wraps Link properly
const NavLinkItem: React.FC<{ link: NavLink }> = ({ link }) => {
  const location = useLocation();
  const isActive = location.pathname === link.href;
  
  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2",
      )}
    >
      {link.icon}
      <span
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </span>
    </Link>
  );
};

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Function to update icon styling based on if link is active
  const getStyledIcon = (icon: React.ReactElement, isActive: boolean) => {
    return React.cloneElement(icon, {
      className: `${isActive ? "text-primary" : "text-neutral-700 dark:text-neutral-200"} h-5 w-5 flex-shrink-0`
    });
  };
  
  // Main navigation links
  const mainLinks: NavLink[] = [
    { 
      label: t('navigation.dashboard'), 
      href: '/dashboard', 
      icon: getStyledIcon(<BarChart2 />, location.pathname === '/dashboard') 
    },
    { 
      label: t('navigation.clients'), 
      href: '/clients', 
      icon: getStyledIcon(<Users />, location.pathname === '/clients') 
    },
    { 
      label: t('navigation.products'), 
      href: '/products', 
      icon: getStyledIcon(<ShoppingBag />, location.pathname === '/products') 
    },
    { 
      label: t('navigation.stock'), 
      href: '/stock', 
      icon: getStyledIcon(<Package />, location.pathname === '/stock') 
    },
    { 
      label: t('navigation.invoices'), 
      href: '/invoices', 
      icon: getStyledIcon(<FileText />, location.pathname === '/invoices') 
    },
    { 
      label: t('navigation.proforma_invoices'), 
      href: '/proforma-invoices', 
      icon: getStyledIcon(<FileText />, location.pathname === '/proforma-invoices') 
    },
    { 
      label: t('navigation.credit_notes'), 
      href: '/credit-notes', 
      icon: getStyledIcon(<FileText />, location.pathname === '/credit-notes') 
    },
    { 
      label: t('navigation.quotes'), 
      href: '/quotes', 
      icon: getStyledIcon(<FileText />, location.pathname === '/quotes') 
    },
    { 
      label: t('navigation.payments'), 
      href: '/payments', 
      icon: getStyledIcon(<CreditCard />, location.pathname === '/payments') 
    },
    { 
      label: t('navigation.reports'), 
      href: '/reports', 
      icon: getStyledIcon(<PieChart />, location.pathname === '/reports') 
    },
    { 
      label: t('navigation.settings'), 
      href: '/settings', 
      icon: getStyledIcon(<Settings />, location.pathname === '/settings') 
    },
  ];
  
  // Admin only links
  const adminLinks: NavLink[] = [
    { 
      label: t('navigation.users'), 
      href: '/users', 
      icon: getStyledIcon(<UserCog />, location.pathname === '/users'),
      roles: ['superadmin', 'admin']
    },
    { 
      label: t('navigation.permissions'), 
      href: '/permissions', 
      icon: getStyledIcon(<Shield />, location.pathname === '/permissions'),
      roles: ['superadmin', 'admin']
    },
    { 
      label: t('navigation.auditLog'), 
      href: '/audit-log', 
      icon: getStyledIcon(<ActivitySquare />, location.pathname === '/audit-log'),
      roles: ['superadmin', 'admin']
    },
  ];
  
  // User account link (available to all)
  const userLink: NavLink = { 
    label: t('navigation.profile'), 
    href: '/profile', 
    icon: getStyledIcon(<User />, location.pathname === '/profile')
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              MarocBill
            </div>
            <div className="mt-8 flex flex-col gap-2">
              {/* Main Links */}
              {mainLinks.map((link, idx) => (
                <NavLinkItem key={idx} link={link} />
              ))}
              
              {/* Admin Section Divider (only shown to admins) */}
              {(user?.role === 'superadmin' || user?.role === 'admin') && (
                <div className="mt-6 mb-3">
                  <div className="text-xs font-medium text-gray-500 px-3 py-1 uppercase">
                    {t('navigation.administration')}
                  </div>
                </div>
              )}
              
              {/* Admin Links */}
              {adminLinks.map((link, idx) => {
                // Only show links the user has permission to access
                if (!link.roles || link.roles.includes(user?.role || '')) {
                  return (
                    <NavLinkItem key={`admin-${idx}`} link={link} />
                  );
                }
                return null;
              })}
              
              {/* Profile Section (at the bottom) */}
              <div className="mt-auto pt-6">
                <NavLinkItem link={userLink} />
              </div>
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
