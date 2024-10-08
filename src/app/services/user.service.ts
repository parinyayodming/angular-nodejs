import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Create a user
  createUser(user: any): Observable<any> {
    return this.http.post(`${this.API_URL}/create`, user);
  }

  // Get all users
  getUsers(): Observable<any> {
    return this.http.get(`${this.API_URL}/users`);
  }

  // Get user
  getUser(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/user/${id}`);
  }

  // Update a user
  updateUser(id: number, user: any): Observable<any> {
    return this.http.put(`${this.API_URL}/update/${id}`, user);
  }

  // Delete a user
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/delete/${id}`);
  }
}
