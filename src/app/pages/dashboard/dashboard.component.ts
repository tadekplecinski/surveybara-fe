import { Component, inject, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../services/auth.service';
import { AddSurveyModalComponent } from '../../components/add-survey-modal/add-survey-modal.component';
import { Survey, SurveyService } from '../../services/survey.service';
import { UpdateSurveyModalComponent } from '../../components/update-survey-modal/update-survey-modal.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    AddSurveyModalComponent,
    UpdateSurveyModalComponent,
    MatTableModule,
    CommonModule,
    MatSortModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private authService = inject(AuthService);
  showCreateModal = false;
  showUpdateModal = false;

  userRole: string | null = null;
  private userRoleSubscription: Subscription | null = null;
  private surveysSubscription: Subscription | null = null;

  @ViewChild(MatSort) sort!: MatSort;
  selectedSurvey: Survey | null = null;

  surveys = new MatTableDataSource<Survey>([]);
  displayedColumns: string[] = [
    'title',
    'status',
    'questionsCount',
    'createdAt',
    'updatedAt',
    'categories',
    'actions',
  ];

  constructor(private surveyService: SurveyService) {}

  ngAfterViewInit() {
    this.surveys.sort = this.sort;
  }

  ngOnInit(): void {
    this.loadSurveys();
    // TODO: remove???, dashboards will be separated by role anyway
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

  openCreateModal() {
    this.showCreateModal = true;
  }

  openUpdateModal(survey: Survey) {
    this.showUpdateModal = true;
    this.selectedSurvey = survey;
  }

  // refactor!
  closeModal() {
    this.showCreateModal = false;
    this.showUpdateModal = false;
    this.selectedSurvey = null;
    this.loadSurveys();
  }

  get isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  duplicateSurvey(survey: Survey) {
    console.log('Duplicate survey:', survey);
    // Implement the logic to duplicate the survey
  }

  deleteSurvey(survey: Survey) {
    console.log('Delete survey:', survey);
    // Implement the logic to confirm and delete the survey
  }
}
