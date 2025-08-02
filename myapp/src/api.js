// src/api.js
import axios from 'axios';

const instance = axios.create({
   import.meta.env.VITE_APP_API_URL,
  timeout: 30000
});

export default instance;