import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type WithFieldValue,
} from "firebase/firestore";
import {
  getFirebaseFirestoreSafe,
  FIRESTORE_COLLECTIONS,
  FIRESTORE_SUBCOLLECTIONS,
} from "@/lib/firebase/firestore";
import type {
  UserProfile,
  UserPreferences,
  NotificationTokenRecord,
  DisasterEventDoc,
  AlertDoc,
  SmsDeliveryLogDoc,
  AuditLogDoc,
  ServiceStatusDoc,
} from "@/types";

/**
 * Generic Firestore Data Converter helper for typed documents.
 */
export function createFirestoreConverter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: WithFieldValue<T>): DocumentData {
      return modelObject as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
      const data = snapshot.data(options);
      return {
        id: snapshot.id,
        ...data,
      } as unknown as T;
    },
  };
}

// Converters for canonical models
export const userProfileConverter = createFirestoreConverter<UserProfile>();
export const userPreferencesConverter = createFirestoreConverter<UserPreferences>();
export const notificationTokenConverter = createFirestoreConverter<NotificationTokenRecord>();
export const disasterEventConverter = createFirestoreConverter<DisasterEventDoc>();
export const alertConverter = createFirestoreConverter<AlertDoc>();
export const smsDeliveryLogConverter = createFirestoreConverter<SmsDeliveryLogDoc>();
export const auditLogConverter = createFirestoreConverter<AuditLogDoc>();
export const serviceStatusConverter = createFirestoreConverter<ServiceStatusDoc>();

/**
 * Returns a typed CollectionReference for `users` or null if Firestore is uninitialized.
 */
export function getUsersCollection(): CollectionReference<UserProfile> | null {
  const db = getFirebaseFirestoreSafe();
  if (!db) return null;
  return collection(db, FIRESTORE_COLLECTIONS.USERS).withConverter(userProfileConverter);
}

/**
 * Returns a typed DocumentReference for `users/{uid}` or null if uninitialized.
 */
export function getUserDocRef(uid: string): DocumentReference<UserProfile> | null {
  const db = getFirebaseFirestoreSafe();
  if (!db) return null;
  return doc(db, FIRESTORE_COLLECTIONS.USERS, uid).withConverter(userProfileConverter);
}

/**
 * Returns a typed DocumentReference for `users/{uid}/preferences/default` or null.
 */
export function getUserPreferencesDocRef(uid: string): DocumentReference<UserPreferences> | null {
  const db = getFirebaseFirestoreSafe();
  if (!db) return null;
  return doc(
    db,
    FIRESTORE_COLLECTIONS.USERS,
    uid,
    FIRESTORE_SUBCOLLECTIONS.PREFERENCES,
    "default"
  ).withConverter(userPreferencesConverter);
}

/**
 * Returns a typed CollectionReference for `disasterEvents` or null.
 */
export function getDisasterEventsCollection(): CollectionReference<DisasterEventDoc> | null {
  const db = getFirebaseFirestoreSafe();
  if (!db) return null;
  return collection(db, FIRESTORE_COLLECTIONS.DISASTER_EVENTS).withConverter(disasterEventConverter);
}

/**
 * Returns a typed CollectionReference for `alerts` or null.
 */
export function getAlertsCollection(): CollectionReference<AlertDoc> | null {
  const db = getFirebaseFirestoreSafe();
  if (!db) return null;
  return collection(db, FIRESTORE_COLLECTIONS.ALERTS).withConverter(alertConverter);
}

/**
 * Returns a typed CollectionReference for `smsDeliveryLogs` or null.
 */
export function getSmsDeliveryLogsCollection(): CollectionReference<SmsDeliveryLogDoc> | null {
  const db = getFirebaseFirestoreSafe();
  if (!db) return null;
  return collection(db, FIRESTORE_COLLECTIONS.SMS_DELIVERY_LOGS).withConverter(smsDeliveryLogConverter);
}

/**
 * Returns a typed CollectionReference for `auditLogs` or null.
 */
export function getAuditLogsCollection(): CollectionReference<AuditLogDoc> | null {
  const db = getFirebaseFirestoreSafe();
  if (!db) return null;
  return collection(db, FIRESTORE_COLLECTIONS.AUDIT_LOGS).withConverter(auditLogConverter);
}

/**
 * Returns a typed CollectionReference for `serviceStatus` or null.
 */
export function getServiceStatusCollection(): CollectionReference<ServiceStatusDoc> | null {
  const db = getFirebaseFirestoreSafe();
  if (!db) return null;
  return collection(db, FIRESTORE_COLLECTIONS.SERVICE_STATUS).withConverter(serviceStatusConverter);
}
