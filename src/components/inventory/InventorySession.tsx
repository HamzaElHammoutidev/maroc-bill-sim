import React from 'react';
import InventoryForm from '@/components/InventoryForm';
import { useAuth } from '@/contexts/AuthContext';

const InventorySession = () => {
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  
  return (
    <div className="animate-fade-in">
      <InventoryForm />
    </div>
  );
};

export default InventorySession;
