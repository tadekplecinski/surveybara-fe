import { Component, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AddSurveyModalComponent } from '../../components/add-survey-modal/add-survey-modal.component';
import {
  Survey,
  SurveyFilters,
  SurveyService,
} from '../../services/survey.service';
import { UpdateSurveyModalComponent } from '../../components/update-survey-modal/update-survey-modal.component';
import { InviteUserModalComponent } from '../../components/invite-user-modal/invite-user-modal.component';
import { SurveyDetailsModalComponent } from '../../components/survey-details-modal/survey-details-modal.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Category, CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    AddSurveyModalComponent,
    UpdateSurveyModalComponent,
    InviteUserModalComponent,
    SurveyDetailsModalComponent,
    MatTableModule,
    CommonModule,
    MatSortModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  filterForm!: FormGroup;
  modal: 'create' | 'update' | 'invite' | 'details' | null = null;

  private surveysSubscription: Subscription | null = null;

  @ViewChild(MatSort) sort!: MatSort;
  selectedSurvey: Survey | null = null;
  categories: Category[] = [];

  surveys = new MatTableDataSource<Survey>([]);
  displayedColumns: string[] = [
    'title',
    'status',
    'questionsCount',
    'createdAt',
    'updatedAt',
    'categories',
    'actions',
  ];

  constructor(
    private surveyService: SurveyService,
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {}

  ngAfterViewInit() {
    this.surveys.sort = this.sort;
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group<SurveyFilters>({
      searchTitle: '',
      status: '',
      categoryId: '',
    });

    this.filterForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((filters) => {
        this.loadSurveys(filters);
      });

    this.loadSurveys(this.filterForm.value);
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.fetchCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      },
    });
  }

  clearSearch() {
    this.filterForm.patchValue({ searchTitle: '' });
  }

  loadSurveys(filters: SurveyFilters) {
    this.surveysSubscription = this.surveyService
      .getSurveys(filters)
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
    if (this.surveysSubscription) {
      this.surveysSubscription.unsubscribe();
    }
  }

  openCreateModal() {
    this.modal = 'create';
  }

  openUpdateModal(survey: Survey) {
    this.modal = 'update';
    this.selectedSurvey = survey;
  }

  openInviteModal(survey: Survey) {
    this.modal = 'invite';
    this.selectedSurvey = survey;
  }

  openDetailsModal(survey: Survey) {
    this.modal = 'details';
    this.selectedSurvey = survey;
  }

  closeModal() {
    this.modal = null;
    this.selectedSurvey = null;
    this.loadSurveys(this.filterForm.value);
  }
}
