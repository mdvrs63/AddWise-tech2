import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import gpsRoutes from './routes/gps.js';
import supabase from './supabaseClient.js';
import SmsService from './services/smsService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/v1/gps-signal', gpsRoutes);

// SMS API endpoint
app.post('/v1/sms/send', async (req, res) => {
  console.log('📱 SMS endpoint called!');
  console.log('📱 Request body:', req.body);
  console.log('📱 Request headers:', req.headers);
  
  try {
    const { phoneNumber, message } = req.body;
    
    console.log(`📱 Received SMS request for ${phoneNumber}`);
    console.log(`📱 Message: ${message}`);
    
    if (!phoneNumber || !message) {
      console.log('❌ Missing phoneNumber or message');
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }
    
    // Use the SMS service
    const result = await SmsService.sendSms(phoneNumber, message);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
    
  } catch (error) {
    console.error('📱 SMS Service Error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to send SMS: ${error.message}`
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('devices')
      .select('count')
      .limit(1);
    
    const supabaseStatus = error ? 'ERROR' : 'OK';
    
    res.status(200).json({ 
      status: 'OK', 
      message: 'GPS Backend Server is running',
      timestamp: new Date().toISOString(),
      supabase: {
        status: supabaseStatus,
        url: process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_ANON_KEY,
        error: error?.message || null
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Get all active devices for simulation
app.get('/v1/devices/active', async (req, res) => {
  try {
    const { data: devices, error } = await supabase
      .from('devices')
      .select('device_code, device_name, allocated_to_customer_name')
      .eq('is_active', true)
      .not('allocated_to_customer_id', 'is', null);
    
    if (error) {
      return res.status(500).json({ 
        error: 'Failed to fetch active devices',
        details: error.message 
      });
    }
    
    res.status(200).json({
      status: 'success',
      count: devices.length,
      devices
    });
    
  } catch (error) {
    console.error('Active devices error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// GPS Simulation Function
const simulateGPSForAllDevices = async () => {
  try {
    console.log('🛰️ Starting GPS simulation cycle...');
    
    // Test Supabase connection first
    console.log('🔗 Testing Supabase connection...');
    console.log('📍 Supabase URL:', process.env.SUPABASE_URL);
    console.log('🔑 Supabase Key exists:', !!process.env.SUPABASE_ANON_KEY);
    
    // Fetch all active allocated devices
    const { data: devices, error } = await supabase
      .from('devices')
      .select('device_code')
      .eq('is_active', true)
      .not('allocated_to_customer_id', 'is', null);
    
    if (error) {
      console.error('❌ Supabase error fetching devices:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return;
    }
    
    if (!devices || devices.length === 0) {
      console.log('No active allocated devices found for simulation');
      return;
    }
    
    console.log(`📡 Simulating GPS for ${devices.length} devices...`);
    
    // Send GPS signal for each device
    const promises = devices.map(device => 
      fetch(`http://localhost:${PORT}/v1/gps-signal/${device.device_code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          console.log(`✅ GPS updated for ${device.device_code}: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`);
        } else {
          console.error(`❌ GPS failed for ${device.device_code}:`, data.error);
        }
      })
      .catch(err => {
        console.error(`❌ Network error for ${device.device_code}:`, err.message);
      })
    );
    
    await Promise.all(promises);
    console.log('🔄 GPS simulation cycle completed\n');
    
  } catch (error) {
    console.error('GPS simulation error:', error);
  }
};

// Start GPS simulation interval (every 10 seconds)
let simulationInterval;

const startGPSSimulation = () => {
  console.log('🚀 Starting GPS simulation service...');
  simulationInterval = setInterval(simulateGPSForAllDevices, 10000); // 10 seconds
  
  // Run initial simulation after 2 seconds
  setTimeout(simulateGPSForAllDevices, 2000);
};

const stopGPSSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('🛑 GPS simulation stopped');
  }
};

// Simulation control endpoints
app.post('/v1/simulation/start', (req, res) => {
  if (simulationInterval) {
    return res.status(400).json({ error: 'Simulation already running' });
  }
  
  startGPSSimulation();
  res.status(200).json({ 
    status: 'success', 
    message: 'GPS simulation started' 
  });
});

app.post('/v1/simulation/stop', (req, res) => {
  stopGPSSimulation();
  res.status(200).json({ 
    status: 'success', 
    message: 'GPS simulation stopped' 
  });
});

app.get('/v1/simulation/status', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    simulation_running: !!simulationInterval,
    interval_seconds: 10
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GPS Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🛰️ GPS API: http://localhost:${PORT}/v1/gps-signal/:device_code`);
  
  // Auto-start GPS simulation
  startGPSSimulation();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down GPS Backend Server...');
  stopGPSSimulation();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down GPS Backend Server...');
  stopGPSSimulation();
  process.exit(0);
});