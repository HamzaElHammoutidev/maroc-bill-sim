
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md px-4 animate-fade-in">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-bold">{t('notfound.title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('notfound.message')}</p>
        <Button 
          className="mt-8 px-6 shadow-lg hover:shadow-xl transition-all"
          onClick={() => navigate('/dashboard')}
        >
          {t('notfound.back')}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
