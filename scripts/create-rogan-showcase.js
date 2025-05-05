/**
 * Script to create Joe Rogan's 1969 Camaro luxury showcase
 * 
 * This script uses the admin API to create a new luxury showcase
 * featuring Joe Rogan's famous 1969 Camaro restomod.
 */

import fetch from 'node-fetch';
import { roganCamaroData } from '../client/src/data/showcases/joe-rogan-camaro.js';

// Admin login credentials
const adminCredentials = {
  email: 'jims67mustang@gmail.com',
  password: 'Jimmy123$'
};

// Base URL for the API
const API_BASE_URL = 'http://localhost:5000/api';

async function createRoganCamaroShowcase() {
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
    console.log('Creating Joe Rogan\'s 1969 Camaro showcase...');

    // Step 2: Create the luxury showcase
    const showcaseResponse = await fetch(`${API_BASE_URL}/admin/luxury-showcases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(roganCamaroData)
    });

    if (!showcaseResponse.ok) {
      const error = await showcaseResponse.text();
      throw new Error(`Failed to create showcase: ${error}`);
    }

    const showcase = await showcaseResponse.json();
    console.log('Successfully created the showcase!');
    console.log(`ID: ${showcase.id}`);
    console.log(`Title: ${showcase.title}`);
    console.log(`Slug: ${showcase.slug}`);
    console.log(`View at: http://localhost:5000/showcases/${showcase.slug}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createRoganCamaroShowcase();
