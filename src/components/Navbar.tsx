
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  BellRing, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings, 
  Moon, 
  Sun,
  BarChart2,
  Users,
  ShoppingBag,
  Package,
  FileText,
  FileMinus,
  CreditCard,
  Receipt,
  PieChart,
  Languages as LanguagesIcon
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from 'next-themes';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CurrencySelector } from './CurrencySelector';

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: React.ElementType; label: string; active: boolean }) => {
  const { t } = useTranslation();
  
  return (
    <Link 
      to={to} 
      className={`
        flex items-center px-4 py-3 text-sm transition-all duration-200 rounded-md
        ${active 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-foreground/60 hover:bg-accent hover:text-foreground"}
      `}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{t(label)}</span>
    </Link>
  );
};

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const navItems = [
    { path: '/dashboard', icon: BarChart2, label: 'nav.dashboard' },
    { path: '/clients', icon: Users, label: 'nav.clients' },
    { path: '/products', icon: ShoppingBag, label: 'nav.products' },
    { path: '/stock', icon: Package, label: 'nav.stock' },
    { path: '/inventory', icon: Package, label: 'nav.inventory' },
    { path: '/invoices', icon: FileText, label: 'nav.invoices' },
    { path: '/quotes', icon: FileText, label: 'nav.quotes' },
    { path: '/credit-notes', icon: FileMinus, label: 'nav.credit_notes' },
    { path: '/payments', icon: CreditCard, label: 'nav.payments' },
    { path: '/taxes', icon: Receipt, label: 'nav.taxes' },
    { path: '/reports', icon: PieChart, label: 'nav.reports' },
    { path: '/settings', icon: Settings, label: 'nav.settings' },
  ];
  
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-30">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and mobile menu */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="hidden md:flex md:items-center md:space-x-4">
              <Link to="/dashboard" className="text-lg font-bold">
                MarocBill
              </Link>
            </div>
          </div>
          
          {/* Right side - User menu, theme toggle, notifications */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            
            <div className="hidden md:block">
              <CurrencySelector value="MAD" onChange={() => {}} />
            </div>
            
            <ThemeToggle />
            
            <Button variant="ghost" size="icon" className="relative">
              <BellRing className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('nav.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('nav.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span>{theme === 'dark' ? t('nav.light_mode') : t('nav.dark_mode')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-xl font-bold">MarocBill</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="py-4 px-2 space-y-1">
                <div className="px-2 py-3">
                  <LanguageSwitcher />
                </div>
                <div className="px-2 py-3">
                  <CurrencySelector value="MAD" onChange={() => {}} />
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
