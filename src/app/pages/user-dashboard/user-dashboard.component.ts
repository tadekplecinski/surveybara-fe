import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {
  UserSurveyService,
  UserSurveysParsed,
} from '../../services/user-survey.service';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    MatTableModule,
    CommonModule,
    MatSortModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent {
  showAnswerModal = false;
  showPreviewModal = false;
  readonlyMode = false;
  selectedUserSurvey: UserSurveysParsed | null = null;
  surveys = new MatTableDataSource<UserSurveysParsed>([]);

  private userSurveysSubscription: Subscription | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'title',
    'status',
    'questionsCount',
    'createdAt',
    'updatedAt',
    'actions',
  ];

  constructor(private userSurveyService: UserSurveyService) {}

  ngAfterViewInit() {
    this.surveys.sort = this.sort;
  }

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys() {
    this.userSurveysSubscription = this.userSurveyService
      .getUserSurveys()
      .subscribe({
        next: (data) => {
          this.surveys.data = data;
        },
        error: (error) => {
          console.error('Error loading surveys:', error);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.userSurveysSubscription) {
      this.userSurveysSubscription.unsubscribe();
    }
  }

  openAnswerModal(survey: UserSurveysParsed, readonly = false) {
    this.showAnswerModal = true;
    this.selectedUserSurvey = survey;
    this.readonlyMode = readonly;
  }

  openPreviewModal(survey: UserSurveysParsed) {
    this.openAnswerModal(survey, true);
  }

  closeModal() {
    this.showAnswerModal = false;
    this.showPreviewModal = false;
    this.loadSurveys();
  }
}
