
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Login = () => {
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      // Simple validation
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password, role);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'comptable', label: 'Comptable' },
    { value: 'commercial', label: 'Commercial' },
  ];
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <div className="absolute top-4 right-4">
        <Select
          value={language}
          onValueChange={(value) => setLanguage(value as 'fr' | 'ar')}
        >
          <SelectTrigger className="w-[120px] glass-panel">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="ar">العربية</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card className="w-full max-w-md shadow-xl border-0 glass-panel animate-fade-in">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <div className="font-bold text-3xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              MarocBill
            </div>
          </div>
          <CardTitle className="text-2xl text-center">{t('login.title')}</CardTitle>
          <CardDescription className="text-center">
            {t('login.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-panel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass-panel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('login.role')}</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger className="glass-panel">
                  <SelectValue placeholder={t('login.select_role')} />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Pour la démo, utilisez n'importe quels identifiants avec le rôle choisi
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                {t('login.remember')}
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full shadow-md hover:shadow-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  {t('common.loading')}
                </div>
              ) : (
                t('login.button')
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="text-xs text-center w-full text-muted-foreground">
            © 2023 MarocBill. {t('login.disclaimer')}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
