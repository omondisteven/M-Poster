import type { FormData } from "@/@types/Data";
import { TRANSACTION_TYPE } from "@/@types/TransactionType";
import useLocalStorage from "@/hooks/useLocalStorage";
import { PESAQR_DB } from "@/utils/constants";
import { createContext, useContext, useEffect, useState } from "react";
import colors from "tailwindcss/colors";

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

  // Load Data from DB
  useEffect(() => {
    setData((prev) => ({ ...prev, ...db }));
  }, []);

  // Save Updated Data
  useEffect(() => {
    if (data) {
      saveDb(data);
    }
  }, [data]);

  // Update data function to allow partial updates
  const updateData = (newData: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

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
