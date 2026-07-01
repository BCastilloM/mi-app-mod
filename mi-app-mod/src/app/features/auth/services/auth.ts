import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = '/api';

  // Estado de autenticación — verifica si ya hay token al iniciar
  isAuthenticated = signal<boolean>(this.tokenExists());

  constructor(private http: HttpClient, private router: Router) {}

  private tokenExists(): boolean {
    return !!localStorage.getItem('token');
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/google-login`, { idToken });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitar-recuperacion`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/restablecer-password`, { token, password });
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
    this.isAuthenticated.set(true);
    this.router.navigate(['/home']);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
