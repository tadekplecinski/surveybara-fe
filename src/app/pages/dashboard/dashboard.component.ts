import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AddSurveyModalComponent } from '../../components/add-survey-modal/add-survey-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [AddSurveyModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private authService = inject(AuthService);
  showModal = false;

  userRole: string | null = null;
  private userRoleSubscription: Subscription | null = null;

  get isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  ngOnInit(): void {
    this.userRoleSubscription = this.authService.userRole$.subscribe((role) => {
      console.log('role ----------------', role);

      this.userRole = role;
    });
  }

  ngOnDestroy(): void {
    if (this.userRoleSubscription) {
      this.userRoleSubscription.unsubscribe();
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
