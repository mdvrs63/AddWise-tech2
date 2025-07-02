
import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Home, User, Shield, LogOut, Mail, Phone, Plus, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CustomerSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function CustomerSidebar({ activeSection, onSectionChange }: CustomerSidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', title: 'Dashboard', icon: Home },
    { id: 'add-device', title: 'Add Device', icon: Plus },
    { id: 'my-devices', title: 'My Devices', icon: Smartphone },
    { id: 'account', title: 'Account Information', icon: User },
    { id: 'about', title: 'About Us', icon: Shield },
    { id: 'contact', title: 'Contact', icon: Mail },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">AddWise Tech</h2>
            <p className="text-sm text-gray-600">Innovation</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
