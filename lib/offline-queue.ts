import { OFFLINE_DB_NAME, OFFLINE_STORE_NAME, SYNC_ENDPOINT } from "./constants";
import type { ImpressionRecord } from "./types";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OFFLINE_STORE_NAME)) {
        db.createObjectStore(OFFLINE_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueImpression(record: ImpressionRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OFFLINE_STORE_NAME, "readwrite");
    const store = tx.objectStore(OFFLINE_STORE_NAME);
    store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQueuedImpressions(): Promise<ImpressionRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OFFLINE_STORE_NAME, "readonly");
    const store = tx.objectStore(OFFLINE_STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearQueue(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OFFLINE_STORE_NAME, "readwrite");
    const store = tx.objectStore(OFFLINE_STORE_NAME);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function syncQueue(): Promise<{ synced: number; failed: number }> {
  const records = await getQueuedImpressions();
  if (records.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  try {
    const response = await fetch(SYNC_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ impressions: records }),
    });

    if (response.ok) {
      synced = records.length;
      await clearQueue();
    } else {
      failed = records.length;
    }
  } catch {
    failed = records.length;
  }

  return { synced, failed };
}

export function setupOnlineSync(): () => void {
  const handler = () => {
    if (navigator.onLine) {
      syncQueue().catch(console.error);
    }
  };
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
