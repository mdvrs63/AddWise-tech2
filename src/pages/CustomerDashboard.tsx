import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { CustomerSidebar } from '../components/CustomerSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Mail, Phone, MapPin, Users, Award, Lightbulb, Building2, Smartphone, Wifi, Server } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import CustomerDevices from '../components/CustomerDevices';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { toast } from '@/hooks/use-toast';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [customerData, setCustomerData] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (user) {
      fetchCustomerData();
    }
  }, [user]);

  const fetchCustomerData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('signup_users')
        .select('*')
        .eq('id', parseInt(user.id))
        .single();

      if (data) {
        setCustomerData(data);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const getRegistrationYear = () => {
    if (customerData?.created_at) {
      // Convert to India time (UTC+5:30)
      const utcDate = new Date(customerData.created_at);
      const indiaTime = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
      return indiaTime.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return new Date().toLocaleDateString('en-IN');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'deletemyaccount') {
      toast({
        title: "Error",
        description: "Please type 'deletemyaccount' to confirm deletion.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    try {
      // Delete from signup_users table
      const { error: deleteError } = await supabase
        .from('signup_users')
        .delete()
        .eq('id', parseInt(user.id));

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      // Logout user after successful deletion
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to AddWise Tech Innovation</h1>
          <p className="text-xl mb-6">Transforming Industries with Cutting-Edge Technology Solutions</p>
          <p className="text-lg opacity-90">
            We specialize in IoT, AI, Web Technologies, Mobile Applications, Industry 4.0, and Secure Server Solutions
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">Our Exclusive Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wifi className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Industrial Internet of Things</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Cutting-edge IoT and IIoT products that connect and optimize your devices for seamless integration and enhanced efficiency.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Lightbulb className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>Artificial Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced AI solutions that drive innovation, automate processes, and deliver intelligent insights.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building2 className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>Web Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Robust web technologies designed to create dynamic, responsive, and user-friendly websites and applications.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Smartphone className="w-8 h-8 text-orange-600 mb-2" />
              <CardTitle>Mobile Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                High-performance mobile applications tailored to provide exceptional user experiences on both Android and iOS platforms.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Award className="w-8 h-8 text-red-600 mb-2" />
              <CardTitle>Industry 4.0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Supercharge your industries with advanced Technologies like IIOT + AI in Industry 4.0 to your Real Time Dashboards.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Server className="w-8 h-8 text-indigo-600 mb-2" />
              <CardTitle>Secured Servers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                SuperSecured Servers with desired network LAN / WAN / MAN & Internet with advanced layers and protocols.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            About AddWise Tech Innovation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            At AddWise Tech Innovation, we are pioneers in delivering cutting-edge technology solutions that transform industries and drive digital transformation.
          </p>
          <p>
            Our mission is to empower businesses with innovative IoT, AI, and digital solutions that enhance efficiency, productivity, and competitiveness in the modern marketplace.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Expert Team</h3>
              <p className="text-sm text-gray-600">Skilled professionals dedicated to excellence</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">Innovation</h3>
              <p className="text-sm text-gray-600">Cutting-edge solutions for modern challenges</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">Security</h3>
              <p className="text-sm text-gray-600">Advanced security protocols and practices</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Contact Us
          </CardTitle>
          <CardDescription>Get in touch with our team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">info@addwisetech.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">123 Innovation Street, Tech City, TC 12345</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Business Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Account Information
          </CardTitle>
          <CardDescription>Your account details and information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-lg font-semibold">{customerData?.full_name || user?.name}</p>
              </div>


              <div>
                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                <p className="text-lg">{customerData?.phone_number || user?.phone_number || 'Not provided'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Account Type</label>
                <p className="text-lg capitalize">{user?.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Member Since</label>
                <p className="text-lg">{getRegistrationYear()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Account Status</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
          
          {/* Delete Account Section */}
          <div className="pt-6 border-t border-gray-200">
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Delete My Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Account"
        description=""
        confirmText="Delete Account"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-2">⚠️ This action is permanent!</p>
            <p className="text-sm text-red-700">
              Are you sure you want to delete your account? Once deleted, accounts cannot be restored.
              All your data, including devices and settings, will be permanently removed.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-mono bg-gray-100 px-1 rounded">deletemyaccount</span> to confirm:
            </label>
            <Input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type 'deletemyaccount' to confirm"
              className="w-full"
            />
          </div>
        </div>
      </ConfirmationDialog>
    </div>
  );

  const renderAddDevice = () => {
    return <QRScanner />;
  };

  const renderMyDevices = () => {
    return <CustomerDevices />;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'add-device':
        return renderAddDevice();
      case 'my-devices':
        return renderMyDevices();
      case 'account':
        return renderAccount();
      case 'about':
        return renderAbout();
      case 'contact':
        return renderContact();
      default:
        return renderDashboard();
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <CustomerSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <SidebarInset className="flex-1">
          <div className="flex items-center gap-2 p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">AddWise Tech Innovation</h1>
          </div>
          <div className="p-6 h-full overflow-auto">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default CustomerDashboard;
