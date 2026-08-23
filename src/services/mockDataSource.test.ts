import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetMockDataCache, getMockData } from './mockDataSource';

const sampleData = {
  users: [],
  sprints: [],
  tasks: [],
  comments: [],
  notifications: [],
};

describe('mockDataSource', () => {
  beforeEach(() => {
    __resetMockDataCache();
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleData),
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('fetches /mock-data.json and returns the parsed data', async () => {
    const promise = getMockData();
    await vi.runAllTimersAsync();
    const data = await promise;
    expect(data).toEqual(sampleData);
    expect(fetch).toHaveBeenCalledWith('/mock-data.json');
  });

  it('caches the result so a second call does not refetch', async () => {
    const first = getMockData();
    await vi.runAllTimersAsync();
    await first;
    await getMockData();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    const promise = getMockData().catch((error: Error) => error);
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe('Failed to load mock data: 500');
  });
});
