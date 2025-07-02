import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Clock, AlertCircle, RotateCcw } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for start and end points
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface GPSData {
  id: number;
  device_code: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  user_id?: number;
}

interface DeviceRouteMapProps {
  deviceCode: string;
  deviceName?: string;
  height?: string;
  showControls?: boolean;
  onReset?: () => void;
  isTrackingActive?: boolean;
}

const DeviceRouteMap: React.FC<DeviceRouteMapProps> = ({ 
  deviceCode, 
  deviceName, 
  height = '400px',
  showControls = true,
  onReset,
  isTrackingActive = true
}) => {
  const [gpsData, setGpsData] = useState<GPSData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const resetMapData = async () => {
    try {
      // Clear all GPS data from database
      console.log('🗑️ Clearing GPS data for device:', deviceCode);
      const response = await fetch(`http://localhost:3001/v1/gps-signal/device/${deviceCode}/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ GPS data cleared successfully:', result);
        toast({
          title: "Data Cleared",
          description: `Cleared ${result.deletedCount || 0} GPS points from database.`,
        });
      } else {
        console.error('❌ Failed to clear GPS data:', response.statusText);
        toast({
          title: "Warning",
          description: "Could not clear GPS data from database. Map will still reset.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error clearing GPS data:', error);
      toast({
        title: "Warning",
        description: "Could not clear GPS data from database. Map will still reset.",
        variant: "destructive",
      });
    }
    
    // Clear local state
    setGpsData([]);
    setLastUpdated(null);
    
    // Call parent reset function if provided
    if (onReset) {
      onReset();
    }
    
    toast({
      title: "Map Reset",
      description: "GPS tracking data has been completely cleared. New tracking will start from point 1.",
    });
  };

  const fetchGPSData = async () => {
    setIsLoading(true);
    try {
      console.log('📡 Fetching GPS data for device:', deviceCode);
      
      // Try fetching from backend API first (bypasses RLS issues)
      try {
        const response = await fetch(`http://localhost:3001/v1/gps-signal/device/${deviceCode}/data`);
        if (response.ok) {
          const backendData = await response.json();
          console.log('✅ Fetched GPS data from backend:', backendData);
          if (backendData.data && Array.isArray(backendData.data)) {
            const formattedData = backendData.data.map((item: any) => ({
              id: item.id,
              device_code: item.device_code,
              latitude: item.latitude,
              longitude: item.longitude,
              timestamp: item.timestamp,
              user_id: item.user_id
            }));
            setGpsData(formattedData);
            setLastUpdated(new Date());
            return;
          }
        }
      } catch (backendError) {
        console.log('⚠️ Backend fetch failed, trying direct Supabase:', backendError);
      }
      
      // Fallback to direct Supabase query
      const { data, error } = await supabase
        .from('gps_data')
        .select('*')
        .eq('device_code', deviceCode)
        .order('timestamp', { ascending: true })
        .limit(100); // Limit to last 100 points

      if (error) {
        console.error('❌ Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Show user-friendly error message
        toast({
          title: "GPS Data Unavailable",
          description: "Unable to fetch GPS tracking data. Please ensure the device is active and try refreshing.",
          variant: "destructive",
        });
      } else {
        console.log('✅ Fetched GPS data from Supabase:', data);
        console.log('Number of GPS points:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('Sample GPS point:', data[0]);
        }
        setGpsData((data || []) as GPSData[]);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching GPS data:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching GPS data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if tracking is active
    if (isTrackingActive) {
      fetchGPSData();
      
      // Set up real-time subscription for GPS updates
      const subscription = supabase
        .channel(`gps_data_${deviceCode}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'gps_data',
            filter: `device_code=eq.${deviceCode}`
          },
          (payload) => {
            console.log('New GPS data received:', payload);
            setGpsData(prev => [...prev, payload.new as GPSData].slice(-100)); // Keep only last 100 points
            setLastUpdated(new Date());
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Clear data when tracking is not active
      setGpsData([]);
      setLastUpdated(null);
    }
  }, [deviceCode, isTrackingActive]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };



  if (gpsData.length === 0) {
    return (
      <div className="space-y-4">
        {showControls && (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">
                {deviceName || deviceCode} - GPS Tracking
              </span>
              <span className="text-xs text-gray-500">(0 points)</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={resetMapData}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button 
                onClick={fetchGPSData}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200" style={{ height }}>
          <MapPin className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No GPS Data Available</h3>
          <p className="text-gray-500 text-center mb-4">
            No tracking data found for this device. GPS data will appear here once the device starts transmitting location information.
          </p>
          {!showControls && (
            <Button 
              onClick={fetchGPSData}
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
          )}
        </div>
      </div>
    );
  }

  // Prepare path coordinates for polyline
  console.log('Processing GPS data for coordinates:', gpsData);
  const pathCoordinates: [number, number][] = gpsData
    .filter(point => {
      const isValid = point.latitude != null && point.longitude != null && 
                     typeof point.latitude === 'number' && typeof point.longitude === 'number' &&
                     !isNaN(point.latitude) && !isNaN(point.longitude);
      if (!isValid) {
        console.log('Invalid GPS point filtered out:', point);
      }
      return isValid;
    })
    .map(point => [point.latitude, point.longitude]);
  console.log('Valid path coordinates:', pathCoordinates);
  const centerCoordinate = pathCoordinates[Math.floor(pathCoordinates.length / 2)] || pathCoordinates[0] || [0, 0];

  // If no valid coordinates, show no data message
  if (pathCoordinates.length === 0) {
    return (
      <div className="space-y-4">
        {showControls && (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">
                {deviceName || deviceCode} - GPS Tracking
              </span>
              <span className="text-xs text-gray-500">(Invalid coordinates)</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={resetMapData}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button 
                onClick={fetchGPSData}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200" style={{ height }}>
          <AlertCircle className="w-12 h-12 text-orange-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Invalid GPS Data</h3>
          <p className="text-gray-500 text-center mb-4">
            GPS data found but coordinates are invalid or missing. Please check the device configuration.
          </p>
          {!showControls && (
            <Button 
              onClick={fetchGPSData}
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
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showControls && (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm">
              {deviceName || deviceCode} - GPS Tracking
            </span>
            <span className="text-xs text-gray-500">({gpsData.length} points)</span>
          </div>
          <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Updated: {formatTimestamp(lastUpdated.toISOString())}</span>
                </div>
              )}
              <Button 
                onClick={resetMapData}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button 
                onClick={fetchGPSData}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
        </div>
      )}
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <MapContainer 
          center={centerCoordinate} 
          zoom={14} 
          style={{ height, width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Route polyline */}
          <Polyline 
            positions={pathCoordinates} 
            color="#3b82f6" 
            weight={3}
            opacity={0.8}
          />
          
          {/* Start point marker */}
          {gpsData.length > 0 && startIcon && gpsData[0].latitude != null && gpsData[0].longitude != null && (
            <Marker 
              position={[gpsData[0].latitude, gpsData[0].longitude]} 
              icon={startIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong>Start Point</strong><br />
                  <strong>Time:</strong> {formatTimestamp(gpsData[0].timestamp)}<br />
                  <strong>Coordinates:</strong> {gpsData[0].latitude?.toFixed(6) || 'N/A'}, {gpsData[0].longitude?.toFixed(6) || 'N/A'}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* End point marker (if different from start) */}
          {gpsData.length > 1 && endIcon && gpsData[gpsData.length - 1].latitude != null && gpsData[gpsData.length - 1].longitude != null && (
            <Marker 
              position={[gpsData[gpsData.length - 1].latitude, gpsData[gpsData.length - 1].longitude]} 
              icon={endIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong>Latest Position</strong><br />
                  <strong>Time:</strong> {formatTimestamp(gpsData[gpsData.length - 1].timestamp)}<br />
                  <strong>Coordinates:</strong> {gpsData[gpsData.length - 1].latitude?.toFixed(6) || 'N/A'}, {gpsData[gpsData.length - 1].longitude?.toFixed(6) || 'N/A'}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Intermediate points */}
          {gpsData.slice(1, -1).filter(point => point.latitude != null && point.longitude != null).map((point, index) => (
            <Marker 
              key={point.id} 
              position={[point.latitude, point.longitude]}
            >
              <Popup>
                <div className="text-sm">
                  <strong>Point #{index + 2}</strong><br />
                  <strong>Time:</strong> {formatTimestamp(point.timestamp)}<br />
                  <strong>Coordinates:</strong> {point.latitude?.toFixed(6) || 'N/A'}, {point.longitude?.toFixed(6) || 'N/A'}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {showControls && gpsData.length > 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>Route Summary:</strong> {gpsData.length} GPS points from {formatTimestamp(gpsData[0].timestamp)} to {formatTimestamp(gpsData[gpsData.length - 1].timestamp)}
        </div>
      )}
    </div>
  );
};

export default DeviceRouteMap;