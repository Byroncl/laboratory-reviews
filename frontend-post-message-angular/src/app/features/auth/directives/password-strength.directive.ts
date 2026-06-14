import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { calculatePasswordStrength } from '../validators/custom-validators';

/**
 * Visual password strength indicator directive
 * Usage: <input appPasswordStrength [(ngModel)]="password" />
 * Shows strength bar below input
 */
@Directive({
  selector: 'input[appPasswordStrength]',
  standalone: true
})
export class PasswordStrengthDirective implements OnInit {
  @Input() passwordControl: any;

  private strengthBar: HTMLElement | null = null;
  private strengthLabel: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.createStrengthIndicator();
    this.el.nativeElement.addEventListener('input', () => this.updateStrength());
  }

  private createStrengthIndicator(): void {
    // Strength bar
    this.strengthBar = this.renderer.createElement('div');
    this.renderer.setStyle(this.strengthBar, 'height', '4px');
    this.renderer.setStyle(this.strengthBar, 'margin-top', '4px');
    this.renderer.setStyle(this.strengthBar, 'border-radius', '2px');
    this.renderer.setStyle(this.strengthBar, 'background-color', '#e5e7eb');
    this.renderer.setStyle(this.strengthBar, 'transition', 'all 0.3s ease');

    // Strength label
    this.strengthLabel = this.renderer.createElement('small');
    this.renderer.setStyle(this.strengthLabel, 'display', 'block');
    this.renderer.setStyle(this.strengthLabel, 'margin-top', '4px');
    this.renderer.setStyle(this.strengthLabel, 'font-size', '0.75rem');
    this.renderer.setStyle(this.strengthLabel, 'color', '#6b7280');

    // Insert after input
    this.renderer.insertBefore(this.el.nativeElement.parentNode, this.strengthBar, this.el.nativeElement.nextSibling);
    this.renderer.insertBefore(this.el.nativeElement.parentNode, this.strengthLabel, this.strengthBar.nextSibling);
  }

  private updateStrength(): void {
    const password = this.el.nativeElement.value;
    if (!password) {
      this.resetStrength();
      return;
    }

    const strength = calculatePasswordStrength(password);
    this.setStrengthColor(strength);
  }

  private setStrengthColor(strength: number): void {
    if (!this.strengthBar || !this.strengthLabel) return;

    const colors = [
      { color: '#ef4444', label: 'Weak' },
      { color: '#f97316', label: 'Weak' },
      { color: '#eab308', label: 'Fair' },
      { color: '#84cc16', label: 'Good' },
      { color: '#22c55e', label: 'Strong' },
      { color: '#16a34a', label: 'Very Strong' }
    ];

    const config = colors[strength] || colors[0];
    const percentage = (strength / 5) * 100;

    this.renderer.setStyle(this.strengthBar, 'background-color', config.color);
    this.renderer.setStyle(this.strengthBar, 'width', percentage + '%');
    this.renderer.setTextContent(this.strengthLabel, config.label);
    this.renderer.setStyle(this.strengthLabel, 'color', config.color);
  }

  private resetStrength(): void {
    if (!this.strengthBar || !this.strengthLabel) return;
    this.renderer.setStyle(this.strengthBar, 'width', '0%');
    this.renderer.setStyle(this.strengthBar, 'background-color', '#e5e7eb');
    this.renderer.setTextContent(this.strengthLabel, '');
  }
}
