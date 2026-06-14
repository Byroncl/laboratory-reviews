import { Pipe, PipeTransform } from '@angular/core';
import { calculatePasswordStrength, getPasswordStrengthLabel } from '../validators/custom-validators';

export interface PasswordStrengthResult {
  score: number;
  label: string;
  percentage: number;
  color: string;
}

@Pipe({
  name: 'passwordStrength',
  standalone: true
})
export class PasswordStrengthPipe implements PipeTransform {
  transform(password: string): PasswordStrengthResult {
    const score = calculatePasswordStrength(password);
    const label = getPasswordStrengthLabel(score);
    const percentage = (score / 5) * 100;
    const color = this.getColorForStrength(label);

    return { score, label, percentage, color };
  }

  private getColorForStrength(label: string): string {
    const colors: Record<string, string> = {
      'weak': '#ef4444',
      'fair': '#f97316',
      'good': '#eab308',
      'strong': '#84cc16',
      'very-strong': '#22c55e'
    };
    return colors[label] || '#ef4444';
  }
}
