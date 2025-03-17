import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

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
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
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
}
