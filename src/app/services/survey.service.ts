import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export interface SurveyPayload {
  title: string;
  status: 'draft' | 'published';
  questions: string[];
  categoryIds: number[];
}

export interface Survey {
  id: number;
  title: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  questions: { id: number; question: string }[];
  categories: { id: number; name: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private apiUrl = 'http://localhost:8080/v1';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  createSurvey(payload: SurveyPayload): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authorization token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post<SurveyPayload>(`${this.apiUrl}/survey`, payload, { headers })
      .pipe(
        catchError((error) => {
          console.error('Survey creation failed:', error);
          let errorMessage = 'Failed to create survey. Please try again later.';

          if (error.status === 400) {
            errorMessage = 'Invalid data. Please check your input.';
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getSurveys(): Observable<Survey[]> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('No authorization token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .get<{ success: boolean; data: Survey[] }>(
        `${this.apiUrl}/admin/surveys`,
        { headers }
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error('Failed to fetch categories.');
          }
        }),
        catchError((error) => {
          console.error('Failed to fetch surveys:', error);
          let errorMessage = 'Failed to create survey. Please try again later.';

          if (error.status === 400) {
            errorMessage = 'Invalid data. Please check your input.';
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }
}
