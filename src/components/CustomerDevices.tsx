
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Smartphone, RefreshCw, Calendar, CheckCircle, MapPin, Eye, Satellite, Edit2, Check, X } from 'lucide-react';
import DeviceRouteMap from './DeviceRouteMap';
import GPSTracker from './GPSTracker';

interface Device {
  id: number;
  device_code: string;
  qr_code: string;
  created_at: string;
  is_active: boolean;
  allocated_to_customer_id: number | null;
  allocated_to_customer_name: string | null;
  allocated_at: string | null;
  device_name: string | null;
}

const CustomerDevices = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [activeTab, setActiveTab] = useState<'route' | 'tracker'>('route');
  const [editingDeviceId, setEditingDeviceId] = useState<number | null>(null);
  const [editingDeviceName, setEditingDeviceName] = useState<string>('');

  const fetchMyDevices = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('allocated_to_customer_id', Number(user.id))
        .order('allocated_at', { ascending: false });

      if (error) {
        console.error('Error fetching devices:', error);
        toast({
          title: "Error",
          description: "Failed to fetch your devices.",
          variant: "destructive",
        });
      } else {
        setDevices((data as Device[]) || []);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDevices();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeviceNameDoubleClick = (device: Device) => {
    setEditingDeviceId(device.id);
    setEditingDeviceName(device.device_name || '');
  };

  const handleDeviceNameSave = async (deviceId: number) => {
    try {
      const { error } = await supabase
        .from('devices')
        .update({ device_name: editingDeviceName.trim() || null })
        .eq('id', deviceId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update device name. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setDevices(devices.map(device => 
        device.id === deviceId 
          ? { ...device, device_name: editingDeviceName.trim() || null }
          : device
      ));

      toast({
        title: 'Success',
        description: 'Device name updated successfully.',
      });

      setEditingDeviceId(null);
      setEditingDeviceName('');
    } catch (error) {
      console.error('Error updating device name:', error);
      toast({
        title: 'Error',
        description: 'Failed to update device name. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeviceNameCancel = () => {
    setEditingDeviceId(null);
    setEditingDeviceName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, deviceId: number) => {
    if (e.key === 'Enter') {
      handleDeviceNameSave(deviceId);
    } else if (e.key === 'Escape') {
      handleDeviceNameCancel();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="w-8 h-8" />
          <h1 className="text-3xl font-bold">My Devices</h1>
        </div>
        <p className="text-lg opacity-90">
          View and manage all devices allocated to your account
        </p>
      </div>

      {/* Device Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {devices.filter(device => device.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Addition</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {devices.length > 0 
                ? formatDate(devices[0].allocated_at || devices[0].created_at).split(',')[0]
                : 'No devices'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Device List
              </CardTitle>
              <CardDescription>
                All devices allocated to your account
              </CardDescription>
            </div>
            <Button 
              onClick={fetchMyDevices}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Devices Found</h3>
              <p className="text-gray-500 mb-4">
                You haven't added any devices yet. Use the "Add Device" section to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Device Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead>GPS Tracking</TableHead>
                    <TableHead>QR Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">
                        {editingDeviceId === device.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingDeviceName}
                              onChange={(e) => setEditingDeviceName(e.target.value)}
                              onKeyDown={(e) => handleKeyPress(e, device.id)}
                              placeholder="Enter device name"
                              className="h-8 text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeviceNameSave(device.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleDeviceNameCancel}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded group"
                            onDoubleClick={() => handleDeviceNameDoubleClick(device)}
                            title="Double-click to edit device name"
                          >
                            <span>
                              {device.device_name || (
                                <span className="text-gray-400 italic">Unnamed Device</span>
                              )}
                            </span>
                            <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium">
                        {device.device_code}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          device.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {device.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatDate(device.allocated_at || device.created_at)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => {
                                setSelectedDevice(device);
                                setActiveTab('route');
                              }}
                            >
                              <MapPin className="w-4 h-4" />
                              GPS Tracking
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                GPS Tracking - {device.device_name || device.device_code}
                              </DialogTitle>
                              <DialogDescription>
                                Real-time GPS tracking, route history, and live location monitoring
                              </DialogDescription>
                            </DialogHeader>
                            
                            {/* Tab Navigation */}
                            <div className="flex border-b border-gray-200 mt-4">
                              <button
                                onClick={() => setActiveTab('tracker')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                  activeTab === 'tracker'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Satellite className="w-4 h-4" />
                                  Live GPS Tracker
                                </div>
                              </button>
                              <button
                                onClick={() => setActiveTab('route')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                  activeTab === 'route'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  Route History
                                </div>
                              </button>
                            </div>
                            
                            {/* Tab Content */}
                            <div className="mt-4">
                              {activeTab === 'tracker' ? (
                                <GPSTracker 
                                  deviceCode={device.device_code}
                                  deviceName={device.device_name || undefined}
                                />
                              ) : (
                                <DeviceRouteMap 
                                  deviceCode={device.device_code}
                                  deviceName={device.device_name || undefined}
                                  height="500px"
                                  showControls={true}
                                />
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-2">
                          {device.qr_code ? (
                            <img 
                              src={device.qr_code} 
                              alt={`QR Code for ${device.device_code}`}
                              className="w-16 h-16 border border-gray-300 rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 border border-gray-300 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No QR</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDevices;
