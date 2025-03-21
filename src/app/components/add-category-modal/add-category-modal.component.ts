import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-add-category-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-category-modal.component.html',
  styleUrl: './add-category-modal.component.scss',
})
export class AddCategoryModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  @Output() close = new EventEmitter<void>();
  categoryForm!: FormGroup;

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;

    this.categoryService.createCategory(this.categoryForm.value).subscribe({
      next: () => {
        this.closeModal();
      },
      error: (err) => {
        console.error('Survey creation error:', err);
      },
    });
  }

  closeModal() {
    this.categoryForm.reset();
    this.close.emit();
  }

  get name() {
    return this.categoryForm.get('name');
  }

  get description() {
    return this.categoryForm.get('description');
  }
}
