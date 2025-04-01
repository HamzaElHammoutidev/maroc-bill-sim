import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PlusIcon, MoreHorizontalIcon, UserPlusIcon, MailIcon, EditIcon, BanIcon, TrashIcon, UnlockIcon } from 'lucide-react';

// Interface for extended User type with status
interface ExtendedUser {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  companyId?: string;
  phone?: string;
  status: 'active' | 'pending' | 'suspended' | 'archived';
  lastLogin?: string;
  createdAt: string;
  createdBy?: string;
}

// Mock users for demonstration
const MOCK_USERS: ExtendedUser[] = [
  {
    id: '1',
    name: 'Super Admin',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@example.com',
    role: 'superadmin',
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    lastLogin: '2023-04-28T14:30:00Z'
  },
  {
    id: '2',
    name: 'Company Admin',
    firstName: 'Company',
    lastName: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    companyId: '101',
    status: 'active',
    createdAt: '2023-01-15T00:00:00Z',
    lastLogin: '2023-04-27T10:15:00Z'
  },
  {
    id: '3',
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'comptable@example.com',
    role: 'comptable',
    companyId: '101',
    phone: '+212 661 234567',
    status: 'active',
    createdAt: '2023-02-01T00:00:00Z',
    lastLogin: '2023-04-25T09:45:00Z'
  },
  {
    id: '4',
    name: 'Jane Smith',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'commercial@example.com',
    role: 'commercial',
    companyId: '101',
    phone: '+212 662 345678',
    status: 'suspended',
    createdAt: '2023-02-15T00:00:00Z',
    lastLogin: '2023-03-10T11:20:00Z'
  },
  {
    id: '5',
    name: 'Alex Johnson',
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'pending@example.com',
    role: 'comptable',
    companyId: '101',
    status: 'pending',
    createdAt: '2023-04-01T00:00:00Z'
  }
];

