import axios from 'axios';

const API_BASE_URL = 'http://localhost:3101/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Federation API
export const federationAPI = {
  create: (data: { pid: string; natsHosts: string; syncSchedule: string }) =>
    api.post('/fed/create', data),
  
  generateInvite: (pid: string, data: { password: string }) =>
    api.post(`/fed/${pid}/invite`, data),
  
  join: (data: { pid: string; inviteJson: string }) =>
    api.post('/fed/join', data),
  
  startPulsing: (pid: string) =>
    api.get(`/fed/${pid}/startPulsing`),
  
  stopPulsing: (pid: string) =>
    api.get(`/fed/${pid}/stopPulsing`),
  
  getSyncStats: (pid: string) =>
    api.get(`/fed/${pid}/syncStats`),
};

// Projects API
export const projectsAPI = {
  create: (data: {
    pid: string;
    type: 'cpu' | 'gpu';
    persist: boolean;
    enableHistogram: boolean;
    extra: Record<string, string>;
  }) => api.post('/projects', data),
  
  pushData: (pid: string, csvData: string) =>
    api.post(`/projects/${pid}/learn`, csvData, {
      headers: { 'Content-Type': 'text/csv' },
    }),
  
  explore: (pid: string, metric: 'uni' | 'bi' | 'predictive', data?: any) =>
    api.post(`/projects/${pid}/explore?metric=${metric}`, data),
  
  build: (pid: string, data: any) =>
    api.post(`/projects/${pid}/build`, data),
  
  predict: (pid: string, data: any) =>
    api.post(`/projects/${pid}/predict`, data),
};

// Utility types
export interface FederationConfig {
  pid: string;
  natsHosts: string;
  syncSchedule: string;
}

export interface ProjectConfig {
  pid: string;
  type: 'cpu' | 'gpu';
  persist: boolean;
  enableHistogram: boolean;
  targetList: string[];
  condList: string[];
}

export interface SyncStats {
  timestamp: string;
  status: string;
  mergedCount: number;
  errors?: string[];
}

export interface ExploreData {
  metric: 'uni' | 'bi' | 'predictive';
  cohort?: string;
  attributes: string[];
  conditionalAttributes?: string[];
}