import axios, { AxiosError } from 'axios';

export interface Candidate {
  email: string;
  name: string;
}

export interface CreateInterviewRequest {
  interviewName: string;
  fromDate: string;
  toDate: string;
  timeSlots: Record<string, Record<string, string | null>>;
  candidates: Candidate[];
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const processExcelFile = async (file: File): Promise<Candidate[]> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/interviews/process-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Check if response has candidates array
    if (response.data.candidates && Array.isArray(response.data.candidates)) {
      return response.data.candidates;
    }

    throw new Error('Invalid response format from server');
  } catch (error:any) {
    if (axios.isAxiosError(error)) {
      console.error('Excel Processing Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    throw new Error(error.response?.data?.error || 'Failed to process Excel file');
  }
};

export const createInterview = async (request: CreateInterviewRequest) => {
  try {
    // Log request data for debugging
    console.log('Creating interview with data:', {
      ...request,
      candidatesCount: request.candidates.length,
      timeSlotsCount: Object.keys(request.timeSlots).length
    });

    const response = await api.post<{ id: string }>('/api/interviews', request);
    
    // Log successful creation
    console.log('Interview created:', response.data);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Interview Creation Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        requestData: {
          ...request,
          candidatesCount: request.candidates.length,
          timeSlotsCount: Object.keys(request.timeSlots).length
        }
      });
    }
    throw error;
  }
};