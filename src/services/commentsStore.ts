import { getMockData } from './mockDataSource';
import type { Comment } from '@/types/comment';

const STORAGE_KEY = 'sprintdesk:comments';

let cachedComments: Promise<Comment[]> | null = null;

function readPersisted(): Comment[] | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Comment[];
  } catch {
    return null;
  }
}

function persist(comments: Comment[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

async function loadComments(): Promise<Comment[]> {
  const persisted = readPersisted();
  if (persisted) return persisted;

  const data = await getMockData();
  persist(data.comments);
  return data.comments;
}

function getCommentsInternal(): Promise<Comment[]> {
  if (!cachedComments) {
    cachedComments = loadComments();
  }
  return cachedComments;
}

export async function getComments(): Promise<Comment[]> {
  return getCommentsInternal();
}

export async function addComment(taskId: number, authorId: number, message: string): Promise<Comment> {
  const comments = await getCommentsInternal();
  const newComment: Comment = {
    id: comments.reduce((max, comment) => Math.max(max, comment.id), 0) + 1,
    taskId,
    authorId,
    message,
    createdAt: new Date().toISOString(),
  };

  const updated = [...comments, newComment];
  cachedComments = Promise.resolve(updated);
  persist(updated);
  return newComment;
}

export function __resetCommentsStore(): void {
  cachedComments = null;
  window.localStorage.removeItem(STORAGE_KEY);
}
