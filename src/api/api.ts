import axios from 'axios';
import type {
  User,
  UserStats,
  Murmur,
  PaginatedResponse,
  CreateUserRequest,
  CreateMurmurRequest,
  LikeResponse,
} from '../types/types';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  },
);

// Auth API
export const signup = async (
  name: string,
  email: string,
  password: string,
): Promise<{ user: User; token: string }> => {
  const response = await axiosInstance.post<{ user: User; token: string }>(
    '/auth/signup',
    { name, email, password },
  );
  return response.data;
};

export const signin = async (
  email: string,
  password: string,
): Promise<{ user: User; token: string }> => {
  const response = await axiosInstance.post<{ user: User; token: string }>(
    '/auth/signin',
    { email, password },
  );
  return response.data;
};

// Users API
export const getUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get<User[]>('/users');
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get<User>('/users/me');
  return response.data;
};

export const getUserById = async (id: number): Promise<UserStats> => {
  const response = await axiosInstance.get<UserStats>(`/users/${id}`);
  return response.data;
};

export const createUser = async (
  name: string,
  email: string,
): Promise<User> => {
  const response = await axiosInstance.post<User>(
    '/users',
    { name, email },
  );
  return response.data;
};

// Murmurs API
export const getMurmurs = async (
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<Murmur>> => {
  const response = await axiosInstance.get<PaginatedResponse<Murmur>>('/murmurs', {
    params: { page, limit },
  });
  return response.data;
};

export const getMurmurById = async (id: number): Promise<Murmur> => {
  const response = await axiosInstance.get<Murmur>(`/murmurs/${id}`);
  return response.data;
};

export const createMurmur = async (
  text: string,
): Promise<Murmur> => {
  const response = await axiosInstance.post<Murmur>(
    '/me/murmurs',
    { text },
  );
  return response.data;
};

export const deleteMurmur = async (
  id: number,
): Promise<void> => {
  await axiosInstance.delete(`/me/murmurs/${id}`);
};

// Timeline API
export const getTimeline = async (
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<Murmur>> => {
  const response = await axiosInstance.get<PaginatedResponse<Murmur>>('/timeline', {
    params: { page, limit },
  });
  return response.data;
};

// Likes API
export const likeMurmur = async (
  murmurId: number,
): Promise<LikeResponse> => {
  const response = await axiosInstance.post<LikeResponse>(
    `/murmurs/${murmurId}/like`,
  );
  return response.data;
};

export const unlikeMurmur = async (
  murmurId: number,
): Promise<LikeResponse> => {
  const response = await axiosInstance.delete<LikeResponse>(
    `/murmurs/${murmurId}/like`,
  );
  return response.data;
};

// Follows API
export const followUser = async (
  userId: number,
): Promise<void> => {
  await axiosInstance.post(`/users/${userId}/follow`);
};

export const unfollowUser = async (
  userId: number,
): Promise<void> => {
  await axiosInstance.delete(`/users/${userId}/follow`);
};

export const getFollowStatus = async (
  userId: number,
): Promise<{ isFollowing: boolean }> => {
  const response = await axiosInstance.get<{ isFollowing: boolean }>(
    `/users/${userId}/follow-status`,
  );
  return response.data;
};

