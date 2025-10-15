const axios = require('axios');

const BASE_URL = 'http://localhost:80';

async function testAuthService() {
  console.log('Testing Auth Service...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: `test${Date.now()}@example.com`,
      password: 'test123',
      name: 'Test User'
    });
    console.log('✓ Auth Service: Registration successful');
    return response.data.token;
  } catch (error) {
    console.error('✗ Auth Service failed:', error.message);
    return null;
  }
}

async function testFileService() {
  console.log('Testing File Service...');
  try {
    const response = await axios.get(`${BASE_URL}/api/files/health`);
    console.log('✓ File Service: Health check passed');
    return true;
  } catch (error) {
    console.error('✗ File Service failed:', error.message);
    return false;
  }
}

async function testReportService() {
  console.log('Testing Report Service...');
  try {
    const response = await axios.get(`${BASE_URL}/api/reports/health`);
    console.log('✓ Report Service: Health check passed');
    return true;
  } catch (error) {
    console.error('✗ Report Service failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(50));
  console.log('Integration Tests - Microservices');
  console.log('='.repeat(50));
  
  await testAuthService();
  await testFileService();
  await testReportService();
  
  console.log('='.repeat(50));
  console.log('Tests Complete');
  console.log('='.repeat(50));
}

runTests();
