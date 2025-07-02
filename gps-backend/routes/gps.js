import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Store current user location (will be updated by frontend)
let currentUserLocation = {
  latitude: 15.990900,  // Default coordinates within the simulation boundary
  longitude: 80.297800,
  timestamp: null,
  hasPermission: false
};

// Define the square boundary for GPS simulation when no GPS permission
const SIMULATION_BOUNDARY = {
  // Four corner points that form a square
  topLeft: { latitude: 15.991091, longitude: 80.297749 },
  topRight: { latitude: 15.990832, longitude: 80.297688 },
  bottomLeft: { latitude: 15.990785, longitude: 80.297903 },
  bottomRight: { latitude: 15.990979, longitude: 80.297980 }
};

// Function to generate random coordinates within the defined square boundary
function generateCoordinatesInBoundary() {
  // Calculate the min/max latitude and longitude from the boundary points
  const latitudes = [
    SIMULATION_BOUNDARY.topLeft.latitude,
    SIMULATION_BOUNDARY.topRight.latitude,
    SIMULATION_BOUNDARY.bottomLeft.latitude,
    SIMULATION_BOUNDARY.bottomRight.latitude
  ];
  const longitudes = [
    SIMULATION_BOUNDARY.topLeft.longitude,
    SIMULATION_BOUNDARY.topRight.longitude,
    SIMULATION_BOUNDARY.bottomLeft.longitude,
    SIMULATION_BOUNDARY.bottomRight.longitude
  ];
  
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  
  // Generate random coordinates within the boundary
  const latitude = minLat + Math.random() * (maxLat - minLat);
  const longitude = minLng + Math.random() * (maxLng - minLng);
  
  return { latitude, longitude };
}

