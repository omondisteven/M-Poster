// src/services/defaultValuesService.ts
import { db } from "@/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { TRANSACTION_TYPE } from "@/@types/TransactionType";
import { enableIndexedDbPersistence } from "firebase/firestore";

// Enable Firestore offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.log('Offline persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.log('The current browser does not support offline persistence.');
  }
});

interface DefaultValues {
  paybillNumber: string;
  accountNumber: string;
  tillNumber: string;
  agentNumber: string;
  storeNumber: string;
  phoneNumber: string;
  type: TRANSACTION_TYPE;
  color: string;
}

// Local storage keys
const LOCAL_CACHE_PREFIX = 'cached_userDefaults_';
const PENDING_WRITES_KEY = 'pending_userDefaults_writes';

export const getDefaultValues = async (userId: string): Promise<DefaultValues | null> => {
  try {
    const docRef = doc(db, "userDefaults", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as DefaultValues;
      // Update local cache with fresh data
      localStorage.setItem(`${LOCAL_CACHE_PREFIX}${userId}`, JSON.stringify(data));
      return data;
    }
    
    // Check local cache if offline or if Firestore doesn't have data
    const cachedData = localStorage.getItem(`${LOCAL_CACHE_PREFIX}${userId}`);
    if (cachedData) {
      return JSON.parse(cachedData) as DefaultValues;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting default values:", error);
    
    // Fallback to local cache if there's an error (e.g., offline)
    const cachedData = localStorage.getItem(`${LOCAL_CACHE_PREFIX}${userId}`);
    if (cachedData) {
      return JSON.parse(cachedData) as DefaultValues;
    }
    
    return null;
  }
};

export const setDefaultValues = async (userId: string, values: Partial<DefaultValues>): Promise<void> => {
  try {
    // First update local cache for immediate UI consistency
    const currentData = await getDefaultValues(userId) || {};
    const mergedData = { ...currentData, ...values };
    localStorage.setItem(`${LOCAL_CACHE_PREFIX}${userId}`, JSON.stringify(mergedData));
    
    // Then try to update Firestore
    await setDoc(doc(db, "userDefaults", userId), values, { merge: true });
    
    // If successful, check if there were pending writes for this user
    await processPendingWrites(userId);
  } catch (error) {
    console.error("Error setting default values:", error);
    
    // If offline, queue the operation for when connection is restored
    if (!navigator.onLine) {
      const pendingWrites = JSON.parse(localStorage.getItem(PENDING_WRITES_KEY) || '[]');
      pendingWrites.push({
        userId,
        values,
        timestamp: Date.now()
      });
      localStorage.setItem(PENDING_WRITES_KEY, JSON.stringify(pendingWrites));
    }
    
    // Still update local cache even if Firestore fails
    const currentData = await getDefaultValues(userId) || {};
    const mergedData = { ...currentData, ...values };
    localStorage.setItem(`${LOCAL_CACHE_PREFIX}${userId}`, JSON.stringify(mergedData));
  }
};

// Process any pending writes when back online
const processPendingWrites = async (userId?: string): Promise<void> => {
  if (!navigator.onLine) return;
  
  const pendingWrites = JSON.parse(localStorage.getItem(PENDING_WRITES_KEY) || '[]');
  if (pendingWrites.length === 0) return;
  
  try {
    // Process all writes or just for a specific user if userId is provided
    const writesToProcess = userId 
      ? pendingWrites.filter((write: any) => write.userId === userId)
      : pendingWrites;
    
    for (const write of writesToProcess) {
      await setDoc(doc(db, "userDefaults", write.userId), write.values, { merge: true });
    }
    
    // Update pending writes list
    const remainingWrites = pendingWrites.filter((write: any) => 
      !writesToProcess.some((processed: any) => 
        processed.userId === write.userId && processed.timestamp === write.timestamp
      )
    );
    
    localStorage.setItem(PENDING_WRITES_KEY, JSON.stringify(remainingWrites));
  } catch (error) {
    console.error("Error processing pending writes:", error);
  }
};

// Listen for online events to process pending writes
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processPendingWrites();
  });
}

// Optional: Initialize sync when the service is imported
processPendingWrites();