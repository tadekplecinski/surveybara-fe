import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  status: 'active' | 'archived';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type CategoryPayload = Pick<Category, 'name' | 'status' | 'description'>;

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:8080/v1';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  fetchCategories(): Observable<Category[]> {
    const token = this.getToken();

    if (!token) {
      return throwError(() => new Error('No authorization token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .get<CategoriesResponse>(`${this.apiUrl}/categories`, { headers })
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error('Failed to fetch categories.');
          }
        }),
        catchError((error) => {
          console.error('Failed to fetch categories:', error);
          let errorMessage =
            'Failed to fetch categories. Please try again later.';

          if (error.status === 400) {
            errorMessage = 'Invalid request.';
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  createCategory(
    payload: CategoryPayload
  ): Observable<{ success: boolean; message: string }> {
    const token = this.getToken();

    if (!token) {
      return throwError(() => new Error('No authorization token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .post<{ success: boolean; message: string }>(
        `${this.apiUrl}/category`,
        payload,
        { headers }
      )
      .pipe(
        catchError((error) => {
          console.error('Failed to create category:', error);
          let errorMessage =
            'Failed to create category. Please try again later.';

          if (error.status === 400) {
            errorMessage = 'Invalid category data. Please check your input.';
          } else if (error.status === 403) {
            errorMessage =
              'Permission denied. Only admins can create categories.';
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  archiveCategory(categoryId: number): Observable<any> {
    const token = this.getToken();

    if (!token) {
      return throwError(() => new Error('No authorization token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .patch(`${this.apiUrl}/categories/${categoryId}/archive`, {}, { headers })
      .pipe(
        catchError((error) => {
          console.error('Failed to archive category:', error);
          let errorMessage =
            'Failed to archive category. Please try again later.';

          if (error.status === 400) {
            errorMessage = 'Category cannot be archived.';
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }
}