// Endpoint to update user's current location
router.post('/update-location', async (req, res) => {
  try {
    const { device_code, latitude, longitude, accuracy, timestamp } = req.body;
    
    // If device_code is provided, store GPS data in database
    if (device_code) {
      console.log('📍 Received location update:', {
        device_code,
        latitude,
        longitude,
        accuracy,
        timestamp
      });
      
      // Get customer ID for the device
      const { data: deviceInfo, error: deviceError } = await supabase
        .from('devices')
        .select('allocated_to_customer_id')
        .eq('device_code', device_code)
        .single();
      
      if (deviceError) {
        console.error('❌ Error fetching device info:', deviceError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch device information',
          details: deviceError.message 
        });
      }
      
      // Insert GPS data into Supabase
      const { data, error } = await supabase
        .from('gps_data')
        .insert({
          device_code,
          latitude: latitude,
          longitude: longitude,
          user_id: deviceInfo.allocated_to_customer_id,
          accuracy,
          timestamp: new Date(timestamp).toISOString()
        })
        .select();
      
      if (error) {
        console.error('❌ Error inserting GPS data:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to store GPS data',
          details: error.message 
        });
      }
      
      console.log('✅ GPS data stored successfully:', data);
      return res.json({ 
        success: true, 
        message: 'Location updated successfully',
        data: data[0]
      });
    }
    
    // Fallback: update current user location for simulation
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }
    
    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: 'Invalid coordinates' 
      });
    }
    
    currentUserLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: new Date().toISOString(),
      hasPermission: true
    };
    
    console.log(`📍 User location updated: ${latitude}, ${longitude}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Location updated successfully',
      location: currentUserLocation
    });
    
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Endpoint to get current user location
router.get('/current-location', (req, res) => {
  res.status(200).json({
    status: 'success',
    location: currentUserLocation
  });
});

// Simulate GPS data for a specific device
router.post('/:device_code', async (req, res) => {
  try {
    const { device_code } = req.params;
    
    // Verify device exists and is active, and get customer ID
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, is_active, allocated_to_customer_id')
      .eq('device_code', device_code)
      .single();
    
    if (deviceError || !device) {
      return res.status(404).json({ 
        error: 'Device not found',
        device_code 
      });
    }
    
    if (!device.is_active) {
      return res.status(400).json({ 
        error: 'Device is not active',
        device_code 
      });
    }
    
    // Generate simulated GPS coordinates
    let latitude, longitude;
    
    if (currentUserLocation.hasPermission) {
      // If GPS permission is available, use current user location with small variations
      const latVariation = (Math.random() * 0.002 - 0.001); // ±0.001 degrees (~110m)
      const longVariation = (Math.random() * 0.002 - 0.001);
      
      latitude = currentUserLocation.latitude + latVariation;
      longitude = currentUserLocation.longitude + longVariation;
      
      console.log(`📍 Using real GPS location with variation for ${device_code}`);
    } else {
      // If no GPS permission, generate coordinates within the defined boundary
      const boundaryCoords = generateCoordinatesInBoundary();
      latitude = boundaryCoords.latitude;
      longitude = boundaryCoords.longitude;
      
      console.log(`⚠️ Using simulated coordinates within boundary for ${device_code} (no GPS permission)`);
    }
    
    // Insert GPS data into database
    const { data: gpsData, error: insertError } = await supabase
      .from('gps_data')
      .insert([
        {
          device_code,
          latitude: latitude,
          longitude: longitude,
          user_id: device.allocated_to_customer_id,
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (insertError) {
      console.error('GPS insert error:', insertError);
      return res.status(500).json({ 
        error: 'Failed to save GPS data',
        details: insertError.message 
      });
    }
    
    res.status(200).json({
      status: 'success',
      device_code,
      latitude,
      longitude,
      timestamp: gpsData.timestamp,
      message: 'GPS data saved successfully'
    });
    
  } catch (error) {
    console.error('GPS endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get GPS history for a device
router.get('/:device_code/history', async (req, res) => {
  try {
    const { device_code } = req.params;
    const { limit = 100 } = req.query;
    
    const { data: gpsHistory, error } = await supabase
      .from('gps_data')
      .select('*')
      .eq('device_code', device_code)
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) {
      return res.status(500).json({ 
        error: 'Failed to fetch GPS history',
        details: error.message 
      });
    }
    
    res.status(200).json({
      status: 'success',
      device_code,
      count: gpsHistory.length,
      data: gpsHistory.reverse() // Return in chronological order
    });
    
  } catch (error) {
    console.error('GPS history error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get GPS data for a specific device (for frontend map)
router.get('/device/:deviceCode/data', async (req, res) => {
  try {
    const { deviceCode } = req.params;
    
    console.log('📡 Fetching GPS data for device:', deviceCode);
    
    // Fetch GPS data from Supabase
    const { data, error } = await supabase
      .from('gps_data')
      .select('*')
      .eq('device_code', deviceCode)
      .order('timestamp', { ascending: true })
      .limit(100); // Limit to last 100 points
    
    if (error) {
      console.error('❌ Error fetching GPS data:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch GPS data',
        details: error.message 
      });
    }
    
    console.log(`✅ Found ${data?.length || 0} GPS points for device ${deviceCode}`);
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
    
  } catch (error) {
    console.error('Error in GPS data endpoint:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Clear all GPS data for a specific device
router.delete('/device/:deviceCode/clear', async (req, res) => {
  try {
    const { deviceCode } = req.params;
    
    console.log('🗑️ Clearing GPS data for device:', deviceCode);
    
    // Delete all GPS data for the device from Supabase
    const { data, error } = await supabase
      .from('gps_data')
      .delete()
      .eq('device_code', deviceCode)
      .select();
    
    if (error) {
      console.error('❌ Error clearing GPS data:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to clear GPS data',
        details: error.message 
      });
    }
    
    console.log(`✅ Cleared ${data?.length || 0} GPS points for device ${deviceCode}`);
    
    res.json({
      success: true,
      message: `All GPS data cleared for device ${deviceCode}`,
      deletedCount: data?.length || 0
    });
    
  } catch (error) {
    console.error('Error in GPS clear endpoint:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    });
  }
});

export default router;