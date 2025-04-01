import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  UsersIcon, 
  ShieldIcon, 
  ActivitySquareIcon,
  ArrowRightIcon
} from 'lucide-react';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';
  
  const updateSettings = () => {
    console.log(`Language: ${i18n.language}`);
  };
  
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
          {isAdmin && (
            <TabsTrigger value="administration">{t('settings.tabs.administration')}</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.i18n.language.title')}</CardTitle>
              <CardDescription>{t('settings.i18n.language.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => i18n.changeLanguage('fr')}
                  className={`px-4 py-2 rounded-md ${i18n.language === 'fr' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                >
                  Français
                </button>
                <button 
                  onClick={() => i18n.changeLanguage('ar')}
                  className={`px-4 py-2 rounded-md ${i18n.language === 'ar' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
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
        
        {isAdmin && (
          <TabsContent value="administration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.administration.title')}</CardTitle>
                <CardDescription>{t('settings.administration.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800 pb-2">
                      <CardTitle className="flex items-center text-base">
                        <UsersIcon className="h-5 w-5 mr-2 text-primary" />
                        {t('settings.administration.userManagement')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {t('settings.administration.userManagementDesc')}
                      </p>
                    </CardContent>
                    <CardFooter className="bg-gray-50 dark:bg-gray-800 pt-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between" 
                        onClick={() => navigate('/users')}
                      >
                        {t('settings.administration.goToUserManagement')}
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800 pb-2">
                      <CardTitle className="flex items-center text-base">
                        <ShieldIcon className="h-5 w-5 mr-2 text-primary" />
                        {t('settings.administration.permissions')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {t('settings.administration.permissionsDesc')}
                      </p>
                    </CardContent>
                    <CardFooter className="bg-gray-50 dark:bg-gray-800 pt-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between" 
                        onClick={() => navigate('/permissions')}
                      >
                        {t('settings.administration.goToPermissions')}
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800 pb-2">
                      <CardTitle className="flex items-center text-base">
                        <ActivitySquareIcon className="h-5 w-5 mr-2 text-primary" />
                        {t('settings.administration.auditLog')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {t('settings.administration.auditLogDesc')}
                      </p>
                    </CardContent>
                    <CardFooter className="bg-gray-50 dark:bg-gray-800 pt-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between" 
                        onClick={() => navigate('/audit-log')}
                      >
                        {t('settings.administration.goToAuditLog')}
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
            
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
