import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient } from '@tanstack/react-query';

const QUEUE_KEY = 'react-query-mutation-queue-v1';
const MAX_ATTEMPTS = 5;

export type QueuedMutation = {
  id: string;
  handler: string;
  args: any;
  attempts: number;
  createdAt: number;
};

type HandlerFn = (args: any) => Promise<any>;
const handlers: Record<string, HandlerFn> = {};

export function registerMutationHandler(name: string, fn: HandlerFn) {
  handlers[name] = fn;
}

async function loadQueue(): Promise<QueuedMutation[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}
async function saveQueue(q: QueuedMutation[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}
export async function clearMutationQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export async function enqueueMutation(handler: string, args: any) {
  const q = await loadQueue();
  q.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    handler,
    args,
    attempts: 0,
    createdAt: Date.now(),
  });
  await saveQueue(q);
}

let processing = false;
async function processQueueOnce(queryClient?: QueryClient) {
  if (processing) return;
  processing = true;
  try {
    const net = await NetInfo.fetch();
    if (!net.isConnected) return;

    const q = await loadQueue();
    if (q.length === 0) return;

    const nextQueue: QueuedMutation[] = [];

    for (const item of q) {
      const fn = handlers[item.handler];
      if (!fn) {
        console.warn('No handler registered for queued mutation', item.handler);
        continue;
      }
      try {
        await fn(item.args);
        if (queryClient) {
          // optionally narrow invalidations per handler
          queryClient.invalidateQueries();
        }
      } catch (err) {
        console.warn('Error processing queued mutation:', err);
        item.attempts = (item.attempts ?? 0) + 1;
        if (item.attempts < MAX_ATTEMPTS) {
          // backoff delay before reprocess (handled by leaving in queue)
          nextQueue.push(item);
        } else {
          console.warn('Dropping queued mutation after attempts', item);
        }
      }
    }

    await saveQueue(nextQueue);
  } finally {
    processing = false;
  }
}

let unsubscribe: (() => void) | null = null;
export function startMutationQueue(queryClient?: QueryClient) {
  // attempt immediately
  processQueueOnce(queryClient).catch(e => console.warn(e));
  // process on reconnect
  unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      // slight delay to allow network to stabilize
      setTimeout(
        () => processQueueOnce(queryClient).catch(e => console.warn(e)),
        500,
      );
    }
  });
}
export function stopMutationQueue() {
  if (unsubscribe) unsubscribe();
  unsubscribe = null;
}
