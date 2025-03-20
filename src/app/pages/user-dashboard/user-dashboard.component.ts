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
  UserSurveyParsed,
} from '../../services/user-survey.service';
import { RespondModalComponent } from '../../components/respond-modal/respond-modal.component';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    RespondModalComponent,
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
  showModal = false;
  readonlyMode = false;
  selectedUserSurvey: UserSurveyParsed | null = null;
  surveys = new MatTableDataSource<UserSurveyParsed>([]);

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

  openRespondModal(survey: UserSurveyParsed, readonly = false) {
    this.showModal = true;
    this.selectedUserSurvey = survey;
    this.readonlyMode = readonly;
  }

  openPreviewModal(survey: UserSurveyParsed) {
    this.openRespondModal(survey, true);
  }

  closeModal() {
    this.showModal = false;
    this.loadSurveys();
  }
}
