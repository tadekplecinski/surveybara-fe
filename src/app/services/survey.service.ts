import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export interface SurveyPayload {
  title: string;
  status: 'draft' | 'published';
  questions: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private apiUrl = 'http://localhost:8080/v1';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

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
}
