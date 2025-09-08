import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('jwt_token');
};

// Create axios instance with auth header
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making API request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API error:', error.response?.status, error.response?.data, error.config?.url);
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface CalendarConnection {
  id: number;
  provider: string;
  providerUserId: string;
  calendarId: string;
  calendarName: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  lastSyncAt?: string;
}

export interface CalendarConnectionRequest {
  provider: string;
  code: string;
  redirectUri: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendeeEmail: string;
}

// Get all calendar connections for the authenticated user
export const getCalendarConnections = async (): Promise<CalendarConnection[]> => {
  const response = await apiClient.get('/calendar/connections');
  return response.data;
};

// Connect a new calendar service
export const connectCalendar = async (request: CalendarConnectionRequest): Promise<CalendarConnection> => {
  const response = await apiClient.post('/calendar/connect', request);
  return response.data;
};

// Disconnect a calendar service
export const disconnectCalendar = async (connectionId: number): Promise<void> => {
  await apiClient.delete(`/calendar/connections/${connectionId}`);
};

// Set default calendar
export const setDefaultCalendar = async (connectionId: number): Promise<void> => {
  await apiClient.put(`/calendar/connections/${connectionId}/default`);
};

// Get Google OAuth URL
export const getGoogleOAuthUrl = async (): Promise<{ oauthUrl: string }> => {
  const response = await apiClient.get('/calendar/oauth/google/url');
  return response.data;
};

// Create an event in the user's default calendar
export const createEvent = async (eventRequest: CreateEventRequest): Promise<void> => {
  await apiClient.post('/calendar/events', eventRequest);
};
