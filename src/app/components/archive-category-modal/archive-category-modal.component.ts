import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { Category, CategoryService } from '../../services/category.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-archive-category-modal',
  imports: [],
  templateUrl: './archive-category-modal.component.html',
  styleUrl: './archive-category-modal.component.scss',
})
export class ArchiveCategoryModalComponent implements OnDestroy {
  private categoryService = inject(CategoryService);
  private destroy$ = new Subject<void>();

  @Output() close = new EventEmitter<void>();
  @Input() category: Category | null = null;
  errorMessage: string = '';

  onConfirm() {
    this.categoryService
      .archiveCategory(this.category!.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = err;
          console.error('Error archiving the category!!!!', err);
        },
      });
  }

  closeModal() {
    this.close.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
