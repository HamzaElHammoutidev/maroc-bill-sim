import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import MainLayout from "./components/layouts/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Invoices from "./pages/Invoices";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Inventory from "./pages/Inventory";
import Quotes from "./pages/Quotes";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Taxes from "./pages/Taxes";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import CreditNotes from "./pages/CreditNotes";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Permissions from "./pages/Permissions";
import AuditLog from "./pages/AuditLog";
import ProformaInvoices from "./pages/ProformaInvoices";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/:clientId" element={<ClientDetail />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/proforma-invoices" element={<ProformaInvoices />} />
                <Route path="/products" element={<Products />} />
                <Route path="/stock" element={<Stock />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/credit-notes" element={<CreditNotes />} />
                <Route path="/credit-notes/create" element={<CreditNotes />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/taxes" element={<Taxes />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* User Management Routes */}
                <Route path="/users" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><Users /></ProtectedRoute>} />
                <Route path="/permissions" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><Permissions /></ProtectedRoute>} />
                <Route path="/audit-log" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><AuditLog /></ProtectedRoute>} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              
              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
