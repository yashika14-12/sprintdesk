import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store';
import { fetchLatestPosts } from '@/services/jsonPlaceholder.service';
import { useToast } from '@/components/ui/useToast';
import { notificationReceived } from './notificationsSlice';

const POLL_INTERVAL_MS = 15_000;
const INITIAL_POST_LIMIT = 5;
const MAX_POST_LIMIT = 20;

/** Polls JSONPlaceholder for "new" posts and turns unseen ones into notifications. Pauses while the tab is hidden. */
export function useNotificationsPolling() {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const items = useSelector((state: RootState) => state.notifications.items);
  const isPanelOpen = useSelector((state: RootState) => state.notifications.isPanelOpen);
  const isPanelOpenRef = useRef(isPanelOpen);
  const seenPostIdsRef = useRef<Set<number>>(new Set());
  const limitRef = useRef(INITIAL_POST_LIMIT);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  useEffect(() => {
    isPanelOpenRef.current = isPanelOpen;
  }, [isPanelOpen]);

  useEffect(() => {
    for (const item of items) {
      if (item.id <= 100) {
        seenPostIdsRef.current.add(item.id);
      }
    }
  }, [items]);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsTabVisible(!document.hidden);
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!isTabVisible) return;

    const intervalId = setInterval(async () => {
      limitRef.current = Math.min(limitRef.current + 1, MAX_POST_LIMIT);

      try {
        const posts = await fetchLatestPosts(limitRef.current);
        const newPosts = posts.filter((post) => !seenPostIdsRef.current.has(post.id));

        for (const post of newPosts) {
          seenPostIdsRef.current.add(post.id);
          dispatch(
            notificationReceived({
              id: post.id,
              title: 'New update',
              message: post.title,
              type: 'task',
              read: false,
              createdAt: new Date().toISOString(),
            }),
          );
        }

        if (newPosts.length > 0 && !isPanelOpenRef.current) {
          showToast(
            newPosts.length === 1 ? 'You have a new notification' : `You have ${newPosts.length} new notifications`,
            'info',
          );
        }
      } catch {
        // A missed poll is not fatal — the next tick will try again.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isTabVisible, dispatch, showToast]);
}
