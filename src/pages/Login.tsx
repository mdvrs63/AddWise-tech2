
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { User, Shield, Crown, Phone } from 'lucide-react';

const Login = () => {
  const [customerForm, setCustomerForm] = useState({ phone_number: '', otp: '' });
  const [adminForm, setAdminForm] = useState({ phone_number: '', otp: '' });
  const [superAdminForm, setSuperAdminForm] = useState({ phone_number: '', otp: '' });
  const [customerOtpSent, setCustomerOtpSent] = useState(false);
  const [adminOtpSent, setAdminOtpSent] = useState(false);
  const [superAdminOtpSent, setSuperAdminOtpSent] = useState(false);
  const { login, superAdminLogin, generateOtp, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleGenerateCustomerOtp = async () => {
    if (!customerForm.phone_number) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const success = await generateOtp(customerForm.phone_number, 'customer');
      if (success) {
        setCustomerOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "OTP has been sent to your phone number.",
        });
      } else {
        toast({
          title: "Error",
          description: "Phone number not found in database or failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Phone number not found in database or failed to send OTP",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAdminOtp = async () => {
    if (!adminForm.phone_number) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const success = await generateOtp(adminForm.phone_number, 'admin');
      if (success) {
        setAdminOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "OTP has been sent to your phone number.",
        });
      } else {
        toast({
          title: "Error",
          description: "Phone number not found in database or failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Phone number not found in database or failed to send OTP",
        variant: "destructive",
      });
    }
  };

  const handleGenerateSuperAdminOtp = async () => {
    if (!superAdminForm.phone_number) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const success = await generateOtp(superAdminForm.phone_number, 'superadmin');
      if (success) {
        setSuperAdminOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "OTP has been sent to your phone number.",
        });
      } else {
        toast({
          title: "Error",
          description: "Phone number not found in database or failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Phone number not found in database or failed to send OTP",
        variant: "destructive",
      });
    }
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerOtpSent || !customerForm.otp) {
      toast({
        title: "OTP required",
        description: "Please generate and enter OTP first.",
        variant: "destructive",
      });
      return;
    }
    const success = await login(customerForm.phone_number, customerForm.otp, 'customer');
    
    if (success) {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate('/customer/dashboard');
    } else {
      toast({
        title: "Login failed",
        description: "Invalid phone number or OTP.",
        variant: "destructive",
      });
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminOtpSent || !adminForm.otp) {
      toast({
        title: "OTP required",
        description: "Please generate and enter OTP first.",
        variant: "destructive",
      });
      return;
    }
    const success = await login(adminForm.phone_number, adminForm.otp, 'admin');
    
    if (success) {
      toast({
        title: "Admin access granted",
        description: "Welcome to the admin dashboard.",
      });
      navigate('/admin/dashboard');
    } else {
      toast({
        title: "Login failed",
        description: "Invalid admin credentials.",
        variant: "destructive",
      });
    }
  };

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superAdminOtpSent || !superAdminForm.otp) {
      toast({
        title: "OTP required",
        description: "Please generate and enter OTP first.",
        variant: "destructive",
      });
      return;
    }
    const success = await superAdminLogin(superAdminForm.phone_number, superAdminForm.otp);
    
    if (success) {
      toast({
        title: "Super Admin access granted",
        description: "Welcome to the super admin dashboard.",
      });
      navigate('/superadmin/dashboard');
    } else {
      toast({
        title: "Login failed",
        description: "Invalid super admin credentials.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SecureAccess</h1>
          <p className="text-gray-600 mt-2">Role-based authentication system</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>Choose your access level to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="superadmin" className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Super Admin
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="customer" className="space-y-4">
                <form onSubmit={handleCustomerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="customer-phone"
                          type="tel"
                          placeholder="+1234567890"
                          className="pl-10"
                          value={customerForm.phone_number}
                          onChange={(e) => setCustomerForm({ ...customerForm, phone_number: e.target.value })}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleGenerateCustomerOtp}
                        disabled={!customerForm.phone_number || customerOtpSent}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {customerOtpSent ? 'Sent' : 'Generate OTP'}
                      </Button>
                    </div>
                  </div>
                  {customerOtpSent && (
                    <div className="space-y-2">
                      <Label htmlFor="customer-otp">Enter OTP</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="customer-otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          className="pl-10"
                          value={customerForm.otp}
                          onChange={(e) => setCustomerForm({ ...customerForm, otp: e.target.value })}
                          required
                          maxLength={6}
                        />
                      </div>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || !customerOtpSent || !customerForm.otp}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In as Customer'}
                  </Button>
                </form>
                <div className="text-center">
                  <Link 
                    to="/signup" 
                    className="text-sm text-blue-600 hover:text-blue-800 underline block"
                  >
                    Don't have an account? Sign up
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-4">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-phone">Admin Phone Number</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="admin-phone"
                          type="tel"
                          placeholder="+1234567890"
                          className="pl-10"
                          value={adminForm.phone_number}
                          onChange={(e) => setAdminForm({ ...adminForm, phone_number: e.target.value })}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleGenerateAdminOtp}
                        disabled={!adminForm.phone_number || adminOtpSent}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {adminOtpSent ? 'Sent' : 'Generate OTP'}
                      </Button>
                    </div>
                  </div>
                  {adminOtpSent && (
                    <div className="space-y-2">
                      <Label htmlFor="admin-otp">Enter OTP</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="admin-otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          className="pl-10"
                          value={adminForm.otp}
                          onChange={(e) => setAdminForm({ ...adminForm, otp: e.target.value })}
                          required
                          maxLength={6}
                        />
                      </div>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isLoading || !adminOtpSent || !adminForm.otp}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In as Admin'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="superadmin" className="space-y-4">
                <form onSubmit={handleSuperAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="superadmin-phone">Super Admin Phone Number</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="superadmin-phone"
                          type="tel"
                          placeholder="+1234567890"
                          className="pl-10"
                          value={superAdminForm.phone_number}
                          onChange={(e) => setSuperAdminForm({ ...superAdminForm, phone_number: e.target.value })}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleGenerateSuperAdminOtp}
                        disabled={!superAdminForm.phone_number || superAdminOtpSent}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {superAdminOtpSent ? 'Sent' : 'Generate OTP'}
                      </Button>
                    </div>
                  </div>
                  {superAdminOtpSent && (
                    <div className="space-y-2">
                      <Label htmlFor="superadmin-otp">Enter OTP</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="superadmin-otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          className="pl-10"
                          value={superAdminForm.otp}
                          onChange={(e) => setSuperAdminForm({ ...superAdminForm, otp: e.target.value })}
                          required
                          maxLength={6}
                        />
                      </div>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading || !superAdminOtpSent || !superAdminForm.otp}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In as Super Admin'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo Phone Numbers:</p>
          <p>Customer: +1234567890</p>
          <p>Admin: +1234567891</p>
          <p>Super Admin: +1234567892</p>
          <p className="mt-2 text-xs">Use any 6-digit OTP for demo</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
