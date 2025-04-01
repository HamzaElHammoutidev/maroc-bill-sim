import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockCompanies, Company } from '@/data/mockData';

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  setCurrentCompany: (company: Company) => void;
  getCurrentCompany: () => Company | null;
}

// Create context with default values
const CompanyContext = createContext<CompanyContextType>({
  companies: [],
  currentCompany: null,
  setCurrentCompany: () => {},
  getCurrentCompany: () => null,
});

// Custom hook to use the CompanyContext
export const useCompany = () => useContext(CompanyContext);

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  // Set the first company as default for now
  const [currentCompany, setCurrentCompany] = useState<Company | null>(mockCompanies[0]);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);

  const getCurrentCompany = () => {
    return currentCompany;
  };

  return (
    <CompanyContext.Provider
      value={{
        companies,
        currentCompany,
        setCurrentCompany,
        getCurrentCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}; 