import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'plural',
  standalone: true,
})
export class PluralPipe implements PipeTransform {
  transform(count: number | null | undefined, singular: string): string {
    const n = count ?? 0;
    return n === 1 ? `${n} ${singular}` : `${n} ${singular}s`;
  }
}
