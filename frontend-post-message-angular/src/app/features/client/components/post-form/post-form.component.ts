import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.scss',
})
export class PostFormComponent implements OnInit {
  @Input() initialData: any = null;
  @Input() isEditing = false;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      body: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: [''],
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.formSubmitted.emit(this.form.value);
    }
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  setSubmitting(value: boolean): void {
    this.isSubmitting = value;
  }

  setError(error: string): void {
    this.errorMessage = error;
    this.isSubmitting = false;
  }
}
