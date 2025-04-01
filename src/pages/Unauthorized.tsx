
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md px-4 animate-fade-in">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Shield className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold">{t('unauthorized.title')}</h1>
        <p className="mt-4 text-muted-foreground">{t('unauthorized.message')}</p>
        <Button 
          className="mt-8 px-6 shadow-lg hover:shadow-xl transition-all"
          onClick={() => navigate('/dashboard')}
        >
          {t('unauthorized.back')}
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
