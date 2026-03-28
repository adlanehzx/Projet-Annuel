export interface Movie {
  id: number;
  title: string;
  year: number;
  director: string;
  rating: number;
  description: string;
  posterUrl?: string;
  genre?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Review {
  id: number;
  userId: number;
  movieId: number;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
}
