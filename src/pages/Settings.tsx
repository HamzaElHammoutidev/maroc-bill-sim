
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="settings.title"
        description="settings.description"
      />
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">{t('settings.tabs.general')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.tabs.notifications')}</TabsTrigger>
          <TabsTrigger value="security">{t('settings.tabs.security')}</TabsTrigger>
          <TabsTrigger value="billing">{t('settings.tabs.billing')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.language.title')}</CardTitle>
              <CardDescription>{t('settings.language.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setLanguage('fr')}
                  className={`px-4 py-2 rounded-md ${language === 'fr' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                >
                  Français
                </button>
                <button 
                  onClick={() => setLanguage('ar')}
                  className={`px-4 py-2 rounded-md ${language === 'ar' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                >
                  العربية
                </button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.theme.title')}</CardTitle>
              <CardDescription>{t('settings.theme.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch id="dark-mode" />
                <Label htmlFor="dark-mode">{t('settings.theme.darkMode')}</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.notifications.title')}</CardTitle>
              <CardDescription>{t('settings.notifications.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifs">{t('settings.notifications.email')}</Label>
                <Switch id="email-notifs" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifs">{t('settings.notifications.push')}</Label>
                <Switch id="push-notifs" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notifs">{t('settings.notifications.sms')}</Label>
                <Switch id="sms-notifs" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.security.title')}</CardTitle>
              <CardDescription>{t('settings.security.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('settings.security.placeholder')}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.billing.title')}</CardTitle>
              <CardDescription>{t('settings.billing.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('settings.billing.placeholder')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
