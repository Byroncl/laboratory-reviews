import { Pipe, PipeTransform } from '@angular/core';

export interface ITagBadge {
  label: string;
}

@Pipe({
  name: 'tagsRender',
  standalone: true,
})
export class TagsRenderPipe implements PipeTransform {
  transform(tags: string[] | null | undefined): ITagBadge[] {
    if (!tags || tags.length === 0) return [];
    return tags.map((tag) => ({ label: tag }));
  }
}
