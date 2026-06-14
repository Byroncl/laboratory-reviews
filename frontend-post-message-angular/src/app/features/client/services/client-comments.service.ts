import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comment {
  _id: string;
  postId: string;
  name: string;
  email: string;
  body: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ClientCommentsService {
  private readonly apiUrl = '/api/comments';

  constructor(private http: HttpClient) {}

  getMyComments(page = 1, limit = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-comments?page=${page}&limit=${limit}`);
  }

  deleteComment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  createComment(postId: string, data: any): Observable<any> {
    return this.http.post(this.apiUrl, { ...data, postId });
  }
}
