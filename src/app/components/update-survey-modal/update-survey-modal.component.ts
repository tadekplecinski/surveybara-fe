import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Survey, SurveyService } from '../../services/survey.service';
import { Category, CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-update-survey-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-survey-modal.component.html',
  styleUrls: ['./update-survey-modal.component.scss'],
})
export class UpdateSurveyModalComponent {
  private fb = inject(FormBuilder);
  private surveyService = inject(SurveyService);
  private categoryService = inject(CategoryService);

  categories: Category[] = [];
  @Output() close = new EventEmitter<void>();
  @Input() survey: Survey | null = null;
  @Input() readonlyMode = false;

  surveyForm: FormGroup;
  errorMessage: string | null = null;

  constructor() {
    this.surveyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      categoryIds: [[]],
      questions: this.fb.array([]),
      status: ['draft', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    if (this.survey) {
      this.populateForm(this.survey);
    }
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

  populateForm(survey: Survey): void {
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

    if (this.readonlyMode) {
      this.surveyForm.disable();
    }
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

    this.surveyService.updateSurvey(this.survey!.id, updatedSurvey).subscribe({
      next: () => {
        this.closeModal();
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Survey update error:', err);
      },
    });
  }
}
