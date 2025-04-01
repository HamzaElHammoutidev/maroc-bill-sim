import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  createInventory, 
  startInventory,
  completeInventory,
  getStockLocations, 
  getInventoryById,
  getInventoryItems,
  getProductById,
  StockLocation,
  Inventory,
  InventoryItem,
  mockCompanies
} from '@/data/mockData';
import { Clipboard, ClipboardCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

// Define the schema for creating an inventory
const createInventorySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  locationId: z.string().min(1, { message: 'Location is required' }),
  notes: z.string().optional(),
});

// Define the schema for updating inventory items (quantity counts)
const updateInventoryItemSchema = z.object({
  itemId: z.string().min(1),
  actualQuantity: z.coerce.number().int().min(0),
  notes: z.string().optional(),
});

type InventoryState = 'create' | 'count' | 'review' | 'complete';

export default function InventoryForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const currentCompany = mockCompanies[0]; // In a real app, use context
  
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryState, setInventoryState] = useState<InventoryState>('create');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form for creating a new inventory
  const createForm = useForm<z.infer<typeof createInventorySchema>>({
    resolver: zodResolver(createInventorySchema),
    defaultValues: {
      name: `Inventory ${new Date().toLocaleDateString()}`,
      locationId: '',
      notes: '',
    },
  });

  // Form for updating inventory items
  const updateItemForm = useForm<z.infer<typeof updateInventoryItemSchema>>({
    resolver: zodResolver(updateInventoryItemSchema),
    defaultValues: {
      itemId: '',
      actualQuantity: 0,
      notes: '',
    },
  });

  // Load stock locations
  useEffect(() => {
    if (currentCompany) {
      const stockLocations = getStockLocations(currentCompany.id);
      setLocations(stockLocations);
      
      if (stockLocations.length > 0) {
        createForm.setValue('locationId', stockLocations[0].id);
      }
    }
  }, [currentCompany]);

  // Handle creating a new inventory
  const handleCreateInventory = async (values: z.infer<typeof createInventorySchema>) => {
    setIsProcessing(true);
    
    try {
      // Create the inventory
      const newInventory = createInventory(
        currentCompany.id,
        values.name,
        values.locationId,
        values.notes
      );
      
      setInventory(newInventory);
      
      // Start the inventory to generate items
      const items = startInventory(newInventory.id);
      
      if ('error' in items) {
        toast({
          title: t('common.error'),
          description: items.error,
          variant: 'destructive',
        });
        return;
      }
      
      setInventoryItems(items);
      setInventoryState('count');
      
      toast({
        title: t('stock.inventory_created'),
        description: t('stock.inventory_started'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle updating an inventory item's actual quantity
  const handleUpdateItem = (values: z.infer<typeof updateInventoryItemSchema>) => {
    setIsProcessing(true);
    
    try {
      // Update the item in the state
      const updatedItems = inventoryItems.map(item => {
        if (item.id === values.itemId) {
          const updatedItem = {
            ...item,
            actualQuantity: values.actualQuantity,
            difference: values.actualQuantity - item.expectedQuantity,
            notes: values.notes,
            updatedAt: new Date().toISOString(),
          };
          return updatedItem;
        }
        return item;
      });
      
      setInventoryItems(updatedItems);
      updateItemForm.reset({
        itemId: '',
        actualQuantity: 0,
        notes: '',
      });
      
      toast({
        title: t('stock.item_updated'),
        description: t('stock.quantity_recorded'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle completing the inventory
  const handleCompleteInventory = async (applyAdjustments: boolean) => {
    if (!inventory) return;
    
    setIsProcessing(true);
    
    try {
      // In a real app, you would save the updated items to the backend first
      
      // Complete the inventory
      const result = completeInventory(inventory.id, applyAdjustments);
      
      if ('error' in result) {
        toast({
          title: t('common.error'),
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      
      setInventoryState('complete');
      
      // Refresh the inventory data
      const updatedInventory = getInventoryById(inventory.id);
      if (updatedInventory) {
        setInventory(updatedInventory);
      }
      
      toast({
        title: t('stock.inventory_completed'),
        description: applyAdjustments 
          ? t('stock.adjustments_applied') 
          : t('stock.no_adjustments'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Switch to review state
  const handleReviewInventory = () => {
    // Check if all items have been counted
    const uncountedItems = inventoryItems.filter(item => item.actualQuantity === 0);
    
    if (uncountedItems.length > 0) {
      toast({
        title: t('common.warning'),
        description: t('stock.uncounted_items'),
        variant: 'destructive',
      });
      return;
    }
    
    setInventoryState('review');
  };

  // Reset the form to create a new inventory
  const handleReset = () => {
    setInventory(null);
    setInventoryItems([]);
    setInventoryState('create');
    createForm.reset();
  };

  // Get product name by ID
  const getProductName = (productId: string) => {
    const product = getProductById(productId);
    return product ? product.name : productId;
  };

  // Render different content based on the current state
  const renderContent = () => {
    switch (inventoryState) {
      case 'create':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('stock.new_inventory')}</CardTitle>
              <CardDescription>{t('stock.new_inventory_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...createForm}>
                <form className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('stock.inventory_name')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('stock.location')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('stock.select_location')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map(location => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('stock.notes')}</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                onClick={() => createForm.handleSubmit(handleCreateInventory)()}
                disabled={isProcessing}
              >
                {t('stock.start_inventory')}
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 'count':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{inventory?.name}</CardTitle>
                    <CardDescription>
                      {t('stock.counting_in_progress')}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {inventory?.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('stock.location')}</span>
                    <span className="text-sm">
                      {locations.find(l => l.id === inventory?.locationId)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('stock.items_to_count')}</span>
                    <span className="text-sm">{inventoryItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('stock.items_counted')}</span>
                    <span className="text-sm">
                      {inventoryItems.filter(item => item.actualQuantity > 0).length}
                    </span>
                  </div>
                  {inventory?.notes && (
                    <>
                      <Separator className="my-2" />
                      <div className="text-sm">
                        <span className="font-medium">{t('stock.notes')}: </span>
                        {inventory.notes}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('stock.count_items')}</CardTitle>
                <CardDescription>
                  {t('stock.scan_or_select')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...updateItemForm}>
                  <form className="space-y-4">
                    <FormField
                      control={updateItemForm.control}
                      name="itemId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('products.product')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('products.select_product')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {inventoryItems.map(item => {
                                const product = getProductById(item.productId);
                                const isCounted = item.actualQuantity > 0;
                                return (
                                  <SelectItem 
                                    key={item.id} 
                                    value={item.id}
                                    className="flex items-center justify-between"
                                  >
                                    <div className="flex items-center">
                                      {product?.name}
                                      {isCounted && (
                                        <Badge variant="outline" className="ml-2">
                                          {t('stock.counted')}
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {updateItemForm.watch('itemId') && inventoryItems.find(i => i.id === updateItemForm.watch('itemId')) && (
                      <>
                        <div className="bg-muted p-3 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {getProductName(
                                inventoryItems.find(i => i.id === updateItemForm.watch('itemId'))?.productId || ''
                              )}
                            </span>
                            <span>
                              {t('stock.expected')}: {
                                inventoryItems.find(i => i.id === updateItemForm.watch('itemId'))?.expectedQuantity
                              }
                            </span>
                          </div>
                        </div>
                        
                        <FormField
                          control={updateItemForm.control}
                          name="actualQuantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('stock.actual_quantity')}</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={updateItemForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('stock.notes')}</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            onClick={() => updateItemForm.handleSubmit(handleUpdateItem)()}
                            disabled={isProcessing}
                          >
                            {t('stock.save_count')}
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleReset}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleReviewInventory}>
                  {t('stock.finish_counting')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
        
      case 'review':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{inventory?.name}</CardTitle>
                    <CardDescription>
                      {t('stock.review_inventory')}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {inventory?.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('products.product')}</TableHead>
                          <TableHead className="text-right">{t('stock.expected')}</TableHead>
                          <TableHead className="text-right">{t('stock.actual')}</TableHead>
                          <TableHead className="text-right">{t('stock.difference')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventoryItems.map(item => {
                          const product = getProductById(item.productId);
                          const difference = item.actualQuantity - item.expectedQuantity;
                          
                          return (
                            <TableRow key={item.id}>
                              <TableCell>{product?.name}</TableCell>
                              <TableCell className="text-right">{item.expectedQuantity}</TableCell>
                              <TableCell className="text-right">{item.actualQuantity}</TableCell>
                              <TableCell className="text-right">
                                <span className={
                                  difference > 0 
                                    ? 'text-green-600' 
                                    : difference < 0 
                                      ? 'text-red-600' 
                                      : ''
                                }>
                                  {difference > 0 ? '+' : ''}{difference}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <h4 className="font-medium mb-2">{t('stock.adjustment_summary')}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>{t('stock.total_items')}:</span>
                        <span>{inventoryItems.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t('stock.items_with_differences')}:</span>
                        <span>{inventoryItems.filter(i => i.actualQuantity !== i.expectedQuantity).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t('stock.positive_adjustments')}:</span>
                        <span className="text-green-600">
                          +{inventoryItems.reduce((sum, item) => {
                            const diff = item.actualQuantity - item.expectedQuantity;
                            return sum + (diff > 0 ? diff : 0);
                          }, 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t('stock.negative_adjustments')}:</span>
                        <span className="text-red-600">
                          {inventoryItems.reduce((sum, item) => {
                            const diff = item.actualQuantity - item.expectedQuantity;
                            return sum + (diff < 0 ? diff : 0);
                          }, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setInventoryState('count')}>
                  {t('stock.back_to_counting')}
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => handleCompleteInventory(false)}
                    disabled={isProcessing}
                  >
                    {t('stock.complete_without_adjustments')}
                  </Button>
                  <Button 
                    onClick={() => handleCompleteInventory(true)}
                    disabled={isProcessing}
                  >
                    {t('stock.complete_with_adjustments')}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        );
        
      case 'complete':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{inventory?.name}</CardTitle>
                  <CardDescription>
                    {t('stock.inventory_completed')}
                  </CardDescription>
                </div>
                <Badge variant="success">
                  {inventory?.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium">{t('stock.inventory_success')}</h3>
                <p className="text-center text-muted-foreground max-w-md">
                  {t('stock.inventory_success_message')}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={handleReset}>
                {t('stock.new_inventory')}
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-6">
        {inventoryState === 'create' ? (
          <Clipboard className="h-5 w-5" />
        ) : inventoryState === 'complete' ? (
          <ClipboardCheck className="h-5 w-5" />
        ) : (
          <>
            <Clipboard className="h-5 w-5" />
            <ArrowRight className="h-4 w-4" />
            <ClipboardCheck className="h-5 w-5" />
          </>
        )}
        <h2 className="text-xl font-semibold">
          {inventoryState === 'create' 
            ? t('stock.new_inventory')
            : inventory?.name || t('stock.inventory')}
        </h2>
      </div>
      
      {renderContent()}
    </div>
  );
} 