import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Survey } from '../../services/survey.service';
import { UserService, User } from '../../services/user.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-invite-user-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invite-user-modal.component.html',
  styleUrls: ['./invite-user-modal.component.scss'],
})
export class InviteUserModalComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  users: User[] = [];
  @Input() survey: Survey | null = null;
  @Output() close = new EventEmitter<void>();
  private destroy$ = new Subject<void>();

  inviteForm!: FormGroup;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.inviteForm = this.fb.group({
      email: ['', Validators.required],
    });

    this.loadNonAdminUsers();
  }

  loadNonAdminUsers(): void {
    this.userService
      .getNonAdminUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          if (!this.survey || !this.survey.id) {
            return;
          }

          const survey = this.survey;
          // filter out those users who are already invited to this survey
          this.users = users.filter((user) => {
            const userSurveyIds = user.Surveys.map((s) => s.id);
            return !userSurveyIds.includes(survey.id);
          });
        },
        error: (err) => {
          this.errorMessage = err.message;
          console.error('Failed to load users:', err);
        },
      });
  }

  closeModal() {
    this.inviteForm.reset();
    this.close.emit();
  }

  onSubmit() {
    if (this.inviteForm.invalid) return;

    const { email } = this.inviteForm.value;
    if (!this.survey?.id) {
      this.errorMessage = 'Survey ID is missing.';
      return;
    }

    this.userService.inviteUser(this.survey.id, email).subscribe({
      next: () => {
        this.closeModal();
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('User invitation error:', err);
      },
    });

    this.closeModal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
