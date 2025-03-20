import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';

const equalPasswords = (control: AbstractControl) => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password === confirmPassword) {
    return null;
  }

  return { passwordsNotEqual: true };
};

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  registerForm!: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      passwords: this.fb.group(
        {
          password: ['', [Validators.required, Validators.minLength(6)]],
          confirmPassword: ['', [Validators.required]],
        },
        { validators: [equalPasswords] }
      ),
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    const { userName, email, passwords } = this.registerForm.value;

    this.authService
      .register({ userName, email, password: passwords.password })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('User registered successfully');
        },
        error: (err) => {
          console.error('Registration failed:', err);
          this.errorMessage = 'Registration failed. Please try again.';
        },
      });
  }

  get userName() {
    return this.registerForm.get('userName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('passwords.password');
  }

  get confirmPassword() {
    return this.registerForm.get('passwords.confirmPassword');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
