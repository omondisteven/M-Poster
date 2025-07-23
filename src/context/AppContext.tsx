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
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  contactCard?: QCard;
  setContactCard?: (card: QCard) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

// Helper function to detect mobile devices
const isMobileDevice = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, saveDb] = useLocalStorage<FormData>(PESAQR_DB, defaultData);
  const [data, setData] = useState<FormData>({ ...defaultData, ...db });
  const [contactCard, setContactCard] = useState<QCard | undefined>(undefined);

  const userId = "current_user_id"; // Replace with actual user ID

  // Dark mode state with mobile detection
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Default to dark mode on mobile
    if (isMobileDevice()) return true;
    
    // Check localStorage for saved preference
    const savedPreference = localStorage.getItem("darkMode");
    if (savedPreference !== null) {
      return savedPreference === "true";
    }
    
    // Fallback to system preference for desktop
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply dark/light theme globally
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
    
    // Only save to localStorage if not on mobile (since mobile defaults to dark)
    if (!isMobileDevice()) {
      localStorage.setItem("darkMode", darkMode.toString());
    }
  }, [darkMode]);

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
          setData((prev) => ({ ...prev, ...savedValues }));
        }
      } catch (error) {
        console.error("Error loading default values:", error);
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
        color: updatedData.color ?? colors.green[600],
      });
    } catch (error) {
      console.error("Error saving default values:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{ 
        data, 
        setData: updateData, 
        darkMode, 
        setDarkMode, 
        contactCard, 
        setContactCard 
      }}
    >
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