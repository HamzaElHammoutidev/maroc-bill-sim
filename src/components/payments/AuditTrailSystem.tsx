import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, sub, compareDesc } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileDown, Eye, List, UserCircle2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Types for audit trail
export type AuditEventType = 
  | 'payment_created'
  | 'payment_updated'
  | 'payment_deleted'
  | 'invoice_paid'
  | 'invoice_partially_paid'
  | 'payment_method_changed'
  | 'payment_amount_changed'
  | 'payment_voided'
  | 'payment_receipt_uploaded'
  | 'payment_exported'
  | 'vat_declared'
  | 'vat_paid'
  | 'user_login'
  | 'user_logout'
  | 'settings_changed';

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  userId: string;
  userName: string;
  targetId: string;
  targetType: 'payment' | 'invoice' | 'client' | 'vat' | 'user' | 'system';
  description: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  isSystemGenerated: boolean;
}

interface AuditTrailSystemProps {
  onExport?: (format: string, dateRange?: DateRange) => void;
  onFilterChange?: (filters: AuditTrailFilters) => void;
}

interface AuditTrailFilters {
  dateRange?: DateRange;
  eventType?: string;
  userId?: string;
  targetType?: string;
  searchQuery?: string;
}

// Generate mock audit events for the demo
const generateMockAuditEvents = (): AuditEvent[] => {
  const events: AuditEvent[] = [];
  const now = new Date();
  
  // Mock users
  const users = [
    { id: 'user-1', name: 'Ahmed Bennani' },
    { id: 'user-2', name: 'Fatima Zahra' },
    { id: 'user-3', name: 'Karim Alaoui' },
    { id: 'system', name: 'System' }
  ];
  
  // Event types with descriptions
  const eventTypes: Record<AuditEventType, string> = {
    payment_created: 'Payment created',
    payment_updated: 'Payment updated',
    payment_deleted: 'Payment deleted',
    invoice_paid: 'Invoice marked as paid',
    invoice_partially_paid: 'Invoice marked as partially paid',
    payment_method_changed: 'Payment method changed',
    payment_amount_changed: 'Payment amount changed',
    payment_voided: 'Payment voided',
    payment_receipt_uploaded: 'Payment receipt uploaded',
    payment_exported: 'Payment exported to accounting',
    vat_declared: 'VAT declared',
    vat_paid: 'VAT paid',
    user_login: 'User logged in',
    user_logout: 'User logged out',
    settings_changed: 'Settings changed'
  };
  
  // Generate a random set of events over the past month
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = sub(now, { days: daysAgo, hours: hoursAgo }).toISOString();
    
    const user = users[Math.floor(Math.random() * (users.length - 1))]; // Exclude system user for most events
    const eventTypeKeys = Object.keys(eventTypes) as AuditEventType[];
    const eventType = eventTypeKeys[Math.floor(Math.random() * eventTypeKeys.length)];
    
    // Determine target type based on event type
    let targetType: 'payment' | 'invoice' | 'client' | 'vat' | 'user' | 'system' = 'payment';
    if (eventType.startsWith('invoice')) {
      targetType = 'invoice';
    } else if (eventType.startsWith('vat')) {
      targetType = 'vat';
    } else if (eventType.startsWith('user')) {
      targetType = 'user';
    } else if (eventType === 'settings_changed') {
      targetType = 'system';
    }
    
    // Generate a target ID
    const targetId = `${targetType}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Generate old and new values for update events
    let oldValue, newValue;
    if (eventType === 'payment_method_changed') {
      const methods = ['cash', 'bank', 'check', 'other'];
      oldValue = methods[Math.floor(Math.random() * methods.length)];
      newValue = methods[Math.floor(Math.random() * methods.length)];
      while (newValue === oldValue) {
        newValue = methods[Math.floor(Math.random() * methods.length)];
      }
    } else if (eventType === 'payment_amount_changed') {
      const oldAmount = Math.floor(1000 + Math.random() * 9000);
      const newAmount = Math.floor(1000 + Math.random() * 9000);
      oldValue = oldAmount.toString();
      newValue = newAmount.toString();
    }
    
    // Determine if system generated
    const isSystemGenerated = eventType.includes('vat') || eventType === 'settings_changed' || Math.random() < 0.1;
    const actualUser = isSystemGenerated ? users[3] : user; // Use system user for system-generated events
    
    // Create the event
    events.push({
      id: `audit-${i}`,
      timestamp,
      eventType,
      userId: actualUser.id,
      userName: actualUser.name,
      targetId,
      targetType,
      description: eventTypes[eventType],
      oldValue,
      newValue,
      ipAddress: isSystemGenerated ? undefined : `192.168.1.${Math.floor(Math.random() * 255)}`,
      isSystemGenerated
    });
  }
  
  // Sort by timestamp (most recent first)
  return events.sort((a, b) => compareDesc(new Date(a.timestamp), new Date(b.timestamp)));
};

export const AuditTrailSystem: React.FC<AuditTrailSystemProps> = ({
  onExport,
  onFilterChange
}) => {
  const { t } = useTranslation();
  const [auditEvents] = useState<AuditEvent[]>(generateMockAuditEvents());
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: sub(new Date(), { days: 7 }),
    to: new Date()
  });
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = [...auditEvents];
    
    // Date range filter
    if (dateRange?.from) {
      filtered = filtered.filter(event => 
        new Date(event.timestamp) >= dateRange.from!
      );
    }
    
    if (dateRange?.to) {
      filtered = filtered.filter(event => 
        new Date(event.timestamp) <= dateRange.to!
      );
    }
    
    // Event type filter
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === eventTypeFilter);
    }
    
    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(event => event.userId === userFilter);
    }
    
    // Target type filter
    if (targetTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.targetType === targetTypeFilter);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.description.toLowerCase().includes(query) ||
        event.targetId.toLowerCase().includes(query) ||
        event.userName.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [auditEvents, dateRange, eventTypeFilter, userFilter, targetTypeFilter, searchQuery]);
  
  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = new Map<string, { id: string; name: string }>();
    auditEvents.forEach(event => {
      if (!users.has(event.userId)) {
        users.set(event.userId, { id: event.userId, name: event.userName });
      }
    });
    return Array.from(users.values());
  }, [auditEvents]);
  
  // Get unique event types for filter
  const uniqueEventTypes = useMemo(() => {
    const types = new Set<string>();
    auditEvents.forEach(event => {
      types.add(event.eventType);
    });
    return Array.from(types);
  }, [auditEvents]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Handle export
  const handleExport = (format: string) => {
    if (onExport) {
      onExport(format, dateRange);
    }
  };
  
  // Handle filter change
  const handleFilterChange = () => {
    if (onFilterChange) {
      onFilterChange({
        dateRange,
        eventType: eventTypeFilter,
        userId: userFilter,
        targetType: targetTypeFilter,
        searchQuery
      });
    }
  };
  
  // View event details
  const handleViewEventDetails = (event: AuditEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };
  
  // Format target type for display
  const formatTargetType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Format event type for display
  const formatEventType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5 text-blue-500" />
                {t('audit.title')}
              </CardTitle>
              <CardDescription>
                {t('audit.description')}
              </CardDescription>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <FileDown className="h-4 w-4 mr-2" />
              {t('audit.export')}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="h-4 w-4" />
                {t('audit.filters')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date Range Filter */}
              <div>
                <Label>{t('audit.date_range')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>{t('audit.select_date_range')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Event Type Filter */}
              <div>
                <Label>{t('audit.event_type')}</Label>
                <Select
                  value={eventTypeFilter}
                  onValueChange={setEventTypeFilter}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('audit.select_event_type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {uniqueEventTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {formatEventType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* User Filter */}
              <div>
                <Label>{t('audit.user')}</Label>
                <Select
                  value={userFilter}
                  onValueChange={setUserFilter}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('audit.select_user')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Target Type Filter */}
              <div>
                <Label>{t('audit.target_type')}</Label>
                <Select
                  value={targetTypeFilter}
                  onValueChange={setTargetTypeFilter}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('audit.select_target_type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="payment">{t('audit.target_payment')}</SelectItem>
                    <SelectItem value="invoice">{t('audit.target_invoice')}</SelectItem>
                    <SelectItem value="client">{t('audit.target_client')}</SelectItem>
                    <SelectItem value="vat">{t('audit.target_vat')}</SelectItem>
                    <SelectItem value="user">{t('audit.target_user')}</SelectItem>
                    <SelectItem value="system">{t('audit.target_system')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Search */}
              <div className="md:col-span-3">
                <Label>{t('common.search')}</Label>
                <Input
                  type="text"
                  placeholder={t('audit.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="md:col-span-1 mt-6 md:mt-0 flex justify-end">
                <Button onClick={handleFilterChange}>
                  {t('audit.apply_filters')}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Audit Trail Table */}
          <div className="border rounded-md overflow-auto">
            <Table>
              <TableCaption>{t('audit.table_caption')}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('audit.timestamp')}</TableHead>
                  <TableHead>{t('audit.event')}</TableHead>
                  <TableHead>{t('audit.user')}</TableHead>
                  <TableHead>{t('audit.target')}</TableHead>
                  <TableHead className="text-center">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      {t('audit.no_events_found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map(event => (
                    <TableRow key={event.id}>
                      <TableCell className="whitespace-nowrap">
                        <div>
                          {format(new Date(event.timestamp), 'PPP')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.timestamp), 'p')}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "whitespace-nowrap",
                              event.eventType.includes('deleted') || event.eventType.includes('voided') 
                                ? "border-red-200 bg-red-50 text-red-800" 
                                : event.eventType.includes('created') || event.eventType.includes('paid')
                                ? "border-green-200 bg-green-50 text-green-800"
                                : "border-blue-200 bg-blue-50 text-blue-800"
                            )}
                          >
                            {formatEventType(event.eventType)}
                          </Badge>
                          
                          {event.isSystemGenerated && (
                            <HoverCard>
                              <HoverCardTrigger>
                                <Badge variant="secondary" className="text-xs">
                                  {t('audit.automated')}
                                </Badge>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <p className="text-sm">
                                  {t('audit.system_generated_description')}
                                </p>
                              </HoverCardContent>
                            </HoverCard>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                          <span>{event.userName}</span>
                        </div>
                        {event.ipAddress && (
                          <div className="text-xs text-muted-foreground mt-1">
                            IP: {event.ipAddress}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="rounded-md">
                            {formatTargetType(event.targetType)}
                          </Badge>
                          <span className="text-xs font-mono">
                            {event.targetId}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewEventDetails(event)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('audit.view')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {filteredEvents.length > itemsPerPage && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) paginate(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNumber = i + 1;
                    // If more than 5 pages, show first, last, and middle pages
                    if (totalPages > 5) {
                      const pageNumbers = [];
                      pageNumbers.push(1);
                      
                      if (currentPage > 3) {
                        pageNumbers.push(null); // Ellipsis
                      }
                      
                      // Pages around current page
                      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                        pageNumbers.push(i);
                      }
                      
                      if (currentPage < totalPages - 2) {
                        pageNumbers.push(null); // Ellipsis
                      }
                      
                      pageNumbers.push(totalPages);
                      
                      return pageNumbers.map((page, index) => {
                        if (page === null) {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                paginate(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      });
                    }
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            paginate(pageNumber);
                          }}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) paginate(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">
            {t('audit.showing')} {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEvents.length)} {t('audit.of')} {filteredEvents.length} {t('audit.events')}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('audit.last_updated')}: {format(new Date(), 'PPp')}
          </div>
        </CardFooter>
      </Card>
      
      {/* Event Details Dialog */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('audit.event_details')}</DialogTitle>
            <DialogDescription>
              {t('audit.event_details_description')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t('audit.event_id')}</Label>
                  <p className="text-sm font-mono">{selectedEvent.id}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t('audit.timestamp')}</Label>
                  <p className="text-sm">{format(new Date(selectedEvent.timestamp), 'PPP p')}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t('audit.event_type')}</Label>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      selectedEvent.eventType.includes('deleted') || selectedEvent.eventType.includes('voided') 
                        ? "border-red-200 bg-red-50 text-red-800" 
                        : selectedEvent.eventType.includes('created') || selectedEvent.eventType.includes('paid')
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-blue-200 bg-blue-50 text-blue-800"
                    )}
                  >
                    {formatEventType(selectedEvent.eventType)}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t('audit.user')}</Label>
                  <div className="flex items-center space-x-2">
                    <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedEvent.userName}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t('audit.target_type')}</Label>
                  <p className="text-sm">{formatTargetType(selectedEvent.targetType)}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t('audit.target_id')}</Label>
                  <p className="text-sm font-mono">{selectedEvent.targetId}</p>
                </div>
                
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">{t('audit.description')}</Label>
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
                
                {selectedEvent.oldValue && selectedEvent.newValue && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{t('audit.old_value')}</Label>
                      <p className="text-sm">{selectedEvent.oldValue}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{t('audit.new_value')}</Label>
                      <p className="text-sm">{selectedEvent.newValue}</p>
                    </div>
                  </>
                )}
                
                {selectedEvent.ipAddress && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('audit.ip_address')}</Label>
                    <p className="text-sm font-mono">{selectedEvent.ipAddress}</p>
                  </div>
                )}
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t('audit.source')}</Label>
                  <p className="text-sm">
                    {selectedEvent.isSystemGenerated 
                      ? t('audit.automated_process')
                      : t('audit.user_action')}
                  </p>
                </div>
              </div>
              
              {selectedEvent.metadata && (
                <div className="mt-4 border-t pt-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">{t('audit.additional_metadata')}</Label>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEventDetails(false)}
            >
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditTrailSystem; 