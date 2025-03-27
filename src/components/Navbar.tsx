
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  BarChart2,
  Users,
  FileText,
  ShoppingBag,
  CreditCard,
  PieChart,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: React.ElementType; label: string; active: boolean }) => {
  const { t } = useLanguage();
  
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center px-4 py-3 text-sm transition-all duration-200 rounded-md",
        active 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-foreground/60 hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{t(label)}</span>
    </Link>
  );
};

const Navbar = () => {
  const { logout, user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  const navItems = [
    { path: '/dashboard', icon: BarChart2, label: 'nav.dashboard' },
    { path: '/clients', icon: Users, label: 'nav.clients' },
    { path: '/products', icon: ShoppingBag, label: 'nav.products' },
    { path: '/invoices', icon: FileText, label: 'nav.invoices' },
    { path: '/quotes', icon: FileText, label: 'nav.quotes' },
    { path: '/payments', icon: CreditCard, label: 'nav.payments' },
    { path: '/reports', icon: PieChart, label: 'nav.reports' },
    { path: '/settings', icon: Settings, label: 'nav.settings' },
  ];
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="rounded-full w-10 h-10 glass-panel"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Main navbar */}
      <nav className={cn(
        "fixed inset-0 z-40 bg-background/95 backdrop-blur-md md:relative md:h-screen md:w-64 border-r transition-all duration-300 flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "md:animate-fade-in"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent animate-pulse">
              MarocBill
            </div>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full">
                <span className="sr-only">Change language</span>
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Langue / اللغة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLanguage('fr')}>
                Français
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ar')}>
                العربية
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                to={item.path}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.path}
              />
            ))}
          </div>
        </div>
        
        <div className="border-t p-4">
          <div className="mb-4">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive/80 hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('nav.logout')}
          </Button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
