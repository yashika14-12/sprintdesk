import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mockDataSource from './mockDataSource';
import type { MockData } from './mockDataSource';
import { __resetCommentsStore, addComment, getComments } from './commentsStore';
import type { Comment } from '@/types/comment';

const sampleComments: Comment[] = [
  { id: 1, taskId: 2, authorId: 1, message: 'First comment', createdAt: '2026-08-01T00:00:00Z' },
];

function stubMockData(comments: Comment[]) {
  const data: MockData = { users: [], sprints: [], tasks: [], comments, notifications: [] };
  vi.spyOn(mockDataSource, 'getMockData').mockResolvedValue(data);
}

describe('commentsStore', () => {
  beforeEach(() => {
    __resetCommentsStore();
    stubMockData(sampleComments);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('seeds from mockDataSource on first read', async () => {
    const comments = await getComments();
    expect(comments).toEqual(sampleComments);
  });

  it('addComment assigns the next sequential id and appends the comment', async () => {
    const created = await addComment(2, 3, 'A new comment');

    expect(created.id).toBe(2);
    expect(created.taskId).toBe(2);
    expect(created.authorId).toBe(3);
    expect(created.message).toBe('A new comment');

    const comments = await getComments();
    expect(comments).toHaveLength(2);
  });

  it('persists new comments to localStorage', async () => {
    await addComment(2, 3, 'A new comment');
    const stored = JSON.parse(window.localStorage.getItem('sprintdesk:comments') ?? '[]') as Comment[];
    expect(stored).toHaveLength(2);
    expect(stored[1].message).toBe('A new comment');
  });
});
