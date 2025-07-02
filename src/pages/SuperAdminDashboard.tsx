
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import DeviceManagement from '../components/DeviceManagement';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { 
  Crown, 
  Users, 
  LogOut, 
  Shield,
  History,
  RefreshCw,
  Trash2,
  QrCode
} from 'lucide-react';

interface Customer {
  id: number;
  full_name: string;
  username: string;
  phone_number: string;
  created_at: string;
}

interface Admin {
  id: number;
  employee_id: string;
  full_name: string;
  username: string;
  phone_number: string;
  role: string;
  created_at: string;
}

interface LoginLog {
  id: number;
  employee_id: string;
  login_time: string;
}

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [deleteCustomerDialog, setDeleteCustomerDialog] = useState<{
    open: boolean;
    customerId: number | null;
    customerName: string;
  }>({
    open: false,
    customerId: null,
    customerName: ''
  });
  const [deleteAdminDialog, setDeleteAdminDialog] = useState<{
    open: boolean;
    adminId: number | null;
    adminName: string;
  }>({
    open: false,
    adminId: null,
    adminName: ''
  });

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const { data, error } = await supabase
        .from('signup_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        toast({
          title: "Error",
          description: "Failed to fetch customer data.",
          variant: "destructive",
        });
      } else {
        setCustomers((data || []).map(user => ({
          id: user.id,
          full_name: user.full_name,
          username: user.email, // Using email as username since it's missing in the data
          phone_number: user.phone_number,
          created_at: user.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchAdmins = async () => {
    setIsLoadingAdmins(true);
    try {
      const { data, error } = await supabase
        .from('employee_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admins:', error);
        toast({
          title: "Error",
          description: "Failed to fetch admin data.",
          variant: "destructive",
        });
      } else {
        setAdmins((data || []).map(admin => ({
          id: admin.id,
          employee_id: admin.employee_id,
          full_name: admin.full_name,
          username: admin.email, // Using email as username
          phone_number: admin.phone_number,
          role: admin.role,
          created_at: admin.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const fetchLoginLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('employee_login_logs')
        .select('*')
        .order('login_time', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching login logs:', error);
        toast({
          title: "Error",
          description: "Failed to fetch login logs.",
          variant: "destructive",
        });
      } else {
        setLoginLogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching login logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleDeleteCustomerClick = (customerId: number, customerName: string) => {
    setDeleteCustomerDialog({
      open: true,
      customerId,
      customerName
    });
  };

  const handleDeleteAdminClick = (adminId: number, adminName: string) => {
    setDeleteAdminDialog({
      open: true,
      adminId,
      adminName
    });
  };

  const confirmDeleteCustomer = async () => {
    if (!deleteCustomerDialog.customerId) return;

    try {
      const { error } = await supabase
        .from('signup_users')
        .delete()
        .eq('id', deleteCustomerDialog.customerId);

      if (error) {
        console.error('Error deleting customer:', error);
        toast({
          title: "Error",
          description: "Failed to delete customer.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Customer deleted successfully.",
        });
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    } finally {
      setDeleteCustomerDialog({ open: false, customerId: null, customerName: '' });
    }
  };

  const confirmDeleteAdmin = async () => {
    if (!deleteAdminDialog.adminId) return;

    try {
      const { error } = await supabase
        .from('employee_data')
        .delete()
        .eq('id', deleteAdminDialog.adminId);

      if (error) {
        console.error('Error deleting admin:', error);
        toast({
          title: "Error",
          description: "Failed to delete admin.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Admin deleted successfully.",
        });
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
    } finally {
      setDeleteAdminDialog({ open: false, adminId: null, adminName: '' });
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchAdmins();
    fetchLoginLogs();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SecureAccess</h1>
                <p className="text-sm text-gray-600">Super Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-red-600 capitalize font-semibold">{user?.role}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Super Admin Dashboard 👑
          </h2>
          <p className="text-gray-600">
            Complete system oversight: customers, admins, devices, and security logs.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Login Events</p>
                  <p className="text-2xl font-bold text-gray-900">{loginLogs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-2/3">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="logs">Login Logs</TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Customer Details
                </CardTitle>
                <CardDescription>
                  Complete overview of all registered customers
                </CardDescription>
                <Button 
                  onClick={fetchCustomers}
                  disabled={isLoadingCustomers}
                  className="w-fit"
                >
                  {isLoadingCustomers ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh Data
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>{customer.full_name}</TableCell>
                          <TableCell className="font-mono text-sm">{customer.username}</TableCell>
                          <TableCell>{customer.phone_number}</TableCell>
                          <TableCell>
                            {new Date(customer.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCustomerClick(customer.id, customer.full_name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {customers.length === 0 && !isLoadingCustomers && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No customers found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admin Details
                </CardTitle>
                <CardDescription>
                  Manage and monitor all system administrators
                </CardDescription>
                <Button 
                  onClick={fetchAdmins}
                  disabled={isLoadingAdmins}
                  className="w-fit"
                >
                  {isLoadingAdmins ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh Data
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">{admin.employee_id}</TableCell>
                          <TableCell>{admin.full_name}</TableCell>
                          <TableCell className="font-mono text-sm">{admin.username}</TableCell>
                          <TableCell>{admin.phone_number}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                              {admin.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Active
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(admin.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAdminClick(admin.id, admin.full_name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {admins.length === 0 && !isLoadingAdmins && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No admins found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <DeviceManagement />
          </TabsContent>

          {/* Login Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Admin Login Logs
                </CardTitle>
                <CardDescription>
                  Complete audit trail of all admin login activities
                </CardDescription>
                <Button 
                  onClick={fetchLoginLogs}
                  disabled={isLoadingLogs}
                  className="w-fit"
                >
                  {isLoadingLogs ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh Logs
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Login Time</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loginLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono">{log.employee_id}</TableCell>
                          <TableCell>
                            {new Date(log.login_time).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Success
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {loginLogs.length === 0 && !isLoadingLogs && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No login logs found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <ConfirmationDialog
        open={deleteCustomerDialog.open}
        onOpenChange={(open) => setDeleteCustomerDialog({ ...deleteCustomerDialog, open })}
        title="Delete Customer"
        description={`Are you sure you want to delete customer "${deleteCustomerDialog.customerName}"? This action cannot be undone and will remove all their data.`}
        onConfirm={confirmDeleteCustomer}
        confirmText="Delete Customer"
      />

      <ConfirmationDialog
        open={deleteAdminDialog.open}
        onOpenChange={(open) => setDeleteAdminDialog({ ...deleteAdminDialog, open })}
        title="Delete Admin"
        description={`Are you sure you want to delete admin "${deleteAdminDialog.adminName}"? This action cannot be undone and will remove all their data.`}
        onConfirm={confirmDeleteAdmin}
        confirmText="Delete Admin"
      />
    </div>
  );
};

export default SuperAdminDashboard;
