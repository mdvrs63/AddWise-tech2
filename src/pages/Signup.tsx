
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { User, ArrowLeft, Phone, Shield } from 'lucide-react';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    otp: ''
  });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const { signup, generateOtp, verifyOtp, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleGenerateOtp = async () => {
    if (!form.phone_number) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await generateOtp(form.phone_number, 'customer');
      if (success) {
        setIsOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the OTP",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.otp) {
      toast({
        title: "OTP required",
        description: "Please enter the OTP.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await verifyOtp(form.phone_number, form.otp);
      if (success) {
        setIsOtpVerified(true);
        toast({
          title: "OTP Verified",
          description: "Phone number verified successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid OTP",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOtpVerified) {
      toast({
        title: "Phone verification required",
        description: "Please verify your phone number with OTP first.",
        variant: "destructive",
      });
      return;
    }

    const success = await signup(form);
    
    if (success) {
      toast({
        title: "Account created!",
        description: "Welcome to SecureAccess. You are now logged in.",
      });
      navigate('/customer/dashboard');
    } else {
      toast({
        title: "Signup failed",
        description: "An account with this phone number already exists.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Join SecureAccess as a customer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      className="pl-10"
                      value={form.phone_number}
                      onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                      required
                      disabled={isOtpVerified}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleGenerateOtp}
                    disabled={!form.phone_number || isOtpSent || isOtpVerified}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isOtpVerified ? 'Verified' : isOtpSent ? 'Sent' : 'Generate OTP'}
                  </Button>
                </div>
              </div>

              {isOtpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        className="pl-10"
                        value={form.otp}
                        onChange={(e) => setForm({ ...form, otp: e.target.value })}
                        required
                        disabled={isOtpVerified}
                        maxLength={6}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={!form.otp || isOtpVerified}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isOtpVerified ? 'Verified' : 'Verify OTP'}
                    </Button>
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
