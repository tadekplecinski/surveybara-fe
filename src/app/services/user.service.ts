import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export interface User {
  id: number;
  email: string;
  userName: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8080/v1';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getNonAdminUsers(): Observable<User[]> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('No authorization token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .get<UsersResponse>(`${this.apiUrl}/users/non-admins`, { headers })
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error('Failed to fetch non-admin users.');
          }
        }),
        catchError((error) => {
          console.error('Failed to fetch non-admin users:', error);
          let errorMessage = 'Failed to fetch users. Please try again later.';

          if (error.status === 400) {
            errorMessage = 'Invalid request.';
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  inviteUser(surveyId: number, inviteeEmail: string): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authorization token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .post(
        `${this.apiUrl}/survey/${surveyId}/invite`,
        { inviteeEmail },
        { headers }
      )
      .pipe(
        catchError((error) => {
          console.error('User invitation failed:', error);
          let errorMessage = 'Failed to invite user. Please try again later.';

          if (error.status === 400) {
            errorMessage = 'Invalid email address.';
          } else if (error.status === 404) {
            errorMessage = 'Survey not found.';
          } else if (error.status === 409) {
            errorMessage = 'User is already invited.';
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }
}
