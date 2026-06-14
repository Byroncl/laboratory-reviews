// services/reactions.service.spec.ts
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Subject } from 'rxjs';

import { ReactionsService } from './reactions.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { IReactionSummary, IReactionResponse } from '../interfaces';

class MockWebSocketService {
  private reactionAdded$ = new Subject<unknown>();
  readonly reactionAdded = this.reactionAdded$.asObservable();

  emit(event: unknown): void {}

  triggerReactionAdded(data: unknown): void {
    this.reactionAdded$.next(data);
  }
}

const BASE_URL = 'http://localhost:3000/api';

describe('ReactionsService', () => {
  let service: ReactionsService;
  let httpMock: HttpTestingController;
  let mockWsService: MockWebSocketService;

  beforeEach(() => {
    mockWsService = new MockWebSocketService();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReactionsService,
        { provide: WebSocketService, useValue: mockWsService },
      ],
    });

    service = TestBed.inject(ReactionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addReaction()', () => {
    it('should POST to /comments/:id/reactions and return reaction response', fakeAsync(() => {
      const mockResponse: IReactionResponse = {
        statusCode: 201,
        success: true,
        message: 'Reaction added',
        data: { _id: 'r1', commentId: 'c1', emoji: '👍' },
      };

      let result: IReactionResponse | undefined;
      service.addReaction('c1', '👍').subscribe((res) => { result = res; });

      const req = httpMock.expectOne(`${BASE_URL}/comments/c1/reactions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ emoji: '👍' });

      req.flush(mockResponse);
      tick();

      expect(result).toEqual(mockResponse);
    }));

    it('should increment reaction count optimistically via signal', fakeAsync(() => {
      service.addReaction('c1', '👍').subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/comments/c1/reactions`);
      req.flush({ statusCode: 201, success: true, message: 'ok', data: {} });
      tick();

      const summary = service.reactionSummary('c1')();
      const thumbsUp = summary.find((r) => r.emoji === '👍');
      expect(thumbsUp).toBeTruthy();
      expect(thumbsUp!.count).toBe(1);
    }));

    it('should handle HTTP error gracefully', fakeAsync(() => {
      let errorThrown = false;
      service.addReaction('c1', '👍').subscribe({ error: () => { errorThrown = true; } });

      const req = httpMock.expectOne(`${BASE_URL}/comments/c1/reactions`);
      req.flush('Error', { status: 400, statusText: 'Bad Request' });
      tick();

      expect(errorThrown).toBeTrue();
    }));
  });

  describe('removeReaction()', () => {
    it('should DELETE to /comments/:id/reactions/:emoji', fakeAsync(() => {
      let completed = false;
      service.removeReaction('c1', '👍').subscribe({ complete: () => { completed = true; } });

      const req = httpMock.expectOne((r) => r.method === 'DELETE' && r.url.includes('/comments/c1/reactions'));
      expect(req.request.method).toBe('DELETE');

      req.flush(null, { status: 200, statusText: 'OK' });
      tick();

      expect(completed).toBeTrue();
    }));

    it('should decrement reaction count via signal after removal', fakeAsync(() => {
      // Setup initial state with a reaction
      service.setLocalReactions('c1', [{ emoji: '👍', count: 2 }]);

      service.removeReaction('c1', '👍').subscribe();
      const req = httpMock.expectOne((r) => r.method === 'DELETE' && r.url.includes('/comments/c1/reactions'));
      req.flush(null, { status: 200, statusText: 'OK' });
      tick();

      const summary = service.reactionSummary('c1')();
      const thumbsUp = summary.find((r) => r.emoji === '👍');
      expect(thumbsUp?.count ?? 0).toBe(1);
    }));
  });

  describe('getReactions()', () => {
    it('should GET /comments/:id/reactions and return summary array', fakeAsync(() => {
      const mockSummary: IReactionSummary[] = [
        { emoji: '👍', count: 3 },
        { emoji: '❤️', count: 1 },
      ];

      let result: IReactionSummary[] | undefined;
      service.getReactions('c1').subscribe((res) => { result = res; });

      const req = httpMock.expectOne(`${BASE_URL}/comments/c1/reactions`);
      expect(req.request.method).toBe('GET');

      req.flush(mockSummary);
      tick();

      expect(result).toEqual(mockSummary);
    }));

    it('should update local reactions signal after GET', fakeAsync(() => {
      const mockSummary: IReactionSummary[] = [{ emoji: '🔥', count: 5 }];

      service.getReactions('c1').subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/comments/c1/reactions`);
      req.flush(mockSummary);
      tick();

      const summary = service.reactionSummary('c1')();
      expect(summary).toEqual(mockSummary);
    }));
  });

  describe('WebSocket integration', () => {
    it('should update signal when reactionAdded WS event is received — no HTTP call', fakeAsync(() => {
      // Set initial state
      service.setLocalReactions('c1', [{ emoji: '👍', count: 1 }]);

      // Emit WS event
      mockWsService.triggerReactionAdded({ commentId: 'c1', emoji: '👍' });
      tick();

      // No HTTP requests should be made
      httpMock.expectNone(`${BASE_URL}/comments/c1/reactions`);

      // Signal should be updated
      const summary = service.reactionSummary('c1')();
      const thumbsUp = summary.find((r) => r.emoji === '👍');
      expect(thumbsUp!.count).toBe(2);
    }));

    it('should add new emoji entry via WS event if emoji was not present', fakeAsync(() => {
      service.setLocalReactions('c1', []);

      mockWsService.triggerReactionAdded({ commentId: 'c1', emoji: '❤️' });
      tick();

      const summary = service.reactionSummary('c1')();
      const heart = summary.find((r) => r.emoji === '❤️');
      expect(heart).toBeTruthy();
      expect(heart!.count).toBe(1);
    }));

    it('should ignore WS events with missing commentId or emoji', fakeAsync(() => {
      service.setLocalReactions('c1', [{ emoji: '👍', count: 1 }]);

      mockWsService.triggerReactionAdded({ commentId: '', emoji: '👍' });
      tick();

      const summary = service.reactionSummary('c1')();
      const thumbsUp = summary.find((r) => r.emoji === '👍');
      expect(thumbsUp!.count).toBe(1); // unchanged
    }));
  });
});
