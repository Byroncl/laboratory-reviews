import { Component, input, output, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { CreatePostFormData } from '../../types';
import { postTitleValidator, postBodyValidator, markFormAsTouched } from '../../utils';
import { CLIENT_MESSAGES, CLIENT_VALIDATION } from '../../constants';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.scss',
})
export class PostFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly initialData = input<any>(null);
  readonly isEditing = input(false);

  readonly formSubmitted = output<CreatePostFormData>();
  readonly formCancelled = output<void>();

  readonly isSubmitting$ = signal(false);
  readonly errorMessage$ = signal<string | null>(null);

  readonly messages = CLIENT_MESSAGES.POST_FORM;
  readonly validation = CLIENT_VALIDATION;

  readonly form = this.fb.group({
    title: ['', [Validators.required, postTitleValidator()]],
    body: ['', [Validators.required, postBodyValidator()]],
    categoryId: [''],
  });

  ngOnInit(): void {
    if (this.initialData()) {
      const data = this.initialData();
      this.form.patchValue({
        title: data.title,
        body: data.body,
        categoryId: data.categoryId || '',
      });
    }
  }

  onSubmit(): void {
    this.errorMessage$.set(null);
    markFormAsTouched(this.form);

    if (this.form.valid) {
      this.isSubmitting$.set(true);
      this.formSubmitted.emit(this.form.value as CreatePostFormData);
    }
  }

  onCancel(): void {
    this.form.reset();
    this.errorMessage$.set(null);
    this.formCancelled.emit();
  }

  getFieldError(field: string): boolean {
    const control = this.form.get(field);
    return control ? control.invalid && control.touched : false;
  }
}
