import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Highlight form inputs with errors
 * Usage: <input [formControl]="control" appFormError [control]="control" />
 */
@Directive({
  selector: 'input[appFormError], textarea[appFormError]',
  standalone: true
})
export class FormErrorDirective implements OnInit {
  @Input() control!: AbstractControl;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.control.statusChanges.subscribe(() => this.updateStyle());
    this.updateStyle();
  }

  private updateStyle(): void {
    const hasError = this.control.invalid && (this.control.dirty || this.control.touched);

    if (hasError) {
      this.renderer.addClass(this.el.nativeElement, 'border-red-500');
      this.renderer.addClass(this.el.nativeElement, 'ring-red-500');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'border-red-500');
      this.renderer.removeClass(this.el.nativeElement, 'ring-red-500');
    }
  }
}
