import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, Language } from '../services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-2">
      <button
        *ngFor="let lang of languages"
        (click)="setLanguage(lang)"
        [class.active]="isActive(lang)"
        class="px-3 py-1.5 text-sm font-medium rounded-lg transition"
        [ngClass]="{
          'bg-primary text-white': isActive(lang),
          'bg-gray-200 text-primary hover:bg-gray-300': !isActive(lang)
        }"
      >
        {{ lang | uppercase }}
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LanguageSwitcherComponent {
  languages: Language[] = ['es', 'en'];

  constructor(private i18n: I18nService) {}

  setLanguage(lang: Language): void {
    this.i18n.setLanguage(lang);
  }

  isActive(lang: Language): boolean {
    return this.i18n.currentLanguage === lang;
  }
}
