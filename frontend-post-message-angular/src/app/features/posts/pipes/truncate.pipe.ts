import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, length: number = 100, breakWords: boolean = true): string {
    if (!value) return '';
    if (value.length <= length) return value;

    if (breakWords) {
      return value.substring(0, length) + '…';
    }

    const truncated = value.substring(0, length);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '…';
  }
}
