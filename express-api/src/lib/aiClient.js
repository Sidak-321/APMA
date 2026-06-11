import axios from 'axios';
import { config } from '../config/index.js';

const aiClient = axios.create({
  baseURL: config.aiServiceUrl,
  timeout: 120000,
});

export default aiClient;