const Users = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { companies, currentCompany } = useCompany();
  
  // State
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'commercial' as UserRole,
    companyId: currentCompany?.id || '',
  });

  // Initialize with mock data
  useEffect(() => {
    // Filter users based on current user's role
    let filteredUsers = [...MOCK_USERS];
    
    // If not superadmin, only show users from the same company
    if (user?.role !== 'superadmin' && user?.companyId) {
      filteredUsers = filteredUsers.filter(u => u.companyId === user.companyId);
    }
    
    setUsers(filteredUsers);
    setFilteredUsers(filteredUsers);
  }, [user]);

  // Filter users when search or status filter changes
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => 
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.phone && user.phone.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(result);
  }, [users, searchQuery, statusFilter]);

  // Handle status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'suspended':
        return 'bg-red-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Create new user
  const handleCreateUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast.error(t('users.form.missingFields'));
      return;
    }

    const fullName = `${newUser.firstName} ${newUser.lastName}`;
    
    // Create user with a temporary ID
    const createdUser: ExtendedUser = {
      id: `tmp-${Date.now()}`,
      name: fullName,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      companyId: newUser.companyId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: user?.id
    };
    
    // Add to the list
    setUsers(prev => [createdUser, ...prev]);
    
    // Close the dialog and reset form
    setIsCreateDialogOpen(false);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'commercial',
      companyId: currentCompany?.id || '',
    });
    
    // Show success message
    toast.success(t('users.created'));
    
    // In real app: send activation email to user here
    toast.info(t('users.activationEmailSent'));
  };

  // Update user
  const handleUpdateUser = () => {
    if (!selectedUser) return;
    
    setUsers(prev => 
      prev.map(u => 
        u.id === selectedUser.id ? selectedUser : u
      )
    );
    
    setIsEditDialogOpen(false);
    toast.success(t('users.updated'));
  };

  // Suspend/Activate user
  const toggleUserStatus = (userId: string) => {
    setUsers(prev => 
      prev.map(u => {
        if (u.id === userId) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
    
    const user = users.find(u => u.id === userId);
    if (user) {
      toast.success(
        user.status === 'active' 
          ? t('users.suspended') 
          : t('users.activated')
      );
    }
  };

  // Delete user
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
    setIsDeleteDialogOpen(false);
    toast.success(t('users.deleted'));
  };

  // Archive user (soft delete)
  const archiveUser = (userId: string) => {
    setUsers(prev => 
      prev.map(u => {
        if (u.id === userId) {
          return { ...u, status: 'archived' };
        }
        return u;
      })
    );
    
    toast.success(t('users.archived'));
  };

  // Send activation email
  const sendActivationEmail = (userId: string) => {
    // In real app, this would call an API to send an email
    toast.success(t('users.activationEmailSent'));
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="users.title"
        description="users.description"
      />
      
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex-1 w-full sm:max-w-sm">
          <Input
            placeholder={t('users.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('users.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('users.status.all')}</SelectItem>
              <SelectItem value="active">{t('users.status.active')}</SelectItem>
              <SelectItem value="pending">{t('users.status.pending')}</SelectItem>
              <SelectItem value="suspended">{t('users.status.suspended')}</SelectItem>
              <SelectItem value="archived">{t('users.status.archived')}</SelectItem>
            </SelectContent>
          </Select>
          {(user?.role === 'superadmin' || user?.role === 'admin') && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlusIcon className="h-4 w-4 mr-2" />
              {t('users.addUser')}
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('users.table.name')}</TableHead>
              <TableHead>{t('users.table.email')}</TableHead>
              <TableHead>{t('users.table.role')}</TableHead>
              <TableHead>{t('users.table.status')}</TableHead>
              <TableHead>{t('users.table.lastLogin')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t('users.noUsersFound')}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(`users.roles.${user.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(user.status)}>
                      {t(`users.status.${user.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">{t('common.openMenu')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.status === 'pending' && (
                          <DropdownMenuItem onClick={() => sendActivationEmail(user.id)}>
                            <MailIcon className="mr-2 h-4 w-4" />
                            {t('users.actions.resendActivation')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <EditIcon className="mr-2 h-4 w-4" />
                          {t('users.actions.edit')}
                        </DropdownMenuItem>
                        {user.status !== 'archived' && (
                          <>
                            <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                              {user.status === 'active' ? (
                                <>
                                  <BanIcon className="mr-2 h-4 w-4" />
                                  {t('users.actions.suspend')}
                                </>
                              ) : (
                                <>
                                  <UnlockIcon className="mr-2 h-4 w-4" />
                                  {t('users.actions.activate')}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <TrashIcon className="mr-2 h-4 w-4" />
                              {t('users.actions.delete')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('users.dialog.createTitle')}</DialogTitle>
            <DialogDescription>
              {t('users.dialog.createDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('users.form.firstName')}</Label>
                <Input
                  id="firstName"
                  placeholder={t('users.form.firstNamePlaceholder')}
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('users.form.lastName')}</Label>
                <Input
                  id="lastName"
                  placeholder={t('users.form.lastNamePlaceholder')}
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('users.form.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('users.form.role')}</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value) => setNewUser({...newUser, role: value as UserRole})}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder={t('users.form.rolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {/* Only superadmin can create admin users */}
                  {user?.role === 'superadmin' && (
                    <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
                  )}
                  <SelectItem value="comptable">{t('users.roles.comptable')}</SelectItem>
                  <SelectItem value="commercial">{t('users.roles.commercial')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Company selection (only for superadmin) */}
            {user?.role === 'superadmin' && (
              <div className="space-y-2">
                <Label htmlFor="company">{t('users.form.company')}</Label>
                <Select 
                  value={newUser.companyId} 
                  onValueChange={(value) => setNewUser({...newUser, companyId: value})}
                >
                  <SelectTrigger id="company">
                    <SelectValue placeholder={t('users.form.companyPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateUser}>
              {t('users.form.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('users.dialog.editTitle')}</DialogTitle>
            <DialogDescription>
              {t('users.dialog.editDescription')}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">{t('users.form.firstName')}</Label>
                  <Input
                    id="editFirstName"
                    placeholder={t('users.form.firstNamePlaceholder')}
                    value={selectedUser.firstName || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser, 
                      firstName: e.target.value,
                      name: `${e.target.value} ${selectedUser.lastName || ''}`
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">{t('users.form.lastName')}</Label>
                  <Input
                    id="editLastName"
                    placeholder={t('users.form.lastNamePlaceholder')}
                    value={selectedUser.lastName || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser, 
                      lastName: e.target.value,
                      name: `${selectedUser.firstName || ''} ${e.target.value}`
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">{t('users.form.email')}</Label>
                <Input
                  id="editEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">{t('users.form.phone')}</Label>
                <Input
                  id="editPhone"
                  type="tel"
                  placeholder="+212 661 234567"
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">{t('users.form.role')}</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value) => setSelectedUser({...selectedUser, role: value as UserRole})}
                >
                  <SelectTrigger id="editRole">
                    <SelectValue placeholder={t('users.form.rolePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Only superadmin can edit to admin role */}
                    {user?.role === 'superadmin' && (
                      <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
                    )}
                    <SelectItem value="comptable">{t('users.roles.comptable')}</SelectItem>
                    <SelectItem value="commercial">{t('users.roles.commercial')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Company selection (only for superadmin) */}
              {user?.role === 'superadmin' && (
                <div className="space-y-2">
                  <Label htmlFor="editCompany">{t('users.form.company')}</Label>
                  <Select 
                    value={selectedUser.companyId || ''} 
                    onValueChange={(value) => setSelectedUser({...selectedUser, companyId: value})}
                  >
                    <SelectTrigger id="editCompany">
                      <SelectValue placeholder={t('users.form.companyPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUpdateUser}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('users.dialog.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('users.dialog.deleteDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>{t('users.dialog.deleteWarning')}</p>
            <div className="mt-4 flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedUser) {
                    archiveUser(selectedUser.id);
                  }
                  setIsDeleteDialogOpen(false);
                }}
              >
                {t('users.actions.archive')}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteUser}
              >
                {t('users.actions.permanentDelete')}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users; 