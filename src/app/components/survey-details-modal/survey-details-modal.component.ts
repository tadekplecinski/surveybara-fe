import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { SurveyDetails, SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-survey-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './survey-details-modal.component.html',
  styleUrls: ['./survey-details-modal.component.scss'],
})
export class SurveyDetailsModalComponent implements OnInit {
  private surveyService = inject(SurveyService);

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
    ); // Ensure it doesn't return null or undefined
  }

  get invitedUsers(): string {
    return this.surveyDetails?.invitedUsersEmails.join(', ') || ''; // Ensure it doesn't return null or undefined
  }

  closeModal(): void {
    this.close.emit();
    this.surveyDetails = null;
  }
}
