import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';
import { Category, CategoryService } from '../../services/category.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AddCategoryModalComponent } from '../../components/add-category-modal/add-category-modal.component';
import { ArchiveCategoryModalComponent } from '../../components/archive-category-modal/archive-category-modal.component';

@Component({
  selector: 'app-categories',
  imports: [
    AddCategoryModalComponent,
    ArchiveCategoryModalComponent,
    MatTableModule,
    CommonModule,
    MatSortModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private destroy$ = new Subject<void>();

  modal: 'create' | 'archive' | null = null;

  @ViewChild(MatSort) sort!: MatSort;
  selectedCategory: Category | null = null;

  categories = new MatTableDataSource<Category>([]);

  displayedColumns: string[] = [
    'name',
    'status',
    'description',
    'createdAt',
    'updatedAt',
    'actions',
  ];

  constructor(private categoryService: CategoryService) {}

  ngAfterViewInit() {
    this.categories.sort = this.sort;
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService
      .fetchCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories.data = categories;
        },
        error: (err) => {
          console.error('Failed to load categories:', err);
        },
      });
  }

  openModal(type: 'create' | 'archive', category?: Category) {
    this.modal = type;
    this.selectedCategory = category ?? null;
  }

  closeModal() {
    this.modal = null;
    this.selectedCategory = null;
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
