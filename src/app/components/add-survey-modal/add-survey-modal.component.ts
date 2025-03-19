import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../services/survey.service';
import { Category, CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-add-survey-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-survey-modal.component.html',
  styleUrls: ['./add-survey-modal.component.scss'],
})
export class AddSurveyModalComponent {
  private fb = inject(FormBuilder);
  private surveyService = inject(SurveyService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  categories: Category[] = [];
  @Output() close = new EventEmitter<void>();

  surveyForm: FormGroup;
  errorMessage: string | null = null;

  constructor() {
    this.surveyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      categoryIds: [[]],
      questions: this.fb.array([]),
      status: ['draft', [Validators.required, this.statusValidator.bind(this)]],
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

  ngOnInit(): void {
    this.loadCategories();

    this.surveyForm.get('questions')?.valueChanges.subscribe(() => {
      this.surveyForm.get('status')?.updateValueAndValidity();
    });
  }

  loadCategories(): void {
    this.categoryService.fetchCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Failed to load categories:', err);
      },
    });
  }

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  addQuestion() {
    this.questions.push(this.fb.control('', Validators.required));
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  closeModal() {
    this.surveyForm.reset({ status: 'draft', categoryIds: [] });
    this.close.emit();
  }

  onSubmit() {
    if (this.surveyForm.invalid) return;

    this.surveyService.createSurvey(this.surveyForm.value).subscribe({
      next: () => {
        this.closeModal();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Survey creation error:', err);
      },
    });
  }
}
