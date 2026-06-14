import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, Language } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="relative">
      <!-- Dropdown Trigger Button -->
      <button
        (click)="toggleDropdown()"
        [attr.aria-expanded]="isDropdownOpen"
        [attr.aria-label]="'navbar.selectLanguage' | t"
        class="flex items-center gap-2 px-3 py-2 text-secondary hover:bg-gray-100 rounded-lg transition-colors duration-200"
      >
        <!-- Globe Icon -->
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20H7m6-4h.01M9 20h6"
          ></path>
        </svg>

        <!-- Current Language Label -->
        <span class="text-sm font-medium hidden sm:inline">
          {{ currentLanguage$ | async }}
        </span>

        <!-- Chevron Icon -->
        <svg
          class="w-4 h-4 transition-transform duration-200"
          [class.rotate-180]="isDropdownOpen"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          ></path>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      @if (isDropdownOpen) {
        <div
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
          role="menu"
          aria-orientation="vertical"
        >
          <div class="py-1">
            @for (lang of languages; track lang) {
              <button
                (click)="selectLanguage(lang)"
                [class.bg-gray-50]="(currentLanguage$ | async) === lang"
                [class.text-primary]="(currentLanguage$ | async) === lang"
                class="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150"
                [attr.aria-current]="(currentLanguage$ | async) === lang ? 'true' : 'false'"
                role="menuitem"
              >
                <!-- Language Flag Icon -->
                @if (lang === 'es') {
                  <span class="text-lg">🇪🇸</span>
                } @else if (lang === 'en') {
                  <span class="text-lg">🇬🇧</span>
                }

                <!-- Language Label -->
                <span class="flex-1">
                  {{ lang === 'es' ? ('navbar.spanish' | t) : ('navbar.english' | t) }}
                </span>

                <!-- Checkmark for Selected Language -->
                @if ((currentLanguage$ | async) === lang) {
                  <svg
                    class="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                }
              </button>
            }
          </div>
        </div>
      }

      <!-- Backdrop for Closing Dropdown -->
      @if (isDropdownOpen) {
        <div
          (click)="closeDropdown()"
          class="fixed inset-0 z-40"
          aria-hidden="true"
        ></div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes zoomIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .animate-in {
        animation: fadeIn 200ms ease-out, zoomIn 200ms ease-out;
      }
    `
  ]
})
export class LanguageSelectorComponent implements OnInit {
  isDropdownOpen = false;
  languages: Language[] = ['es', 'en'];
  currentLanguage$;

  constructor(private i18nService: I18nService) {
    this.currentLanguage$ = this.i18nService.language$;
  }

  ngOnInit(): void {}

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  selectLanguage(lang: Language): void {
    this.i18nService.setLanguage(lang);
    this.closeDropdown();
  }
}
