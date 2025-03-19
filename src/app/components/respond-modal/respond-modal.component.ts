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
  @Input() readonlyMode = false;

  surveyForm: FormGroup;
  errorMessage: string | null = null;

  constructor() {
    this.surveyForm = this.fb.group({
      answers: this.fb.array([]),
      status: ['draft', Validators.required],
    });
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

    if (this.readonlyMode) {
      this.surveyForm.disable();
    }
  }

  closeModal() {
    this.surveyForm.reset();
    this.close.emit();
  }

  onSubmit() {
    if (this.surveyForm.invalid) return;

    console.log('this.surveyForm.value', this.surveyForm.value);

    // const updatedSurvey = {
    //   id: this.survey?.id!,
    //   answers: this.surveyForm.value.questions.map((q: any) => ({
    //     questionId: q.questionId,
    //     answer: q.answer,
    //   })),
    // };

    // console.log('this.surveyForm.value', this.surveyForm.value);
    // return;

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
