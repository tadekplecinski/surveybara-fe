import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';

import {
  UserSurveyService,
  UserSurveyParsed,
} from '../../services/user-survey.service';
import { RespondModalComponent } from '../../components/respond-modal/respond-modal.component';
import { UserSurveyDetailsModalComponent } from '../../components/user-survey-details-modal/user-survey-details-modal.component';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    RespondModalComponent,
    UserSurveyDetailsModalComponent,
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
export class UserDashboardComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  modal: 'respond' | 'details' | null = null;
  selectedUserSurvey: UserSurveyParsed | null = null;
  surveys = new MatTableDataSource<UserSurveyParsed>([]);

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
    this.userSurveyService
      .getUserSurveys()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.surveys.data = data;
        },
        error: (error) => {
          console.error('Error loading surveys:', error);
        },
      });
  }

  openModal(type: 'respond' | 'details', survey: UserSurveyParsed) {
    this.modal = type;
    this.selectedUserSurvey = survey;
  }

  closeModal() {
    this.modal = null;
    this.loadSurveys();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
