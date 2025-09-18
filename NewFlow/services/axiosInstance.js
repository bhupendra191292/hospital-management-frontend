// NewFlow-specific axios instance
import axios from 'axios';

const newFlowApi = axios.create({
  baseURL: '/api',
});

// Request interceptor to add NewFlow authentication token
newFlowApi.interceptors.request.use((config) => {
  // Get NewFlow token from localStorage
  const newFlowToken = localStorage.getItem('newflow_token');
  
  console.log('🔍 NewFlow API Request:', {
    url: config.url,
    method: config.method,
    hasToken: !!newFlowToken,
    tokenPreview: newFlowToken ? newFlowToken.substring(0, 20) + '...' : 'none'
  });
  
  if (newFlowToken) {
    config.headers.Authorization = `Bearer ${newFlowToken}`;
  } else {
    // Fallback to main app token if NewFlow token is not available
    const mainToken = localStorage.getItem('token');
    if (mainToken) {
      config.headers.Authorization = `Bearer ${mainToken}`;
      console.log('⚠️ Using main app token as fallback');
    }
  }
  
  return config;
});

// Response interceptor for error handling
newFlowApi.interceptors.response.use(
  (response) => {
    console.log('✅ NewFlow API Response:', {
      url: response.config.url,
      status: response.status,
      dataKeys: Object.keys(response.data || {}),
      success: response.data?.success
    });
    return response;
  },
  (error) => {
    console.error('❌ NewFlow API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return Promise.reject(error);
  }
);

export default newFlowApi;
