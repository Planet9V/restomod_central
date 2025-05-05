/**
 * Script to update Joe Rogan's 1969 Camaro luxury showcase with Rolls-Royce style
 * 
 * This script uses the admin API to update the existing showcase
 * with premium Rolls-Royce style images and layout.
 */

import fetch from 'node-fetch';
import { roganCamaroData } from '../client/src/data/showcases/rolls-royce-style-camaro.js';

// Admin login credentials
const adminCredentials = {
  email: 'jims67mustang@gmail.com',
  password: 'Jimmy123$'
};

// Base URL for the API
const API_BASE_URL = 'http://localhost:5000/api';

async function updateRoganCamaroShowcase() {
  try {
    console.log('Logging in as admin...');
    // Step 1: Login as admin
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminCredentials)
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Login failed: ${error}`);
    }

    const loginData = await loginResponse.json();
    const { token } = loginData;

    console.log('Successfully logged in as admin');
    console.log('Updating Joe Rogan\'s 1969 Camaro showcase with Rolls-Royce style images...');

    // Step 2: Update the luxury showcase with ID 1
    const showcaseId = 1; // Assuming the showcase ID is 1 based on previous creation
    const showcaseResponse = await fetch(`${API_BASE_URL}/admin/luxury-showcases/${showcaseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(roganCamaroData)
    });

    if (!showcaseResponse.ok) {
      const error = await showcaseResponse.text();
      throw new Error(`Failed to update showcase: ${error}`);
    }

    const showcase = await showcaseResponse.json();
    console.log('Successfully updated the showcase with Rolls-Royce style!');
    console.log(`ID: ${showcase.id}`);
    console.log(`Title: ${showcase.title}`);
    console.log(`Slug: ${showcase.slug}`);
    console.log(`View at: http://localhost:5000/showcases/${showcase.slug}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateRoganCamaroShowcase();
