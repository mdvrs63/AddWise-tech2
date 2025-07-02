// Test script to verify location update functionality
const testLocationUpdate = async () => {
  try {
    console.log('🧪 Testing location update endpoint...');
    
    // Test coordinates (example location)
    const testLocation = {
      latitude: 17.3850,
      longitude: 78.4867
    };
    
    // Send location update to backend
    const response = await fetch('http://localhost:3001/v1/gps-signal/update-location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLocation)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Location update successful:', result);
    
    // Get current location from backend
    const locationResponse = await fetch('http://localhost:3001/v1/gps-signal/current-location');
    const locationData = await locationResponse.json();
    console.log('📍 Current backend location:', locationData);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testLocationUpdate();