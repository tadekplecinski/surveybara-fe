import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface RegisterPayload {
  userName: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  role: 'user' | 'admin';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/v1';
  private readonly tokenKey = 'auth_token';
  private readonly roleKey = 'user_role';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken()
  );
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string | null>(
    this.getStoredRole()
  );
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    return !!this.getToken();
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(
        tap((response) => {
          if (!response.accessToken) {
            throw new Error('No access token received.');
          }
          this.handleAuthSuccess(response);
        })
      );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        if (!response.accessToken) {
          throw new Error('No access token received.');
        }
        this.handleAuthSuccess(response);
      })
    );
  }

  private handleAuthSuccess({ accessToken, role }: AuthResponse) {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.roleKey, role);
    this.isAuthenticatedSubject.next(true);
    this.userRoleSubject.next(role);
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getStoredRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
