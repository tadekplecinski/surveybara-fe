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
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { Survey, SurveyService } from '../../services/survey.service';
import { Category, CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-update-survey-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-survey-modal.component.html',
  styleUrls: ['./update-survey-modal.component.scss'],
})
export class UpdateSurveyModalComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private surveyService = inject(SurveyService);
  private categoryService = inject(CategoryService);
  private destroy$ = new Subject<void>();

  categories: Category[] = [];
  @Output() close = new EventEmitter<void>();
  @Input() survey: Survey | null = null;

  surveyForm!: FormGroup;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.createForm();
    this.loadCategories();
    if (this.survey) {
      this.populateForm(this.survey);
    }

    this.surveyForm.get('questions')?.valueChanges.subscribe(() => {
      this.surveyForm.get('status')?.updateValueAndValidity();
    });
  }

  private createForm(): void {
    this.surveyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      categoryIds: [[]],
      questions: this.fb.array([]),
      status: ['draft', [Validators.required, this.statusValidator.bind(this)]],
    });
  }

  loadCategories(): void {
    this.categoryService
      .fetchCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (err) => {
          this.errorMessage = err.message;
          console.error('Failed to load categories:', err);
        },
      });
  }

  statusValidator(control: AbstractControl): ValidationErrors | null {
    const questions = this.surveyForm?.get('questions') as FormArray;

    if (
      control.value === 'published' &&
      (!questions || questions.length === 0)
    ) {
      return {
        noQuestions:
          'A survey must have at least one question to be published.',
      };
    }
    return null;
  }

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  addQuestion() {
    this.questions.push(
      this.fb.group({
        id: [null],
        question: ['', Validators.required],
      })
    );
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  private populateForm(survey: Survey): void {
    this.surveyForm.patchValue({
      title: survey.title,
      categoryIds: survey.categories.map((category) => category.id),
      status: survey.status,
    });

    survey.questions.forEach((question) => {
      this.questions.push(
        this.fb.group({
          id: [question.id],
          question: [question.question, Validators.required],
        })
      );
    });
  }

  closeModal() {
    this.surveyForm.reset({ status: 'draft', categoryIds: [] });
    this.close.emit();
  }

  onSubmit() {
    if (this.surveyForm.invalid) return;

    const updatedSurvey = {
      ...this.surveyForm.value,
      questions: this.surveyForm.value.questions.map((q: any) => ({
        ...(q.id ? { id: q.id } : {}), // BE is not expecting id: null -> remove id
        question: q.question,
      })),
    };

    this.surveyService
      .updateSurvey(this.survey!.id, updatedSurvey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = err.message;
          console.error('Survey update error:', err);
        },
      });
  }

  get submitBtnText() {
    return this.surveyForm.get('status')?.value === 'draft'
      ? 'Save Draft'
      : 'Publish';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
