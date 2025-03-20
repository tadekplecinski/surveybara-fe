import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import {
  UserSurveyParsed,
  UserSurveyService,
} from '../../services/user-survey.service';

@Component({
  selector: 'app-respond-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './respond-modal.component.html',
})
export class RespondModalComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private userSurveyService = inject(UserSurveyService);
  private destroy$ = new Subject<void>();

  @Output() close = new EventEmitter<void>();
  @Input() survey: UserSurveyParsed | null = null;

  surveyForm!: FormGroup;
  errorMessage: string | null = null;

  get submitBtnText() {
    return this.surveyForm.get('status')?.value === 'draft'
      ? 'Save Draft'
      : 'Submit';
  }

  get isSurveyValid() {
    return (
      this.survey && this.survey.questions && this.survey.questions.length > 0
    );
  }

  ngOnInit(): void {
    this.surveyForm = this.fb.group({
      answers: this.fb.array([]),
      status: ['draft', Validators.required],
    });

    if (this.survey) {
      this.populateForm(this.survey);
    }
  }

  get answers(): FormArray {
    return this.surveyForm.get('answers') as FormArray;
  }

  populateForm(survey: UserSurveyParsed): void {
    survey.questions.forEach((question) => {
      const existingAnswer = survey.answers.find(
        (answer) => answer.questionId === question.id
      );
      this.answers.push(
        this.fb.group({
          questionId: [question.id],
          question: [question.question, Validators.required],
          answer: [
            existingAnswer ? existingAnswer.answer : '',
            Validators.required,
          ],
        })
      );
    });
  }

  closeModal() {
    this.surveyForm.reset();
    this.close.emit();
  }

  onSubmit() {
    if (this.surveyForm.invalid || !this.survey) return;

    this.userSurveyService
      .updateUserSurvey(this.survey.id, this.surveyForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating survey:', error);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
