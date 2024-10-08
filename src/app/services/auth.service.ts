import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = 'http://localhost:3000/api';
  private TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient, private router: Router) {}

  // Register new user
  register(user: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, user);
  }

  // Login user
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials);
  }

  // Save token to local storage
  saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Get token from localStorage
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Remove token from localStorage (logout)
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']); // Redirect to login page
  }

  // Check if the user is logged in (token exists)
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
