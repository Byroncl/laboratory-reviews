import { Pipe, PipeTransform } from '@angular/core';
import { STATUS_DISPLAY_LABELS, PostStatusType } from '../constants';

@Pipe({
  name: 'postStatus',
  standalone: true,
})
export class PostStatusPipe implements PipeTransform {
  transform(status: string | undefined): string {
    if (!status) return 'Unknown';
    return STATUS_DISPLAY_LABELS[status as PostStatusType] || status;
  }
}
