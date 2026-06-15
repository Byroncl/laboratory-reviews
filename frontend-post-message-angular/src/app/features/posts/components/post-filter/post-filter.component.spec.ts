// components/post-filter/post-filter.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PostFilterComponent } from './post-filter.component';
import { IPostFilters } from '../../interfaces';
import { STATUS_FILTER_OPTIONS } from '../../constants';

describe('PostFilterComponent', () => {
  let component: PostFilterComponent;
  let fixture: ComponentFixture<PostFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a valid form with empty initial values', () => {
    expect(component.filterForm).toBeTruthy();
    expect(component.filterForm.get('searchTerm')?.value).toBeFalsy();
    expect(component.filterForm.get('author')?.value).toBeFalsy();
    expect(component.filterForm.get('status')?.value).toBeFalsy();
  });

  it('should emit filterChange when searchTerm changes', fakeAsync(() => {
    const emitted: IPostFilters[] = [];
    component.filterChange.subscribe((f: IPostFilters) => emitted.push(f));

    component.filterForm.get('searchTerm')?.setValue('angular');
    tick();

    expect(emitted.length).toBeGreaterThan(0);
    expect(emitted[emitted.length - 1].searchTerm).toBe('angular');
  }));

  it('should emit filterChange when author changes', fakeAsync(() => {
    const emitted: IPostFilters[] = [];
    component.filterChange.subscribe((f: IPostFilters) => emitted.push(f));

    component.filterForm.get('author')?.setValue('Alice');
    tick();

    expect(emitted.length).toBeGreaterThan(0);
    expect(emitted[emitted.length - 1].author).toBe('Alice');
  }));

  it('should emit filterChange when status changes', fakeAsync(() => {
    const emitted: IPostFilters[] = [];
    component.filterChange.subscribe((f: IPostFilters) => emitted.push(f));

    component.filterForm.get('status')?.setValue('published');
    tick();

    expect(emitted.length).toBeGreaterThan(0);
    expect(emitted[emitted.length - 1].status).toBe('published');
  }));

  it('should emit reset event when onReset is called', () => {
    let resetEmitted = false;
    component.reset.subscribe(() => { resetEmitted = true; });

    component.onReset();

    expect(resetEmitted).toBeTrue();
  });

  it('should reset form values on reset', () => {
    component.filterForm.patchValue({ searchTerm: 'test', author: 'Alice', status: 'draft' });
    component.onReset();

    expect(component.filterForm.get('searchTerm')?.value).toBeNull();
    expect(component.filterForm.get('author')?.value).toBeNull();
    expect(component.filterForm.get('status')?.value).toBeNull();
  });

  it('should have status options matching STATUS_FILTER_OPTIONS', () => {
    expect(component.statusOptions.length).toBe(STATUS_FILTER_OPTIONS.length);
  });

  it('should emit undefined author when author field is empty', fakeAsync(() => {
    const emitted: IPostFilters[] = [];
    component.filterChange.subscribe((f: IPostFilters) => emitted.push(f));

    component.filterForm.get('author')?.setValue('');
    tick();

    expect(emitted[emitted.length - 1].author).toBeUndefined();
  }));
});
