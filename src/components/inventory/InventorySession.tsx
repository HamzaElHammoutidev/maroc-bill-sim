
import React, { useState, useEffect } from 'react';
import InventoryForm from '@/components/InventoryForm';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileBarChart, Package, BarChart } from 'lucide-react';

const InventorySession = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const companyId = user?.companyId || '101'; // Default for demo
  const [activeTab, setActiveTab] = useState("inventory");
  
  return (
    <div className="animate-fade-in space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-primary" />
            <CardTitle>{t('inventory.session_title')}</CardTitle>
          </div>
          <CardDescription>
            {t('inventory.session_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inventory" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="inventory">
                <Package className="h-4 w-4 mr-2" />
                {t('inventory.physical_inventory')}
              </TabsTrigger>
              <TabsTrigger value="reports">
                <BarChart className="h-4 w-4 mr-2" />
                {t('inventory.inventory_reports')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="inventory">
              <InventoryForm />
            </TabsContent>
            
            <TabsContent value="reports">
              <div className="bg-muted/30 border rounded-md p-8 text-center">
                <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('inventory.reports_coming_soon')}</h3>
                <p className="text-muted-foreground">
                  {t('inventory.reports_description')}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventorySession;
