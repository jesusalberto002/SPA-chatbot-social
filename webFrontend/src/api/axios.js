import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7777/api',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // 1. Get the most current token from localStorage.
    const token = localStorage.getItem('token');
    
    // 2. If the token exists, add it to the headers for this request.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 3. Return the updated configuration.
    return config;
  },
  (error) => {
    // Handle any errors that occur during the request setup.
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // Check if the server sent a 403 (Subscription Required)
    if (error.response && error.response.status === 403) {
      const { redirectTo } = error.response.data;
      
      if (redirectTo) {
        // Redirect the user to the /subscriptions page
        window.location.href = redirectTo;
      }
    }

    // Handle 401 (Expired Session)
    if (error.response && error.response.status === 401) {
       localStorage.removeItem('token');
       window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;