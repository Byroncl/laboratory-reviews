import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  standalone: true,
  imports: [ClickOutsideDirective],
  template: `
    <div id="outside">
      <div id="host" appClickOutside (clickOutside)="onClickOutside()">
        <span id="inner">inner content</span>
      </div>
    </div>
  `,
})
class TestHostComponent {
  clickedOutside = false;
  onClickOutside(): void {
    this.clickedOutside = true;
  }
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not emit clickOutside when clicking inside the host element', () => {
    const innerEl = fixture.nativeElement.querySelector('#inner') as HTMLElement;
    innerEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(host.clickedOutside).toBeFalse();
  });

  it('should not emit clickOutside when clicking on the host element itself', () => {
    const hostEl = fixture.nativeElement.querySelector('#host') as HTMLElement;
    hostEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(host.clickedOutside).toBeFalse();
  });

  it('should emit clickOutside when clicking outside the host element', () => {
    const outsideEl = fixture.nativeElement.querySelector('#outside') as HTMLElement;
    outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(host.clickedOutside).toBeTrue();
  });

  it('should emit clickOutside when clicking on the document body', () => {
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(host.clickedOutside).toBeTrue();
  });
});
