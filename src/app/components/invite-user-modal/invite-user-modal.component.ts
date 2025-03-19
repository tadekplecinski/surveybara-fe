import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Survey } from '../../services/survey.service';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-invite-user-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invite-user-modal.component.html',
  styleUrls: ['./invite-user-modal.component.scss'],
})
export class InviteUserModalComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  users: User[] = [];
  @Input() survey: Survey | null = null;
  @Output() close = new EventEmitter<void>();

  inviteForm: FormGroup;
  errorMessage: string | null = null;

  constructor() {
    this.inviteForm = this.fb.group({
      email: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadNonAdminUsers();
  }

  loadNonAdminUsers(): void {
    this.userService.getNonAdminUsers().subscribe({
      next: (users) => {
        this.users = users;
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
}
