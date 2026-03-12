import type { PrayerTimesData } from "@/lib/prayerTimes";

const DB_NAME = "nur_ezan_vakti";
const DB_VERSION = 1;
const PRAYER_TIMES_STORE = "prayer_times";
const NOTIFICATION_LOG_STORE = "notification_log";
const LOCATION_PRECISION = 3;

export interface CachedPrayerTimesRecord extends PrayerTimesData {
  id: string;
  dateKey: string;
  latitude: number;
  longitude: number;
  cachedAt: number;
}

interface NotificationLogRecord {
  id: string;
  sentAt: number;
}

interface SavePrayerCacheInput {
  dateKey: string;
  latitude: number;
  longitude: number;
  data: PrayerTimesData;
}

function normalizeCoordinate(value: number): string {
  return value.toFixed(LOCATION_PRECISION);
}

function createLocationKey(latitude: number, longitude: number): string {
  return `${normalizeCoordinate(latitude)}_${normalizeCoordinate(longitude)}`;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildPrayerCacheId(
  latitude: number,
  longitude: number,
  dateKey: string
): string {
  return `${dateKey}_${createLocationKey(latitude, longitude)}`;
}

async function openPrayerDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") {
    return null;
  }

  return await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(PRAYER_TIMES_STORE)) {
        db.createObjectStore(PRAYER_TIMES_STORE, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(NOTIFICATION_LOG_STORE)) {
        db.createObjectStore(NOTIFICATION_LOG_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePrayerTimesCache({
  dateKey,
  latitude,
  longitude,
  data,
}: SavePrayerCacheInput): Promise<void> {
  const db = await openPrayerDatabase();
  if (!db) return;

  const record: CachedPrayerTimesRecord = {
    ...data,
    id: buildPrayerCacheId(latitude, longitude, dateKey),
    dateKey,
    latitude,
    longitude,
    cachedAt: Date.now(),
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PRAYER_TIMES_STORE, "readwrite");
    tx.objectStore(PRAYER_TIMES_STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}

async function getRecordById(id: string): Promise<CachedPrayerTimesRecord | null> {
  const db = await openPrayerDatabase();
  if (!db) return null;

  const result = await new Promise<CachedPrayerTimesRecord | null>((resolve, reject) => {
    const tx = db.transaction(PRAYER_TIMES_STORE, "readonly");
    const request = tx.objectStore(PRAYER_TIMES_STORE).get(id);
    request.onsuccess = () => resolve((request.result as CachedPrayerTimesRecord) || null);
    request.onerror = () => reject(request.error);
  });

  db.close();
  return result;
}

export async function getPrayerTimesCache(params: {
  dateKey: string;
  latitude: number;
  longitude: number;
}): Promise<PrayerTimesData | null> {
  const id = buildPrayerCacheId(params.latitude, params.longitude, params.dateKey);
  const record = await getRecordById(id);

  if (!record) return null;

  const { id: _id, dateKey: _dateKey, latitude: _latitude, longitude: _longitude, cachedAt: _cachedAt, ...data } = record;
  return data;
}

export async function getAllPrayerTimesCache(): Promise<CachedPrayerTimesRecord[]> {
  const db = await openPrayerDatabase();
  if (!db) return [];

  const result = await new Promise<CachedPrayerTimesRecord[]>((resolve, reject) => {
    const tx = db.transaction(PRAYER_TIMES_STORE, "readonly");
    const request = tx.objectStore(PRAYER_TIMES_STORE).getAll();
    request.onsuccess = () => resolve((request.result as CachedPrayerTimesRecord[]) || []);
    request.onerror = () => reject(request.error);
  });

  db.close();
  return result;
}

export async function getLatestPrayerTimesCache(params: {
  latitude: number;
  longitude: number;
}): Promise<PrayerTimesData | null> {
  const locationKey = createLocationKey(params.latitude, params.longitude);
  const records = await getAllPrayerTimesCache();

  const latest = records
    .filter((record) => createLocationKey(record.latitude, record.longitude) === locationKey)
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))[0];

  if (!latest) return null;

  const { id: _id, dateKey: _dateKey, latitude: _latitude, longitude: _longitude, cachedAt: _cachedAt, ...data } = latest;
  return data;
}

export async function hasPrayerNotificationBeenSent(notificationId: string): Promise<boolean> {
  const db = await openPrayerDatabase();
  if (!db) return false;

  const result = await new Promise<boolean>((resolve, reject) => {
    const tx = db.transaction(NOTIFICATION_LOG_STORE, "readonly");
    const request = tx.objectStore(NOTIFICATION_LOG_STORE).get(notificationId);
    request.onsuccess = () => resolve(Boolean(request.result));
    request.onerror = () => reject(request.error);
  });

  db.close();
  return result;
}

export async function markPrayerNotificationSent(notificationId: string): Promise<void> {
  const db = await openPrayerDatabase();
  if (!db) return;

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(NOTIFICATION_LOG_STORE, "readwrite");
    tx.objectStore(NOTIFICATION_LOG_STORE).put({
      id: notificationId,
      sentAt: Date.now(),
    } satisfies NotificationLogRecord);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}
