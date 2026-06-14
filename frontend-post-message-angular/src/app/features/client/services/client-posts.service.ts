import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  _id: string;
  title: string;
  body: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  imageFilename?: string;
  categoryId?: string;
  categoryName?: string;
  isActive: boolean;
}

export interface CreatePostDto {
  title: string;
  body: string;
  categoryId?: string;
}

export interface UpdatePostDto {
  title?: string;
  body?: string;
  categoryId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClientPostsService {
  private readonly apiUrl = '/api/posts';

  constructor(private http: HttpClient) {}

  getMyPosts(page = 1, limit = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-posts?page=${page}&limit=${limit}`);
  }

  createPost(data: CreatePostDto): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updatePost(id: string, data: UpdatePostDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getPostById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
