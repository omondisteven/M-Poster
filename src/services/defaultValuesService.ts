// src/services/defaultValuesService.ts
import { db } from "@/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { TRANSACTION_TYPE } from "@/@types/TransactionType";

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

export const getDefaultValues = async (userId: string): Promise<DefaultValues | null> => {
  try {
    const docRef = doc(db, "userDefaults", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as DefaultValues;
    }
    return null;
  } catch (error) {
    console.error("Error getting default values:", error);
    return null;
  }
};

export const setDefaultValues = async (userId: string, values: DefaultValues): Promise<void> => {
  try {
    await setDoc(doc(db, "userDefaults", userId), values);
  } catch (error) {
    console.error("Error setting default values:", error);
    throw error;
  }
};