import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  UserSurveyParsed,
  UserSurveyService,
} from '../../services/user-survey.service';

@Component({
  selector: 'app-respond-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './respond-modal.component.html',
})
export class RespondModalComponent {
  private fb = inject(FormBuilder);
  private userSurveyService = inject(UserSurveyService);

  @Output() close = new EventEmitter<void>();
  @Input() survey: UserSurveyParsed | null = null;

  surveyForm: FormGroup;
  errorMessage: string | null = null;

  constructor() {
    this.surveyForm = this.fb.group({
      answers: this.fb.array([]),
      status: ['draft', Validators.required],
    });
  }

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
    if (this.surveyForm.invalid) return;

    this.userSurveyService
      .updateUserSurvey(this.survey!.id, this.surveyForm.value)
      .subscribe({
        next: () => {
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating survey:', error);
        },
      });
  }
}
