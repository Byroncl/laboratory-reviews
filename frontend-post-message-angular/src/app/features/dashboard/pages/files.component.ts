import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss'
})
export class FilesComponent {}
