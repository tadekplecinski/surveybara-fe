import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserSurveyParsed } from '../../services/user-survey.service';

interface QuestionWithAnswer {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-survey-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-survey-details-modal.component.html',
  styleUrls: ['./user-survey-details-modal.component.scss'],
})
export class UserSurveyDetailsModalComponent implements OnChanges {
  @Input() surveyDetails: UserSurveyParsed | null = null;
  @Output() close = new EventEmitter<void>();

  errorMessage: string | null = null;
  questionAnswerPairs: QuestionWithAnswer[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['surveyDetails']?.currentValue) {
      this.prepareData();
    }
  }

  private prepareData(): void {
    if (!this.surveyDetails) return;

    this.questionAnswerPairs = this.surveyDetails.questions.map((question) => {
      const answer = this.surveyDetails!.answers.find(
        (a) => a.questionId === question.id
      );
      return {
        question: question.question,
        answer: answer ? answer.answer : 'No answer provided',
      };
    });
  }

  closeModal(): void {
    this.close.emit();
    this.surveyDetails = null;
    this.questionAnswerPairs = [];
  }
}
