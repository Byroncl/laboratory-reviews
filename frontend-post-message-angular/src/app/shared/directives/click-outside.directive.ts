import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

/**
 * Emits `(clickOutside)` when a click event fires outside the host element.
 *
 * @example
 * <div appClickOutside (clickOutside)="closeMenu()">...</div>
 */
@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() readonly clickOutside = new EventEmitter<void>();

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (!this.el.nativeElement.contains(target)) {
      this.clickOutside.emit();
    }
  }
}
