import {
  ref,
  uploadBytes,
  getDownloadURL,
  type StorageReference,
} from "firebase/storage";
import { getFirebaseStorageSafe } from "@/lib/firebase/storage";

/**
 * Returns a StorageReference for a path or null if Storage is uninitialized.
 */
export function getStorageRef(path: string): StorageReference | null {
  const storage = getFirebaseStorageSafe();
  if (!storage) return null;
  return ref(storage, path);
}

/**
 * Uploads a file/blob safely to the specified path.
 * Returns the download URL upon success.
 */
export async function uploadFileToStorage(
  path: string,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: { contentType?: string }
): Promise<string | null> {
  const storageRef = getStorageRef(path);
  if (!storageRef) {
    console.warn("[ResQEarth Storage] Cannot upload: Firebase Storage is not configured.");
    return null;
  }

  const snapshot = await uploadBytes(storageRef, data, metadata);
  return await getDownloadURL(snapshot.ref);
}

/**
 * Gets a file download URL safely.
 */
export async function getFileDownloadUrl(path: string): Promise<string | null> {
  const storageRef = getStorageRef(path);
  if (!storageRef) return null;
  try {
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error(`[ResQEarth Storage] Failed to get download URL for ${path}:`, error);
    return null;
  }
}
