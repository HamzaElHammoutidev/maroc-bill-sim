
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// Define types for our auth system
export type UserRole = 'superadmin' | 'admin' | 'comptable' | 'commercial';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample users for demonstration
const MOCK_USERS: Record<UserRole, User> = {
  superadmin: {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@example.com',
    role: 'superadmin'
  },
  admin: {
    id: '2',
    name: 'Company Admin',
    email: 'admin@example.com',
    role: 'admin',
    companyId: '101'
  },
  comptable: {
    id: '3',
    name: 'Comptable',
    email: 'comptable@example.com',
    role: 'comptable',
    companyId: '101'
  },
  commercial: {
    id: '4',
    name: 'Commercial',
    email: 'commercial@example.com',
    role: 'commercial',
    companyId: '101'
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Mock authentication function
  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // For demo purposes, we'll just check if the email matches the role format
      // In a real app, you'd validate credentials against a backend
      if (email && password && role) {
        const user = MOCK_USERS[role];
        
        if (user) {
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          toast.success('Connexion réussie !');
          return true;
        }
      }
      
      toast.error('Identifiants invalides');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erreur de connexion');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('Vous êtes déconnecté');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
