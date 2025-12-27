export interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

export interface Author {
  id: number;
  name: string;
  email: string;
}

export interface Murmur {
  id: number;
  text: string;
  userId: number;
  author: Author | null;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  id: number;
  name: string;
  email: string;
  followersCount: number;
  followingCount: number;
  murmursCount: number;
  isFollowing?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface CreateMurmurRequest {
  text: string;
  userId: number;
}

export interface LikeResponse {
  likeCount: number;
}

