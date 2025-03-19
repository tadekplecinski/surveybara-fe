import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AddSurveyModalComponent } from '../../components/add-survey-modal/add-survey-modal.component';
import { Survey, SurveyService } from '../../services/survey.service';
import { UpdateSurveyModalComponent } from '../../components/update-survey-modal/update-survey-modal.component';
import { InviteUserModalComponent } from '../../components/invite-user-modal/invite-user-modal.component';
import { SurveyDetailsModalComponent } from '../../components/survey-details-modal/survey-details-modal.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    AddSurveyModalComponent,
    UpdateSurveyModalComponent,
    InviteUserModalComponent,
    SurveyDetailsModalComponent,
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
  showCreateModal = false;
  showUpdateModal = false;
  showInviteModal = false;
  showDetailsModal = false;

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

  openInviteModal(survey: Survey) {
    this.showInviteModal = true;
    this.selectedSurvey = survey;
  }

  openDetailsModal(survey: Survey) {
    this.showDetailsModal = true;
    this.selectedSurvey = survey;
  }

  // TODO: refactor!
  closeModal() {
    this.showCreateModal = false;
    this.showUpdateModal = false;
    this.showInviteModal = false;
    this.showDetailsModal = false;
    this.selectedSurvey = null;
    this.loadSurveys();
  }
}
