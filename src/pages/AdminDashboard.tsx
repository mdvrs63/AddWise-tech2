
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
  Shield, 
  Users, 
  LogOut, 
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

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    customerId: number | null;
    customerName: string;
  }>({
    open: false,
    customerId: null,
    customerName: ''
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
          username: user.email, // Using email as username since it's missing
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

  const handleDeleteClick = (customerId: number, customerName: string) => {
    setDeleteDialog({
      open: true,
      customerId,
      customerName
    });
  };

  const confirmDeleteCustomer = async () => {
    if (!deleteDialog.customerId) return;

    try {
      const { error } = await supabase
        .from('signup_users')
        .delete()
        .eq('id', deleteDialog.customerId);

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
      setDeleteDialog({ open: false, customerId: null, customerName: '' });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AddWise Tech</h1>
                <p className="text-sm text-gray-600">Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-purple-600 capitalize font-semibold">{user?.role}</p>
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
            Admin Dashboard 🛡️
          </h2>
          <p className="text-gray-600">
            Manage customer accounts and system devices.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8">
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
        </div>

        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-1/2">
            <TabsTrigger value="customers">Customer Management</TabsTrigger>
            <TabsTrigger value="devices">Device Management</TabsTrigger>
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
                  View and manage all registered customers
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
                              onClick={() => handleDeleteClick(customer.id, customer.full_name)}
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

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <DeviceManagement />
          </TabsContent>
        </Tabs>
      </main>

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete Customer"
        description={`Are you sure you want to delete customer "${deleteDialog.customerName}"? This action cannot be undone and will remove all their data.`}
        onConfirm={confirmDeleteCustomer}
        confirmText="Delete Customer"
      />
    </div>
  );
};

export default AdminDashboard;
