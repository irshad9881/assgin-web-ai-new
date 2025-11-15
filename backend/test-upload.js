require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Get configuration from environment variables
const API_BASE_URL = `http://localhost:${process.env.PORT || 5000}`;
const TEST_TEAM = process.env.TEST_TEAM || 'marketing';
const TEST_PROJECT = process.env.TEST_PROJECT || 'test-project';
const TEST_CATEGORY = process.env.TEST_CATEGORY || 'campaign';

// Create a test file
const testContent = 'This is a test marketing document about our Q4 campaign strategy.';
const testFilePath = path.join(__dirname, 'test-document.txt');
fs.writeFileSync(testFilePath, testContent);

async function testUpload() {
  try {
    const form = new FormData();
    form.append('document', fs.createReadStream(testFilePath));
    form.append('team', TEST_TEAM);
    form.append('project', TEST_PROJECT);
    form.append('category', TEST_CATEGORY);

    const response = await axios.post(`${API_BASE_URL}/api/documents/upload`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('Upload successful:', response.data);
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

async function testHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('Health check:', response.data);
    return true;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Testing backend...');
  console.log('API URL:', API_BASE_URL);
  
  const isHealthy = await testHealth();
  if (isHealthy) {
    await testUpload();
  } else {
    console.log('Backend is not running. Please start it with: npm run dev');
  }
}

runTests();