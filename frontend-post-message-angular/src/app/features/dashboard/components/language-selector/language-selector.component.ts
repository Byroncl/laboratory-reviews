import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, Language } from '../../../../core/services/i18n.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss'
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
