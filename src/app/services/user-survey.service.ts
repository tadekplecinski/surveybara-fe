import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { AuthService } from './auth.service';

export interface UserSurveyResponse {
  success: boolean;
  data: {
    id: number;
    status: 'draft' | 'submitted';
    createdAt: string;
    updatedAt: string;
    Survey: {
      title: string;
      questions: { id: number; question: string }[];
    };
    Answers: {
      id: number;
      answer: string;
      questionId: number;
    }[];
  }[];
}

export interface UserSurveysParsed {
  id: number;
  status: 'draft' | 'submitted';
  createdAt: string;
  updatedAt: string;
  title: string;
  questions: { id: number; question: string }[];
  answers: {
    id: number;
    answer: string;
    questionId: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class UserSurveyService {
  private apiUrl = 'http://localhost:8080/v1';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUserSurveys(): Observable<UserSurveysParsed[]> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('No authorization token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .get<UserSurveyResponse>(`${this.apiUrl}/surveys`, { headers })
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data.map((survey) => ({
              ...survey,
              title: survey.Survey.title,
              questions: survey.Survey.questions,
              answers: survey.Answers,
            }));
          } else {
            throw new Error('Failed to fetch user surveys.');
          }
        }),
        catchError((error) => {
          console.error('Failed to fetch surveys:', error);
          let errorMessage = 'Failed to fetch surveys. Please try again later.';

          if (error.status === 400) {
            errorMessage = 'Invalid request. Please check your input.';
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }
}
