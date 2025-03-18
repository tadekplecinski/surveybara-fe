import { Component, inject, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { AuthService } from '../../services/auth.service';
import { AddSurveyModalComponent } from '../../components/add-survey-modal/add-survey-modal.component';
import { Survey, SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    AddSurveyModalComponent,
    MatTableModule,
    CommonModule,
    MatSortModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private authService = inject(AuthService);
  showModal = false;

  userRole: string | null = null;
  private userRoleSubscription: Subscription | null = null;
  private surveysSubscription: Subscription | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  surveys = new MatTableDataSource<Survey>([]);
  displayedColumns: string[] = [
    'title',
    'status',
    'questionsCount',
    'createdAt',
    'updatedAt',
    'categories',
  ];

  constructor(private surveyService: SurveyService) {}

  ngAfterViewInit() {
    this.surveys.sort = this.sort;
  }

  ngOnInit(): void {
    this.loadSurveys();
    // TODO: remove, dashboards will be separated by role anyway
    this.userRoleSubscription = this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
    });
  }

  loadSurveys() {
    this.surveysSubscription = this.surveyService.getSurveys().subscribe({
      next: (data) => {
        this.surveys.data = data;
      },
      error: (error) => {
        console.error('Error loading surveys:', error);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.userRoleSubscription) {
      this.userRoleSubscription.unsubscribe();
    }

    if (this.surveysSubscription) {
      this.surveysSubscription.unsubscribe();
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.loadSurveys();
  }

  get isAdmin(): boolean {
    return this.userRole === 'admin';
  }
}
