EGL276

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  name: string;
  email_id: string;
  role: 'customer' | 'admin' | 'superadmin';
  employee_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email_id: string, otp: string, role: 'customer' | 'admin') => Promise<boolean>;
  logout: () => void;
  signup: (userData: any) => Promise<boolean>;
  superAdminLogin: (email_id: string, otp: string) => Promise<boolean>;
  generateOtp: (email_id: string, role: 'customer' | 'admin' | 'superadmin') => Promise<boolean>;
  verifyOtp: (email_id: string, otp: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email_id: string, otp: string, role: 'customer' | 'admin'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      if (role === 'customer') {
        // Check customer credentials in signup_users table
        const { data: customerData, error } = await supabase
          .from('signup_users')
          .select('*')
          .eq('email_id', email_id)
          .single();

        if (error || !customerData) {
          setIsLoading(false);
          return false;
        }

        // Verify OTP using the verifyOtp function
        const isOtpValid = await verifyOtp(email_id, otp);
        if (!isOtpValid) {
          setIsLoading(false);
          return false;
        }

        const userData = {
          id: customerData.id.toString(),
          name: customerData.full_name,
          email_id: customerData.email_id,
          role: 'customer' as const,
        };
        
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setIsLoading(false);
        return true;
      } else {
        // Check admin credentials in employee_data table
        const { data: adminData, error } = await supabase
          .from('employee_data')
          .select('*')
          .eq('email_id', email_id)
          .single();

        if (error || !adminData) {
          setIsLoading(false);
          return false;
        }

        // Verify OTP using the verifyOtp function
        const isOtpValid = await verifyOtp(email_id, otp);
        if (!isOtpValid) {
          setIsLoading(false);
          return false;
        }

        // Log admin login
        const { error: loginLogError } = await supabase
          .from('employee_login_logs')
          .insert({
            employee_id: adminData.employee_id,
            login_time: new Date().toISOString()
          });
        
        if (loginLogError) {
          console.error('Failed to log admin login:', loginLogError);
          // Continue with login even if logging fails
        }

        const userData = {
          id: adminData.id.toString(),
          name: adminData.full_name,
          email_id: adminData.email_id,
          role: 'admin' as const,
          employee_id: adminData.employee_id,
        };
        
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const superAdminLogin = async (email_id: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check super_admins table
      const { data: superAdminData, error: superAdminError } = await supabase
        .from('super_admins')
        .select('*')
        .eq('email_id', email_id)
        .single();

      if (superAdminError || !superAdminData) {
        setIsLoading(false);
        return false;
      }

      // Verify OTP using the verifyOtp function
      const isOtpValid = await verifyOtp(email_id, otp);
      if (!isOtpValid) {
        setIsLoading(false);
        return false;
      }

      const userData = {
        id: superAdminData.id.toString(),
        name: superAdminData.full_name,
        email_id: superAdminData.email_id,
        role: 'superadmin' as const,
      };
      
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Super admin login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('signup_users')
        .select('email_id')
        .eq('email_id', userData.email_id)
        .single();

      if (existingUser) {
        setIsLoading(false);
        return false;
      }

      // Insert into signup_users directly (no login_users table)
      const { data: signupUser, error: signupError } = await supabase
        .from('signup_users')
        .insert({
          user_id: Math.floor(Math.random() * 1000000), // Generate random user_id
          full_name: userData.name,
          email_id: userData.email_id,
          email: userData.email
        })
        .select()
        .single();

      if (signupError || !signupUser) {
        setIsLoading(false);
        return false;
      }

      const authData = {
        id: signupUser.id.toString(),
        name: signupUser.full_name,
        email_id: signupUser.email_id,
        role: 'customer' as const,
      };
      
      setUser(authData);
      localStorage.setItem('auth_user', JSON.stringify(authData));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const generateOtp = async (email_id: string, role: 'customer' | 'admin' | 'superadmin'): Promise<boolean> => {
    try {
      // First, check if the emailid exists in the appropriate table
      let userExists = false;
      
      if (role === 'customer') {
        const { data: customerData, error } = await supabase
          .from('signup_users')
          .select('email_id')
          .eq('email_id', email_id)
          .single();
        userExists = !error && !!customerData;
      } else if (role === 'admin') {
        const { data: adminData, error } = await supabase
          .from('employee_data')
          .select('email_id')
          .eq('email_id', email_id)
          .single();
        userExists = !error && !!adminData;
      } else if (role === 'superadmin') {
        const { data: superAdminData, error } = await supabase
          .from('super_admins')
          .select('email_id')
          .eq('email_id', email_id)
          .single();
        userExists = !error && !!superAdminData;
      }
      
      if (!userExists) {
        console.error('email id not found in database');
        return false;
      }
      
      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the OTP in the otp_verifications table
      // Calculate expires_at as created_at + 10 minutes in Indian Standard Time
      const now = new Date();
      // Convert to IST (UTC + 5:30)
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const istNow = new Date(now.getTime() + istOffset);
      const expiryTime = new Date(istNow.getTime() + 10 * 60 * 1000); // 10 minutes from IST now
      
      const { error: dbError } = await supabase
        .from('otp_verifications')
        .insert({
          email_id,
          otp,
          expires_at: expiryTime.toISOString(),
          is_verified: false
        });
      
      if (dbError) {
        console.error('Database error storing OTP:', dbError);
        return false;
      }
      
      // Send SMS using the backend API
      try {
        const smsResponse = await fetch('http://localhost:3001/v1/sms/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
           emailid : email_id,
            message: `Your OTP for login is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`
          })
        });
        
        const smsResult = await smsResponse.json();
        
        if (!smsResult.success) {
          console.error('SMS sending failed:', smsResult.error);
          // Don't return false here - OTP is stored in DB even if SMS fails
          // This allows testing with database OTPs
        }
        
        console.log(`OTP generated and stored for ${email_id}. SMS result:`, smsResult.message || smsResult.error);
      } catch (smsError) {
        console.error('SMS API Error:', smsError);
        // Continue even if SMS fails - OTP is still stored in DB
      }
      return true;
    } catch (error) {
      console.error('Generate OTP error:', error);
      return false;
    }
  };

  const verifyOtp = async (email_id: string, otp: string): Promise<boolean> => {
    try {
      // Get current time in IST for consistent comparison
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const currentTime = new Date(now.getTime() + istOffset);
      
      // Check if OTP exists and is not expired
      const { data: otpRecord, error: fetchError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('email_id', email_id)
        .eq('otp', otp)
        .eq('is_verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (fetchError || !otpRecord) {
        console.error('OTP verification failed: Invalid OTP or OTP not found');
        return false;
      }
      
      // Check if OTP is expired using consistent UTC time comparison
      const expiryTime = new Date(otpRecord.expires_at);
      if (currentTime > expiryTime) {
        console.error('OTP verification failed: OTP has expired');
        console.log(`Current time: ${currentTime.toISOString()}, Expiry time: ${expiryTime.toISOString()}`);
        return false;
      }
      
      // Mark OTP as verified
      const { error: updateError } = await supabase
        .from('otp_verifications')
        .update({ is_verified: true })
        .eq('id', otpRecord.id);
      
      if (updateError) {
        console.error('Error updating OTP verification status:', updateError);
        return false;
      }
      
      console.log(`OTP verified successfully for ${email_id}`);
      return true;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const value = {
    user,
    login,
    logout,
    signup,
    superAdminLogin,
    generateOtp,
    verifyOtp,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};