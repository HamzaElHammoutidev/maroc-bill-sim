import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { UserIcon, KeyIcon, LockIcon, CheckIcon, SaveIcon } from 'lucide-react';

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Personal information state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: user?.email || '',
    phone: '+212 661 234567',
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Validation state
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Update personal information
  const handleUpdatePersonalInfo = () => {
    // In a real app, this would call an API to update the user's information
    toast.success(t('profile.personalInfoUpdated'));
  };
  
  // Password strength check
  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) return 'weak';
    if (/^[a-zA-Z0-9]+$/.test(password)) return 'medium';
    return 'strong';
  };
  
  // Password strength indicator
  const PasswordStrengthIndicator = ({ strength }: { strength: 'weak' | 'medium' | 'strong' | '' }) => {
    if (!strength) return null;
    
    const getColor = () => {
      switch(strength) {
        case 'weak': return 'bg-red-500';
        case 'medium': return 'bg-yellow-500';
        case 'strong': return 'bg-green-500';
        default: return 'bg-gray-300';
      }
    };
    
    return (
      <div className="mt-2">
        <div className="text-sm text-muted-foreground mb-1">
          {t(`profile.passwordStrength.${strength}`)}
        </div>
        <div className="h-1 w-full bg-gray-300 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor()}`} 
            style={{ 
              width: strength === 'weak' ? '30%' : strength === 'medium' ? '60%' : '100%' 
            }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Handle password form input
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    // Add validation for confirm password
    if (name === 'confirmPassword' && value !== passwordData.newPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: t('profile.passwordsDoNotMatch') }));
    }
  };
  
  // Submit password change
  const handleChangePassword = () => {
    // Validate
    let hasErrors = false;
    const newErrors = { ...errors };
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = t('profile.currentPasswordRequired');
      hasErrors = true;
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = t('profile.newPasswordRequired');
      hasErrors = true;
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = t('profile.passwordTooShort');
      hasErrors = true;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t('profile.passwordsDoNotMatch');
      hasErrors = true;
    }
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    // In a real app, this would call an API to change the password
    toast.success(t('profile.passwordChanged'));
    
    // Reset form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="profile.title"
        description="profile.description"
      />
      
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="personal">
            <UserIcon className="h-4 w-4 mr-2" />
            {t('profile.tabs.personal')}
          </TabsTrigger>
          <TabsTrigger value="security">
            <KeyIcon className="h-4 w-4 mr-2" />
            {t('profile.tabs.security')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.personalInfo.title')}</CardTitle>
              <CardDescription>{t('profile.personalInfo.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('profile.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  disabled={true}
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  {t('profile.emailChangeDisabled')}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{t('profile.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleUpdatePersonalInfo}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {t('profile.saveChanges')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.changePassword.title')}</CardTitle>
              <CardDescription>{t('profile.changePassword.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('profile.currentPassword')}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={errors.currentPassword ? 'border-red-500' : ''}
                  />
                  {errors.currentPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.currentPassword}</p>
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={errors.newPassword ? 'border-red-500' : ''}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>
                  )}
                  <PasswordStrengthIndicator 
                    strength={passwordData.newPassword ? checkPasswordStrength(passwordData.newPassword) : ''}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                  {passwordData.confirmPassword && 
                   passwordData.confirmPassword === passwordData.newPassword && (
                    <div className="text-sm flex items-center text-green-500 mt-1">
                      <CheckIcon className="h-4 w-4 mr-1" />
                      {t('profile.passwordsMatch')}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {t('profile.passwordRequirements')}
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t('profile.requirements.minLength')}</li>
                  <li>{t('profile.requirements.uppercase')}</li>
                  <li>{t('profile.requirements.lowercase')}</li>
                  <li>{t('profile.requirements.number')}</li>
                  <li>{t('profile.requirements.special')}</li>
                </ul>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={handleChangePassword}>
                  <LockIcon className="h-4 w-4 mr-2" />
                  {t('profile.changePassword.submit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile; 