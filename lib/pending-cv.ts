/**
 * A CV chosen during sign-up can't be uploaded yet: the account has no profile until the
 * person verifies their email and signs in. The file is kept in this browser's IndexedDB
 * and uploaded on that first sign-in (see contexts/profile-context.tsx).
 */
const DB_NAME = "prozlab"
const STORE = "pending-cv"
const KEY = "cv"

type PendingCv = { email: string; name: string; type: string; blob: Blob; savedAt: string }

const normalizeEmail = (email: string) => email.trim().toLowerCase()

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"))
      return
    }
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const request = run(tx.objectStore(STORE))
      request.onsuccess = () => resolve(request.result as T)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

export async function savePendingCv(email: string, file: File): Promise<void> {
  try {
    const record: PendingCv = {
      email: normalizeEmail(email),
      name: file.name,
      type: file.type,
      blob: file,
      savedAt: new Date().toISOString(),
    }
    await withStore("readwrite", (store) => store.put(record, KEY))
  } catch {
    // Storage unavailable: the professional can add the CV from the dashboard instead.
  }
}

/** The CV saved for this email, if any. Clear it only after the upload succeeds. */
export async function peekPendingCv(email: string): Promise<File | null> {
  try {
    const record = await withStore<PendingCv | undefined>("readonly", (store) => store.get(KEY))
    if (!record || record.email !== normalizeEmail(email)) return null
    return new File([record.blob], record.name, { type: record.type || "application/octet-stream" })
  } catch {
    return null
  }
}

export async function clearPendingCv(): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.delete(KEY))
  } catch {
    // Nothing to clear.
  }
}
