import axios from 'axios';
import type { MedicalAnalysis, MedicalRecordDto, MedicalRecordSummaryDto, AiHealthReportDto } from './types/medical';

const API_BASE_URL = 'http://localhost:5117/api'; // Or your backend port

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Only reload if we are not already on the login page to avoid loops
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginData {
  email?: string;
  password?: string;
}

export interface RegisterData {
  name?: string;
  email?: string;
  password?: string;
  age?: number;
  gender?: string;
}

export const authService = {
  login: (data: LoginData) => api.post('/Auth/login', data),
  register: (data: RegisterData) => api.post('/Auth/register', data),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
};

export const medicalRecordsService = {
  save: (file: File | null, collectionDate: string, laboratory: string, results: MedicalAnalysis[]) => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (collectionDate) formData.append('collectionDate', collectionDate);
    if (laboratory) formData.append('laboratory', laboratory);
    formData.append('resultsJson', JSON.stringify(results.map(r => ({
      name: r.name,
      value: r.value,
      textValue: r.textValue ?? null,
      status: r.status ?? null,
      unit: r.unit,
      minRef: r.referenceRange?.min ?? null,
      maxRef: r.referenceRange?.max ?? null,
      referenceNote: r.referenceNote ?? null,
    }))));
    return api.post<MedicalRecordDto>('/MedicalRecords', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: () => api.get<MedicalRecordSummaryDto[]>('/MedicalRecords'),
  getById: (id: number) => api.get<MedicalRecordDto>(`/MedicalRecords/${id}`),
  downloadPdf: (id: number) => api.get(`/MedicalRecords/${id}/pdf`, { responseType: 'blob' }),
  delete: (id: number) => api.delete(`/MedicalRecords/${id}`),
};

export const healthReportService = {
  getLatest: () => api.get<AiHealthReportDto>('/HealthReport'),
  generate: () => api.post<AiHealthReportDto>('/HealthReport/generate'),
};
