// components/pagination/pagination.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
import { IPagination } from '../../interfaces';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  const makePagination = (skip: number, total: number, limit = 10): IPagination =>
    ({ skip, limit, total });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    component.pagination = makePagination(0, 30);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct current page', () => {
    component.pagination = makePagination(0, 30);
    fixture.detectChanges();
    expect(component.currentPage).toBe(1);
  });

  it('should display correct current page on page 2', () => {
    component.pagination = makePagination(10, 30);
    fixture.detectChanges();
    expect(component.currentPage).toBe(2);
  });

  it('should display correct total pages', () => {
    component.pagination = makePagination(0, 30);
    fixture.detectChanges();
    expect(component.totalPages).toBe(3);
  });

  it('should emit nextPage when next button is clicked', () => {
    component.pagination = makePagination(0, 30);
    fixture.detectChanges();

    let nextEmitted = false;
    component.nextPage.subscribe(() => { nextEmitted = true; });

    const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button:last-of-type');
    nextBtn.click();

    expect(nextEmitted).toBeTrue();
  });

  it('should emit prevPage when prev button is clicked', () => {
    component.pagination = makePagination(10, 30);
    fixture.detectChanges();

    let prevEmitted = false;
    component.prevPage.subscribe(() => { prevEmitted = true; });

    const prevBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button:first-of-type');
    prevBtn.click();

    expect(prevEmitted).toBeTrue();
  });

  it('should disable next button on last page', () => {
    component.pagination = makePagination(20, 25);
    fixture.detectChanges();

    const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button:last-of-type');
    expect(nextBtn.disabled).toBeTrue();
  });

  it('should disable prev button on first page', () => {
    component.pagination = makePagination(0, 30);
    fixture.detectChanges();

    const prevBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button:first-of-type');
    expect(prevBtn.disabled).toBeTrue();
  });

  it('should not emit nextPage when canGoNext is false', () => {
    component.pagination = makePagination(20, 25);
    fixture.detectChanges();

    let nextEmitted = false;
    component.nextPage.subscribe(() => { nextEmitted = true; });

    component.onNextPage();

    expect(nextEmitted).toBeFalse();
  });

  it('should not emit prevPage when canGoPrev is false', () => {
    component.pagination = makePagination(0, 30);
    fixture.detectChanges();

    let prevEmitted = false;
    component.prevPage.subscribe(() => { prevEmitted = true; });

    component.onPrevPage();

    expect(prevEmitted).toBeFalse();
  });

  it('canGoNext should be true when not on last page', () => {
    component.pagination = makePagination(0, 30);
    expect(component.canGoNext).toBeTrue();
  });

  it('canGoPrev should be true when not on first page', () => {
    component.pagination = makePagination(10, 30);
    expect(component.canGoPrev).toBeTrue();
  });
});
