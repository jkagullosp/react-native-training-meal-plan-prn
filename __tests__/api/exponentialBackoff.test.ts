import { jest as jestGlobal } from '@jest/globals';

type AnyFn = (...args: any[]) => any;

describe('withExponentialBackoff', () => {
  let realRandom: () => number;
  let withExponentialBackoff: (
    fn: () => Promise<any>,
    maxRetries?: number,
    initialDelay?: number,
  ) => Promise<any>;

  beforeEach(() => {
    // Reset module registry so we get the real implementation (jest.setup.js mocks it)
    jest.resetModules();
    jest.unmock('@/api/exponentialBackoff');

    // import the real module after unmocking
     
    withExponentialBackoff = jest.requireActual(
      '@/api/exponentialBackoff',
    ).withExponentialBackoff;

    // preserve Math.random and default to deterministic jitter
    realRandom = Math.random;
    Math.random = () => 0; // no jitter for predictable delays
  });

  afterEach(() => {
    Math.random = realRandom;
    jest.useRealTimers();
  });

  it('resolves immediately when fn succeeds first try', async () => {
    const fn = jest.fn().mockResolvedValue('ok');

    const res = await withExponentialBackoff(fn, 5, 10);
    expect(res).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failures and succeeds eventually', async () => {
    jest.useFakeTimers();

    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('first'))
      .mockRejectedValueOnce(new Error('second'))
      .mockResolvedValue('done');

    // spy on setTimeout to assert delays
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

    const promise = withExponentialBackoff(fn as AnyFn, 5, 10);

    // advance all timers so backoff waits run
    if ((jestGlobal as any).runAllTimersAsync) {
      await (jestGlobal as any).runAllTimersAsync();
    } else {
      jest.runAllTimers();
    }

    await expect(promise).resolves.toBe('done');
    expect(fn).toHaveBeenCalledTimes(3);

    // two retries => two setTimeout calls with delays 10 and 20 (jitter=0)
    expect(setTimeoutSpy).toHaveBeenCalled();
    const delays = setTimeoutSpy.mock.calls
      .map(c => c[1])
      .filter(d => typeof d === 'number');
    expect(delays[0]).toBe(10);
    expect(delays[1]).toBe(20);

    setTimeoutSpy.mockRestore();
  });

  it('throws after exhausting maxRetries', async () => {
    // Use real timers here to avoid fake-timer timing races with unhandled rejections
    const err = new Error('always fail');
    const fn = jest.fn().mockRejectedValue(err);

    await expect(withExponentialBackoff(fn as AnyFn, 3, 5)).rejects.toBe(err);
    // ensure it attempted multiple times (initial + retries)
    expect(fn.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});
