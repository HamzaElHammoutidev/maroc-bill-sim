import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// Define types for our auth system
export type UserRole = 'SuperAdmin' | 'Admin' | 'Comptable' | 'Commercial';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7241';

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
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Real authentication function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error ${response.status}`);
      }
      
      const userData = await response.json();
      
      // Set the user in state
      setUser(userData);
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Connexion réussie !');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // Show more specific error message if available
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          toast.error('Identifiants invalides');
        } else {
          toast.error(`Erreur: ${error.message || 'Échec de connexion'}`);
        }
      } else {
        toast.error('Erreur de connexion au serveur');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear user from state and storage
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
