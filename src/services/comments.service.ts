import type { Comment } from '@/types/comment';
import * as commentsStore from './commentsStore';

const SIMULATED_LATENCY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCommentsForTask(taskId: number): Promise<Comment[]> {
  await delay(SIMULATED_LATENCY_MS);
  const comments = await commentsStore.getComments();
  return comments.filter((comment) => comment.taskId === taskId);
}

export async function addComment(taskId: number, authorId: number, message: string): Promise<Comment> {
  await delay(SIMULATED_LATENCY_MS);
  return commentsStore.addComment(taskId, authorId, message);
}
