// components/reaction-bar/reaction-bar.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ReactionBarComponent } from './reaction-bar.component';
import { ReactionsService } from '../../services/reactions.service';
import { IReactionSummary, IReactionResponse } from '../../interfaces';

class MockReactionsService {
  private summary = signal<IReactionSummary[]>([]);

  reactionSummary = jasmine.createSpy('reactionSummary').and.callFake((commentId: string) => {
    return computed(() => this.summary());
  });

  getReactions = jasmine.createSpy('getReactions').and.returnValue(
    of([{ emoji: '👍', count: 2 }] as IReactionSummary[]),
  );

  addReaction = jasmine.createSpy('addReaction').and.returnValue(
    of({
      statusCode: 201,
      success: true,
      message: 'Reaction added',
      data: { _id: 'r1', commentId: 'c1', emoji: '👍' },
    } as IReactionResponse),
  );

  removeReaction = jasmine.createSpy('removeReaction').and.returnValue(
    of(undefined),
  );

  setLocalReactions = jasmine.createSpy('setLocalReactions');
}

describe('ReactionBarComponent', () => {
  let component: ReactionBarComponent;
  let fixture: ComponentFixture<ReactionBarComponent>;
  let reactionsService: MockReactionsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactionBarComponent],
      providers: [{ provide: ReactionsService, useClass: MockReactionsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReactionBarComponent);
    component = fixture.componentInstance;
    component.commentId = 'c1';
    reactionsService = TestBed.inject(ReactionsService) as unknown as MockReactionsService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getReactions on init with commentId', () => {
    expect(reactionsService.getReactions).toHaveBeenCalledWith('c1');
  });

  it('should update summary signal with loaded reactions', fakeAsync(() => {
    tick();
    const summary = component.summary();
    expect(summary.length).toBeGreaterThan(0);
    const thumbsUp = summary.find((r) => r.emoji === '👍');
    expect(thumbsUp).toBeTruthy();
    expect(thumbsUp!.count).toBe(2);
  }));

  it('getCount() should return 0 for unknown emoji', () => {
    expect(component.getCount('🔥')).toBe(0);
  });

  it('getCount() should return count for existing emoji after reactions load', fakeAsync(() => {
    tick();
    expect(component.getCount('👍')).toBe(2);
  }));

  it('hasReacted() should return false initially for any emoji', () => {
    expect(component.hasReacted('👍')).toBeFalse();
  });

  describe('toggleReaction() — add', () => {
    it('should call addReaction when user has not yet reacted', () => {
      component.toggleReaction('👍');
      expect(reactionsService.addReaction).toHaveBeenCalledWith('c1', '👍');
    });

    it('should increment count optimistically when adding', () => {
      component.summary.set([{ emoji: '👍', count: 2 }]);
      component.toggleReaction('👍');

      const count = component.getCount('👍');
      expect(count).toBe(3);
    });

    it('should mark emoji as reacted optimistically', () => {
      component.toggleReaction('👍');
      expect(component.hasReacted('👍')).toBeTrue();
    });
  });

  describe('toggleReaction() — remove', () => {
    it('should call removeReaction when user has already reacted', () => {
      // Simulate previous reaction
      component.reactedEmojis.set(new Set(['👍']));
      component.summary.set([{ emoji: '👍', count: 2 }]);

      component.toggleReaction('👍');
      expect(reactionsService.removeReaction).toHaveBeenCalledWith('c1', '👍');
    });

    it('should decrement count optimistically when removing', () => {
      component.reactedEmojis.set(new Set(['👍']));
      component.summary.set([{ emoji: '👍', count: 2 }]);

      component.toggleReaction('👍');

      expect(component.getCount('👍')).toBe(1);
    });

    it('should remove emoji from reacted set after toggle off', () => {
      component.reactedEmojis.set(new Set(['👍']));
      component.summary.set([{ emoji: '👍', count: 2 }]);

      component.toggleReaction('👍');

      expect(component.hasReacted('👍')).toBeFalse();
    });
  });

  describe('error rollback', () => {
    it('should rollback count and reacted state when addReaction fails', fakeAsync(() => {
      (reactionsService.addReaction as jasmine.Spy).and.returnValue(
        throwError(() => new Error('Network error')),
      );

      component.summary.set([{ emoji: '👍', count: 2 }]);
      component.toggleReaction('👍');
      tick();

      // Should have rolled back
      expect(component.getCount('👍')).toBe(2);
      expect(component.hasReacted('👍')).toBeFalse();
    }));

    it('should rollback count and reacted state when removeReaction fails', fakeAsync(() => {
      (reactionsService.removeReaction as jasmine.Spy).and.returnValue(
        throwError(() => new Error('Network error')),
      );

      component.reactedEmojis.set(new Set(['👍']));
      component.summary.set([{ emoji: '👍', count: 2 }]);

      component.toggleReaction('👍');
      tick();

      // Should have rolled back
      expect(component.getCount('👍')).toBe(2);
      expect(component.hasReacted('👍')).toBeTrue();
    }));
  });
});
