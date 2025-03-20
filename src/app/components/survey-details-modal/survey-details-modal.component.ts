import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, takeUntil } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';

import { SurveyDetails, SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './survey-details-modal.component.html',
  styleUrls: ['./survey-details-modal.component.scss'],
})
export class SurveyDetailsModalComponent implements OnInit, OnDestroy {
  private surveyService = inject(SurveyService);
  private destroy$ = new Subject<void>();

  @Input() surveyId!: number | undefined;
  @Output() close = new EventEmitter<void>();

  surveyDetails: SurveyDetails | null = null;
  errorMessage: string | null = null;

  ngOnInit(): void {
    if (!this.surveyId) {
      this.errorMessage = 'Survey ID is required.';
      return;
    }

    this.surveyService
      .getSurveyDetails(this.surveyId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.errorMessage = error.message;
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (details) => {
          this.surveyDetails = details;
        },
        error: (err) => {
          console.error('Error fetching survey details:', err);
        },
      });
  }

  get categoryNames(): string {
    return (
      this.surveyDetails?.survey.categories
        .map((category) => category.name)
        .join(', ') || ''
    );
  }

  get invitedUsers(): string {
    return this.surveyDetails?.invitedUsersEmails.join(', ') || '';
  }

  closeModal(): void {
    this.close.emit();
    this.surveyDetails = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
