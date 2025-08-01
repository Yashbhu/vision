// src/api.js
import axios from 'axios';

const instance = axios.create({
  // FIX: Use Vite's import.meta.env syntax to access environment variables
  baseURL: import.meta.env.VITE_APP_API_URL,
  timeout: 30000, // Increased timeout for potentially slow model inference
});

export default instance;