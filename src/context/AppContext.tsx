// /src/context/AppContext.tsx
import type { FormData } from "@/@types/Data";
import { TRANSACTION_TYPE } from "@/@types/TransactionType";
import useLocalStorage from "@/hooks/useLocalStorage";
import { PESAQR_DB } from "@/utils/constants";
import { createContext, useContext, useEffect, useState } from "react";
import colors from "tailwindcss/colors";
import { getDefaultValues, setDefaultValues } from "@/services/defaultValuesService";

// Contact card type (should match the one used in BusinessProfile)
interface QCard {
  name: string;
  title?: string;
  email?: string;
  businessPhone?: string;
  website?: string;
  comment?: string;
  address?: string;
  whatsappnumber?: string;
  promo1?: string;
  promo2?: string;
}

// Define the default data structure
const defaultData: FormData = {
  paybillNumber: "",
  accountNumber: "",
  tillNumber: "",
  agentNumber: "",
  storeNumber: "",
  phoneNumber: "",

  // BusinessProfile fields
  businessName: "",
  businessTitle: "",
  businessEmail: "",
  businessPhone: "",
  businessWebsite: "",
  businessComment: "",
  businessAddress: "",
  businessWhatsapp: "",
  businessPromo1: "",
  businessPromo2: "",

  color: colors.green[600],
  hideAmount: false,
  type: TRANSACTION_TYPE.SEND_MONEY,
  bannerText: "SCAN WITH M-PESA APP",
};

export interface AppContextType {
  data: FormData;
  setData: (data: Partial<FormData>) => void;
  contactCard?: QCard;
  setContactCard?: (card: QCard) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, saveDb] = useLocalStorage<FormData>(PESAQR_DB, defaultData);
  const [data, setData] = useState<FormData>({ ...defaultData, ...db });
  const [contactCard, setContactCard] = useState<QCard | undefined>(undefined);
  // const [loading, setLoading] = useState(true);

  const userId = "current_user_id"; // Replace with actual user ID

  // Load Data from DB
  useEffect(() => {
    setData((prev) => ({ ...prev, ...db }));
  }, []);

  // Load data from Firestore on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedValues = await getDefaultValues(userId);
        if (savedValues) {
          setData(prev => ({ ...prev, ...savedValues }));
        }
      } catch (error) {
        console.error("Error loading default values:", error);
      } finally {
        // setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Save Updated Data
  useEffect(() => {
    if (data) {
      saveDb(data);
    }
  }, [data]);

  // Update data function that also saves to Firestore
  const updateData = async (newData: Partial<FormData>) => {
    const updatedData = { ...data, ...newData };
    setData(updatedData);
    
    try {
      await setDefaultValues(userId, {
        paybillNumber: updatedData.paybillNumber ?? "",
        accountNumber: updatedData.accountNumber ?? "",
        tillNumber: updatedData.tillNumber ?? "",
        agentNumber: updatedData.agentNumber ?? "",
        storeNumber: updatedData.storeNumber ?? "",
        phoneNumber: updatedData.phoneNumber ?? "",
        type: updatedData.type ?? TRANSACTION_TYPE.SEND_MONEY,
        color: updatedData.color ?? colors.green[600]
      });

    } catch (error) {
      console.error("Error saving default values:", error);
    }
  };

  // if (loading) {
  //   return <div>Loading...</div>; // Or your loading component
  // }

  return (
    <AppContext.Provider value={{ data, setData: updateData, contactCard, setContactCard }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
