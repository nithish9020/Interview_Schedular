import axios, { AxiosError } from 'axios';

export interface Application {
  id: string;
  interviewName: string;
  interviewDate: string;
  timeSlot: string;
  status: 'upcoming' | 'completed' | 'missed';
  interviewer: string;
  createdAt: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMyApplications = async () => {
  try {
    const response = await api.get('/api/applications/my-applications');
    
    // Log successful fetch
    console.log('Applications fetched:', {
      count: response.data.applications?.length,
      stats: response.data.stats
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    throw error;
  }
};

export const getApplicationById = async (id: string): Promise<Application> => {
  try {
    const response = await api.get(`/api/applications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch application details:', error);
    throw error;
  }
};

export const updateApplicationStatus = async (id: string, status: Application['status']) => {
  try {
    await api.patch(`/api/applications/${id}/status`, { status });
    console.log('Application status updated:', {
      id,
      newStatus: status
    });
  } catch (error) {
    console.error('Failed to update application status:', error);
    throw error;
  }
};