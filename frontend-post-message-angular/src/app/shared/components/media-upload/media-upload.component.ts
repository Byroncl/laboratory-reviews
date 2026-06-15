import {
  Component,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilesService } from '../../../core/services/files.service';
import {
  MEDIA_ALLOWED_TYPES,
  MEDIA_MAX_FILES,
  MEDIA_MAX_TOTAL_BYTES,
} from '../../constants/media-upload.constants';
import { MediaUploadResult, SelectedMedia } from '../../models/media-upload.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Hidden native file input -->
    <input
      #fileInput
      type="file"
      multiple
      [accept]="acceptAttr"
      class="hidden"
      (change)="onFilesSelected($event)"
    />

    <!-- Picker button -->
    <button
      type="button"
      data-testid="file-picker-btn"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      [disabled]="disabled() || !canAddMore() || uploading()"
      (click)="fileInput.click()"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      Attach files
      @if (selectedFiles().length > 0) {
        <span class="text-gray-500">({{ selectedFiles().length }}/{{ maxFiles() }})</span>
      }
    </button>

    <!-- Preview grid -->
    @if (selectedFiles().length > 0) {
      <div class="mt-2 grid grid-cols-3 gap-2">
        @for (item of selectedFiles(); track item.file.name; let i = $index) {
          <div class="relative rounded overflow-hidden border border-gray-200 bg-gray-50">
            @if (item.type.startsWith('image/') && item.previewUrl) {
              <img
                [src]="item.previewUrl"
                [alt]="item.file.name"
                class="w-full aspect-square object-cover"
              />
            } @else {
              <div class="flex flex-col items-center justify-center aspect-square p-2 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span class="text-xs text-gray-500 break-all line-clamp-2">{{ item.file.name }}</span>
              </div>
            }

            <!-- Per-tile uploading spinner -->
            @if (uploading() && item.status === 'uploading') {
              <div class="absolute inset-0 bg-white/60 flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>
            }

            <!-- Remove button -->
            <button
              type="button"
              class="absolute top-0.5 right-0.5 rounded-full bg-gray-800/70 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              [disabled]="uploading()"
              (click)="removeFile(i)"
              [attr.aria-label]="'Remove ' + item.file.name"
            >
              &times;
            </button>
          </div>
        }
      </div>
    }

    <!-- Error list -->
    @if (errors().length > 0) {
      <ul class="mt-1 space-y-0.5">
        @for (err of errors(); track err) {
          <li class="text-xs text-red-600">{{ err }}</li>
        }
      </ul>
    }
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class MediaUploadComponent implements OnDestroy {
  // ── Inputs ──────────────────────────────────────────────────────────────────
  disabled = input<boolean>(false);
  maxFiles = input<number>(MEDIA_MAX_FILES);

  // ── Outputs ──────────────────────────────────────────────────────────────────
  filesReady = output<MediaUploadResult>();
  uploadingChange = output<boolean>();

  // ── Internal signals (prefixed _ for testability, public aliases below) ─────
  /** @internal exposed for tests */
  _selectedFiles = signal<SelectedMedia[]>([]);
  /** @internal exposed for tests */
  _errors = signal<string[]>([]);
  /** @internal */
  private _uploading = signal<boolean>(false);

  // ── Public computed aliases ──────────────────────────────────────────────────
  selectedFiles = computed(() => this._selectedFiles());
  errors = computed(() => this._errors());
  uploading = computed(() => this._uploading());
  canAddMore = computed(() => this._selectedFiles().length < this.maxFiles());
  totalBytes = computed(() =>
    this._selectedFiles().reduce((sum, s) => sum + s.file.size, 0),
  );

  readonly acceptAttr = '.png,.jpg,.jpeg,.webp';

  private filesService = inject(FilesService);

  // ── Public API ───────────────────────────────────────────────────────────────

  /** Called by parent components (via viewChild) after a successful submit. */
  reset(): void {
    this._revokeAll();
    this._selectedFiles.set([]);
    this._errors.set([]);
  }

  /**
   * Test entry point — mirrors the internal selection logic without needing a DOM event.
   * Production code uses onFilesSelected(event).
   */
  handleFilesForTesting(files: File[]): void {
    this._processNewFiles(files);
  }

  // ── Event handlers ───────────────────────────────────────────────────────────

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    input.value = ''; // reset so re-selecting same file fires change
    this._processNewFiles(files);
  }

  removeFile(index: number): void {
    const current = this._selectedFiles();
    const removed = current[index];
    if (removed?.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    const next = current.filter((_, i) => i !== index);
    this._selectedFiles.set(next);

    // Re-emit updated result with remaining done files
    this._emitCurrentResult();
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this._revokeAll();
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private _processNewFiles(incoming: File[]): void {
    this._errors.set([]);
    const { valid, errors } = this._validate(incoming);
    if (errors.length) {
      this._errors.set(errors);
    }
    if (!valid.length) return;

    // Create object URLs for images
    const withPreviews: SelectedMedia[] = valid.map(file => ({
      file,
      type: file.type,
      status: 'pending' as const,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    this._selectedFiles.set([...this._selectedFiles(), ...withPreviews]);

    // Upload immediately
    this._uploadAll(withPreviews);
  }

  private _validate(incoming: File[]): { valid: File[]; errors: string[] } {
    const errors: string[] = [];
    const valid: File[] = [];
    const currentCount = this._selectedFiles().length;
    const currentBytes = this.totalBytes();
    let addedCount = 0;
    let addedBytes = 0;

    for (const file of incoming) {
      // Type check — images only
      const allowed = MEDIA_ALLOWED_TYPES.includes(file.type);
      if (!allowed) {
        errors.push(`"${file.name}" is not a valid image (PNG, JPG, WEBP only)`);
        continue;
      }

      // Count check
      if (currentCount + addedCount >= this.maxFiles()) {
        errors.push(`File limit reached: maximum ${this.maxFiles()} files allowed`);
        break;
      }

      // Size check
      if (currentBytes + addedBytes + file.size > MEDIA_MAX_TOTAL_BYTES) {
        const limitMB = (MEDIA_MAX_TOTAL_BYTES / (1024 * 1024)).toFixed(0);
        errors.push(`Total size limit exceeded: maximum ${limitMB} MB allowed`);
        continue;
      }

      valid.push(file);
      addedCount++;
      addedBytes += file.size;
    }

    return { valid, errors };
  }

  private async _uploadAll(items: SelectedMedia[]): Promise<void> {
    this._uploading.set(true);
    this.uploadingChange.emit(true);

    // Mark tiles as uploading
    this._selectedFiles.update(current =>
      current.map(s =>
        items.includes(s) ? { ...s, status: 'uploading' as const } : s,
      ),
    );

    try {
      const files = items.map(s => s.file);
      const result = await firstValueFrom(this.filesService.uploadFiles(files));

      // Zip response {url,filename}[] with locally-captured types by index
      const uploadedItems = result.data;
      const updatedItems: SelectedMedia[] = items.map((s, i) => ({
        ...s,
        status: 'done' as const,
        url: uploadedItems[i]?.url,
        filename: uploadedItems[i]?.filename,
      }));

      // Merge into selectedFiles
      this._selectedFiles.update(current =>
        current.map(s => {
          const updated = updatedItems.find(u => u.file === s.file);
          return updated ?? s;
        }),
      );

      this._emitCurrentResult();
    } catch (err: unknown) {
      const message =
        (err instanceof Error ? err.message : null) ?? 'Upload failed';
      this._errors.update(errs => [...errs, message]);

      // Mark these tiles as error
      this._selectedFiles.update(current =>
        current.map(s =>
          items.includes(s) ? { ...s, status: 'error' as const } : s,
        ),
      );
    } finally {
      this._uploading.set(false);
      this.uploadingChange.emit(false);
    }
  }

  private _emitCurrentResult(): void {
    const done = this._selectedFiles().filter(s => s.status === 'done' && s.url);
    const mediaUrls = done.map(s => s.url!);
    const mediaTypes = done.map(s => s.type);
    const mediaFilenames = done.map(s => s.filename ?? s.file.name);
    this.filesReady.emit({ mediaUrls, mediaTypes, mediaFilenames });
  }

  private _revokeAll(): void {
    for (const s of this._selectedFiles()) {
      if (s.previewUrl) {
        URL.revokeObjectURL(s.previewUrl);
      }
    }
  }
}
