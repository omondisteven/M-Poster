//src/components/PosterPage.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import templates from "@/data/templates.json";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRoot } from 'react-dom/client';
import QrSvg from "@wojtekmaj/react-qr-svg";
import { generateQRCode } from "@/utils/helpers";
import { useAppContext } from "@/context/AppContext";
import { TRANSACTION_TYPE } from "@/@types/TransactionType";
import { HiOutlineDownload, HiOutlineShare } from "react-icons/hi";
import { AsYouType } from 'libphonenumber-js';
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

// Define zod schema for validation
const formSchema = z.object({
  type: z.nativeEnum(TRANSACTION_TYPE),
  selectedColor: z.string(),
  showName: z.boolean(),
  title: z.string().min(1, "Title cannot be empty"),
  phoneNumber: z.string().refine((value) => {
    // Allow empty string (optional)
    if (!value) return true;
    
    // Remove all characters except digits, + and spaces
    const cleaned = value.replace(/[^\d+ ]/g, '');
    
    // Must contain only numbers, spaces and optional leading +
    const isValidFormat = /^\+?[\d ]+$/.test(cleaned);
    
    // Must have at least 10 digits (excluding + and spaces)
    const digitCount = cleaned.replace(/[^0-9]/g, '').length;
    const hasMinDigits = digitCount >= 10;
    
    return isValidFormat && hasMinDigits;
  }, {
    message: "Invalid phone number format"
  }).optional().or(z.literal('')),
  businessName: z.string().optional().or(z.literal('')),
  paybillNumber: z.string().optional().or(z.literal('')),
  paybillNumberLabel: z.string().optional(),
  accountNumber: z.string().optional().or(z.literal('')),
  accountNumberLabel: z.string().optional(),
  tillNumber: z.string().optional().or(z.literal('')),
  tillNumberLabel: z.string().optional(),
  agentNumber: z.string().optional().or(z.literal('')),
  agentNumberLabel: z.string().optional(),
  storeNumber: z.string().optional().or(z.literal('')),
  storeNumberLabel: z.string().optional(), 
})
  .superRefine((data, ctx) => {
    // Name is only required when showName is true
    if (data.showName && !data.businessName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Business name is required",
        path: ["businessName"],
      });
    }

    // Validate based on transaction type
    // switch (data.type) {
    //   case TRANSACTION_TYPE.SEND_MONEY:
    //     if (!data.phoneNumber) {
    //       ctx.addIssue({
    //         code: z.ZodIssueCode.custom,
    //         message: "Phone number is required",
    //         path: ["phoneNumber"],
    //       });
    //     }
    //     break;

    //   case TRANSACTION_TYPE.PAYBILL:
    //     if (!data.paybillNumber) {
    //       ctx.addIssue({
    //         code: z.ZodIssueCode.custom,
    //         message: "Paybill number is required",
    //         path: ["paybillNumber"],
    //       });
    //     }
    //     if (!data.accountNumber) {
    //       ctx.addIssue({
    //         code: z.ZodIssueCode.custom,
    //         message: "Account number is required",
    //         path: ["accountNumber"],
    //       });
    //     }
    //     break;

    //   case TRANSACTION_TYPE.TILL_NUMBER:
    //     if (!data.tillNumber) {
    //       ctx.addIssue({
    //         code: z.ZodIssueCode.custom,
    //         message: "Till number is required",
    //         path: ["tillNumber"],
    //       });
    //     }
    //     break;

    //   case TRANSACTION_TYPE.AGENT:
    //     if (!data.agentNumber) {
    //       ctx.addIssue({
    //         code: z.ZodIssueCode.custom,
    //         message: "Agent number is required",
    //         path: ["agentNumber"],
    //       });
    //     }
    //     if (!data.storeNumber) {
    //       ctx.addIssue({
    //         code: z.ZodIssueCode.custom,
    //         message: "Store number is required",
    //         path: ["storeNumber"],
    //       });
    //     }
    //     break;
    // }
  });

// Define form type
interface FormValues {
  type: TRANSACTION_TYPE;
  selectedColor: string;
  showName: boolean;
  title: string;
  phoneNumber?: string;
  businessName?: string;
  paybillNumber?: string;
  paybillNumberLabel?: string;
  accountNumber?: string;
  accountNumberLabel?: string;
  tillNumber?: string;
  tillNumberLabel?: string;
  agentNumber?: string;
  agentNumberLabel?: string;
  storeNumber?: string;
  storeNumberLabel?: string;
  promo1?: string;
  promo2?: string;
}

export const Route = createFileRoute("/poster/")({
  component: PosterPage,
});

// Utility function for input history
const useInputHistory = (key: string) => {
  const [history, setHistory] = useState<string[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(`inputHistory-${key}`);
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [key]);

  // Add a new entry to history
  const addToHistory = (value: string) => {
    if (!value.trim()) return;
    
    setHistory(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item !== value);
      // Add to beginning
      const newHistory = [value, ...filtered];
      // Keep only last 5 entries
      const truncated = newHistory.slice(0, 5);
      // Save to localStorage
      localStorage.setItem(`inputHistory-${key}`, JSON.stringify(truncated));
      return truncated;
    });
  };

  return { history, addToHistory };
};

function calculateFitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  baseFont: string = "bold",
  fontFamily: string = "Inter"
): number {
  let fontSize = maxHeight;
  while (fontSize > 10) {
    ctx.font = `${baseFont} ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    if (metrics.width <= maxWidth && fontSize <= maxHeight) {
      break;
    }
    fontSize -= 1;
  }
  return fontSize;
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  yTop: number,
  maxWidth: number,
  maxHeight: number,
  color: string,
  baseFont: string = "bold",
  fontFamily: string = "Inter",
  textAlign: CanvasTextAlign = "center"
): void {
  const fontSize = calculateFitFontSize(ctx, text, maxWidth, maxHeight, baseFont, fontFamily);
  ctx.font = `${baseFont} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, yTop + maxHeight / 2); // Center vertically
}

function PosterPage() {
  const isOnline = useNetworkStatus();
  const [qrGenerationMethod, setQrGenerationMethod] = useState<"mpesa" | "push">("push");
  const [previewQrData, setPreviewQrData] = useState("");
  const { data } = useAppContext();
  const posterRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  
  // Offline state management
  const [isWorkingOffline, setIsWorkingOffline] = useState(false);
  // const [offlineData, setOfflineData] = useState<Partial<FormData>>({});
  const [offlineData, setOfflineData] = useState<Partial<FormValues>>({});
  
  const { control, handleSubmit, watch, setValue, formState: { errors, isValid }, trigger } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: TRANSACTION_TYPE.PAYBILL,
      selectedColor: "#16a34a",
      showName: false,
      title: "Pay Bill",
      phoneNumber: data.phoneNumber || "",
      businessName: data.businessName || "",
      paybillNumber: data.paybillNumber || "",
      paybillNumberLabel: "Business Number",
      accountNumber: data.accountNumber || "",
      accountNumberLabel: "Account Number",
      tillNumber: data.tillNumber || "",
      tillNumberLabel: "Till Number",
      agentNumber: data.agentNumber || "",
      agentNumberLabel: "Agent Number",
      storeNumber: data.storeNumber || "",
      storeNumberLabel: "Store Number",
    },
    mode: "onChange",
  });

  // Handle offline state
  useEffect(() => {
    if (!isOnline) {
      setIsWorkingOffline(true);
      // Load any locally cached data for offline use
      const cachedData = localStorage.getItem('offlinePosterData');
      if (cachedData) {
        setOfflineData(JSON.parse(cachedData));
      }
    } else {
      setIsWorkingOffline(false);
    }
  }, [isOnline]);

  // Load default values when type changes
  useEffect(() => {
    const loadDefaultValues = async () => {
      const currentType = watch("type");
      
      // Clear all fields first
      setValue("phoneNumber", "");
      setValue("paybillNumber", "");
      setValue("accountNumber", "");
      setValue("tillNumber", "");
      setValue("agentNumber", "");
      setValue("storeNumber", "");

      // Set values from appropriate source based on online status
      if (isOnline) {
        // Online - use Firestore data
        switch (currentType) {
          case TRANSACTION_TYPE.SEND_MONEY:
            if (data.phoneNumber) setValue("phoneNumber", data.phoneNumber);
            break;
          case TRANSACTION_TYPE.PAYBILL:
            if (data.paybillNumber) setValue("paybillNumber", data.paybillNumber);
            if (data.accountNumber) setValue("accountNumber", data.accountNumber);
            break;
          case TRANSACTION_TYPE.TILL_NUMBER:
            if (data.tillNumber) setValue("tillNumber", data.tillNumber);
            break;
          case TRANSACTION_TYPE.AGENT:
            if (data.agentNumber) setValue("agentNumber", data.agentNumber);
            if (data.storeNumber) setValue("storeNumber", data.storeNumber);
            break;
        }
      } else {
        // Offline - use locally cached data
        switch (currentType) {
          case TRANSACTION_TYPE.SEND_MONEY:
            if (offlineData.phoneNumber) setValue("phoneNumber", offlineData.phoneNumber);
            break;
          case TRANSACTION_TYPE.PAYBILL:
            if (offlineData.paybillNumber) setValue("paybillNumber", offlineData.paybillNumber);
            if (offlineData.accountNumber) setValue("accountNumber", offlineData.accountNumber);
            break;
          case TRANSACTION_TYPE.TILL_NUMBER:
            if (offlineData.tillNumber) setValue("tillNumber", offlineData.tillNumber);
            break;
          case TRANSACTION_TYPE.AGENT:
            if (offlineData.agentNumber) setValue("agentNumber", offlineData.agentNumber);
            if (offlineData.storeNumber) setValue("storeNumber", offlineData.storeNumber);
            break;
        }
      }
    };

    loadDefaultValues();
  }, [watch("type"), data, offlineData, isOnline, setValue]);
  
  // Watch form values
  const phoneNumber = watch("phoneNumber");
  const businessName = watch("businessName");
  const selectedColor = watch("selectedColor");
  const showName = watch("showName");
  const title = watch("title");
  const paybillNumber = watch("paybillNumber");
  const accountNumber = watch("accountNumber");
  const tillNumber = watch("tillNumber");
  const agentNumber = watch("agentNumber");
  const storeNumber = watch("storeNumber");
  const paybillNumberLabel = watch("paybillNumberLabel");
  const accountNumberLabel = watch("accountNumberLabel");
  const tillNumberLabel = watch("tillNumberLabel");
  const agentNumberLabel = watch("agentNumberLabel");
  const storeNumberLabel = watch("storeNumberLabel");

  // Update QR preview data with offline consideration
  useEffect(() => {
    const updatePreviewQr = async () => {
      const formData = {
        type: watch("type"),
        phoneNumber: watch("phoneNumber"),
        paybillNumber: watch("paybillNumber"),
        accountNumber: watch("accountNumber"),
        tillNumber: watch("tillNumber"),
        agentNumber: watch("agentNumber"),
        storeNumber: watch("storeNumber"),
        businessName: watch("businessName"),
        businessTitle: data.businessTitle,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        businessWebsite: data.businessWebsite,
        businessComment: data.businessComment,
        businessAddress: data.businessAddress,
        businessWhatsapp: data.businessWhatsapp,
        businessPromo1: data.businessPromo1,
        businessPromo2: data.businessPromo2,
      };
    
      if (qrGenerationMethod === "mpesa") {
        setPreviewQrData(generateQRCode(formData) || "");
      } else {
        // For offline mode, use a simpler QR code that can be processed locally
        if (!isOnline) {
          const offlineQrData = {
            type: formData.type,
            phoneNumber: formData.phoneNumber,
            paybillNumber: formData.paybillNumber,
            accountNumber: formData.accountNumber,
            tillNumber: formData.tillNumber,
            agentNumber: formData.agentNumber,
            storeNumber: formData.storeNumber,
            businessName: formData.businessName
          };
          setPreviewQrData(JSON.stringify(offlineQrData));
          return;
        }
        
        // Online mode - use the full QR generation
        let qrData = {};
        switch (formData.type) {
          case TRANSACTION_TYPE.SEND_MONEY:
            qrData = {
              TransactionType: "SendMoney",
              RecepientPhoneNumber: formData.phoneNumber,
              PhoneNumber: "254",
              BusinessName: formData.businessName,
              BusinessTitle: formData.businessTitle,
              BusinessEmail: formData.businessEmail,
              BusinessPhone: formData.businessPhone,
              BusinessWebsite: formData.businessWebsite,
              BusinessAddress: formData.businessAddress,
              BusinessWhatsapp: formData.businessWhatsapp,
              BusinessPromo1: formData.businessPromo1,
              BusinessPromo2: formData.businessPromo2,
              BusinessComment: formData.businessComment,
            };
            break;
          case TRANSACTION_TYPE.PAYBILL:
            qrData = {
              TransactionType: "PayBill",
              PaybillNumber: formData.paybillNumber,
              AccountNumber: formData.accountNumber,
              PhoneNumber: "254",
              BusinessName: formData.businessName,
              BusinessTitle: formData.businessTitle,
              BusinessEmail: formData.businessEmail,
              BusinessPhone: formData.businessPhone,
              BusinessWebsite: formData.businessWebsite,
              BusinessAddress: formData.businessAddress,
              BusinessWhatsapp: formData.businessWhatsapp,
              BusinessPromo1: formData.businessPromo1,
              BusinessPromo2: formData.businessPromo2,
              BusinessComment: formData.businessComment,
            };
            break;
          case TRANSACTION_TYPE.TILL_NUMBER:
            qrData = {
              TransactionType: "BuyGoods",
              TillNumber: formData.tillNumber,
              PhoneNumber: "254",
              BusinessName: formData.businessName,
              BusinessTitle: formData.businessTitle,
              BusinessEmail: formData.businessEmail,
              BusinessPhone: formData.businessPhone,
              BusinessWebsite: formData.businessWebsite,
              BusinessAddress: formData.businessAddress,
              BusinessWhatsapp: formData.businessWhatsapp,
              BusinessPromo1: formData.businessPromo1,
              BusinessPromo2: formData.businessPromo2,
              BusinessComment: formData.businessComment,
            };
            break;
          case TRANSACTION_TYPE.AGENT:
            qrData = {
              TransactionType: "WithdrawMoney",
              AgentId: formData.agentNumber,
              StoreNumber: formData.storeNumber,
              PhoneNumber: "254",
              BusinessName: formData.businessName,
              BusinessTitle: formData.businessTitle,
              BusinessEmail: formData.businessEmail,
              BusinessPhone: formData.businessPhone,
              BusinessWebsite: formData.businessWebsite,
              BusinessAddress: formData.businessAddress,
              BusinessWhatsapp: formData.businessWhatsapp,
              BusinessPromo1: formData.businessPromo1,
              BusinessPromo2: formData.businessPromo2,
              BusinessComment: formData.businessComment,
            };
            break;
        }
        
        const jsonString = JSON.stringify(qrData);
        // Double encode the data to ensure special characters are preserved
        const encodedData = encodeURIComponent(encodeURIComponent(jsonString));
        setPreviewQrData(`https://e-biz-stk-prompt-page.vercel.app/?data=${encodedData}`);
      }
    };
    updatePreviewQr();
  }, [qrGenerationMethod, watch(), data, isOnline]);

  const generateDownloadQrData = async (): Promise<string> => {
    const formData = {
      type: watch("type"),
      phoneNumber: watch("phoneNumber"),
      paybillNumber: watch("paybillNumber"),
      accountNumber: watch("accountNumber"),
      tillNumber: watch("tillNumber"),
      agentNumber: watch("agentNumber"),
      storeNumber: watch("storeNumber"),
      businessName: watch("businessName"),
      businessTitle: data.businessTitle,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
      businessWebsite: data.businessWebsite,
      businessComment: data.businessComment,
      businessAddress: data.businessAddress,
      businessWhatsapp: data.businessWhatsapp,
      businessPromo1: data.businessPromo1,
      businessPromo2: data.businessPromo2,
    };

    // In offline mode, return a simplified version of the data
    if (!isOnline) {
      const offlineQrData = {
        type: formData.type,
        phoneNumber: formData.phoneNumber,
        paybillNumber: formData.paybillNumber,
        accountNumber: formData.accountNumber,
        tillNumber: formData.tillNumber,
        agentNumber: formData.agentNumber,
        storeNumber: formData.storeNumber,
        businessName: formData.businessName
      };
      return JSON.stringify(offlineQrData);
    }

    let qrData = {};
    switch (formData.type) {
      case TRANSACTION_TYPE.SEND_MONEY:
        qrData = {
          TransactionType: "SendMoney",
          RecepientPhoneNumber: formData.phoneNumber,
          PhoneNumber: "254",
          BusinessName: formData.businessName,
          BusinessTitle: formData.businessTitle,
          BusinessEmail: formData.businessEmail,
          BusinessPhone: formData.businessPhone,
          BusinessWebsite: formData.businessWebsite,
          BusinessAddress: formData.businessAddress,
          BusinessWhatsapp: formData.businessWhatsapp,
          BusinessPromo1: formData.businessPromo1,
          BusinessPromo2: formData.businessPromo2,
          BusinessComment: formData.businessComment,
        };
        break;
      case TRANSACTION_TYPE.PAYBILL:
        qrData = {
          TransactionType: "PayBill",
          PaybillNumber: formData.paybillNumber,
          AccountNumber: formData.accountNumber,
          PhoneNumber: "254",
          BusinessName: formData.businessName,
          BusinessTitle: formData.businessTitle,
          BusinessEmail: formData.businessEmail,
          BusinessPhone: formData.businessPhone,
          BusinessWebsite: formData.businessWebsite,
          BusinessAddress: formData.businessAddress,
          BusinessWhatsapp: formData.businessWhatsapp,
          BusinessPromo1: formData.businessPromo1,
          BusinessPromo2: formData.businessPromo2,
          BusinessComment: formData.businessComment,
        };
        break;
      case TRANSACTION_TYPE.TILL_NUMBER:
        qrData = {
          TransactionType: "BuyGoods",
          TillNumber: formData.tillNumber,
          PhoneNumber: "254",
          BusinessName: formData.businessName,
          BusinessTitle: formData.businessTitle,
          BusinessEmail: formData.businessEmail,
          BusinessPhone: formData.businessPhone,
          BusinessWebsite: formData.businessWebsite,
          BusinessAddress: formData.businessAddress,
          BusinessWhatsapp: formData.businessWhatsapp,
          BusinessPromo1: formData.businessPromo1,
          BusinessPromo2: formData.businessPromo2,
          BusinessComment: formData.businessComment,
        };
        break;
      case TRANSACTION_TYPE.AGENT:
        qrData = {
          TransactionType: "WithdrawMoney",
          AgentId: formData.agentNumber,
          StoreNumber: formData.storeNumber,
          PhoneNumber: "254",
          BusinessName: formData.businessName,
          BusinessTitle: formData.businessTitle,
          BusinessEmail: formData.businessEmail,
          BusinessPhone: formData.businessPhone,
          BusinessWebsite: formData.businessWebsite,
          BusinessAddress: formData.businessAddress,
          BusinessWhatsapp: formData.businessWhatsapp,
          BusinessPromo1: formData.businessPromo1,
          BusinessPromo2: formData.businessPromo2,
          BusinessComment: formData.businessComment,
        };
        break;
    }

    try {
      // 1. Stringify the data
      const json = JSON.stringify(qrData);
      
      // 2. URI encode to handle special characters
      const uriEncoded = encodeURIComponent(json);
      
      // 3. Convert to Base64 for URL safety
      const base64Encoded = btoa(unescape(uriEncoded));
      
      // 4. Create the URL
      const originalUrl = `https://e-biz-stk-prompt-page.vercel.app/?data=${base64Encoded}`;

      // In offline mode, skip the TinyURL creation
      if (isWorkingOffline) {
        return originalUrl;
      }

      // Create TinyURL
      const response = await fetch(`https://api.tinyurl.com/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer QeiZ8ZP85UdMKoZxaDDo2k8xuquZNXT6vys45A1JImuP4emSxSi2Zz655QDJ',
        },
        body: JSON.stringify({
          url: originalUrl,
          domain: "tiny.one",
        }),
      });

      const result = await response.json();
      return result.data?.tiny_url || originalUrl;
    } catch (error) {
      console.error("Error creating QR data:", error);
      // Fallback to standard QR code generation
      return generateQRCode(formData) || "";
    }
  };

  // Handle download with offline support
  const handleDownload = async () => {
    if (!posterRef.current) return;

    try {
      await document.fonts.ready;
      await document.fonts.load("bold 20px Inter");

      // In offline mode, skip the format selection dialog
      const format = isWorkingOffline ? "png" : await new Promise<"png" | "jpg" | "pdf" | null>((resolve) => {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';

        const dialog = document.createElement('div');
        dialog.style.backgroundColor = 'white';
        dialog.style.padding = '20px';
        dialog.style.borderRadius = '8px';
        dialog.style.width = '300px';

        const label = document.createElement('label');
        label.textContent = 'Select Download Format:';
        label.style.fontWeight = 'bold';
        label.style.display = 'block';
        label.style.marginBottom = '10px';

        const select = document.createElement('select');
        select.style.width = '100%';
        select.style.padding = '8px';
        select.style.borderRadius = '4px';
        select.style.marginBottom = '15px';

        ["png", "jpg", "pdf"].forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt.toUpperCase();
          select.appendChild(option);
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '10px';

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download';
        downloadButton.style.backgroundColor = '#4CAF50';
        downloadButton.style.color = 'white';
        downloadButton.style.padding = '8px 16px';
        downloadButton.style.border = 'none';
        downloadButton.style.borderRadius = '4px';
        downloadButton.style.cursor = 'pointer';

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(downloadButton);
        dialog.appendChild(label);
        dialog.appendChild(select);
        dialog.appendChild(buttonContainer);
        modal.appendChild(dialog);
        document.body.appendChild(modal);

        cancelButton.onclick = () => {
          document.body.removeChild(modal);
          resolve(null);
        };
        downloadButton.onclick = () => {
          document.body.removeChild(modal);
          resolve(select.value as "png" | "jpg" | "pdf");
        };
      });

      if (!format) return;

      const canvas = document.createElement("canvas");
      const width = selectedTemplate.size.width;
      const basePosterHeight = selectedTemplate.size.height;
      const borderSize = 8;
      const qrCodePadding = 40;
      const qrCodeWidth = width - 2 * qrCodePadding;

      // Determine which sections have content
      const hasSecondaryInfo = title === "Pay Bill" || title === "Withdraw Money";
      const hasBusinessName = showName && businessName;
      
      // Calculate visible sections
      const visibleSections = [
        { type: "title", hasContent: true },
        { type: "primary", hasContent: true },
        { type: "secondary", hasContent: hasSecondaryInfo },
        { type: "business", hasContent: hasBusinessName }
      ].filter(section => section.hasContent);

      const sectionCount = visibleSections.length;
      const sectionHeight = basePosterHeight / 4; // Maintain original section height ratio
      const scanSectionHeight = sectionHeight;
      const qrSectionHeight = qrCodeWidth + scanSectionHeight + 70;
      const totalHeight = (sectionHeight * sectionCount) + qrSectionHeight + borderSize;

      canvas.width = width;
      canvas.height = totalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context missing");

      const mainColor = selectedColor;
      const borderColor = "#1a2335";
      const whiteColor = "#ffffff";
      const blackColor = "#000000";

      // Draw border background
      ctx.fillStyle = borderColor;
      ctx.fillRect(0, 0, width, totalHeight);

      // QR + Scan section
      const scanSectionY = borderSize;
      ctx.fillStyle = whiteColor;
      ctx.fillRect(borderSize, scanSectionY, width - 2 * borderSize, qrSectionHeight - borderSize);

      ctx.fillStyle = mainColor;
      ctx.fillRect(borderSize, scanSectionY, width - 2 * borderSize, scanSectionHeight);

      drawFittedText(ctx, "SCAN TO PAY!", width / 2, scanSectionY, width - 40, scanSectionHeight, whiteColor);

      ctx.fillStyle = borderColor;
      ctx.fillRect(borderSize, scanSectionY + scanSectionHeight, width - 2 * borderSize, borderSize);
      ctx.fillRect(borderSize, scanSectionY + qrSectionHeight - borderSize, width - 2 * borderSize, borderSize);

      const qrCodeY = scanSectionY + scanSectionHeight + borderSize + 30;

      // Draw visible sections with proper alternating colors
      let currentY = qrSectionHeight + borderSize;
      visibleSections.forEach((section, index) => {
        const isDarkSection = index % 2 === 0; // Alternate based on visible section index
        ctx.fillStyle = isDarkSection ? mainColor : whiteColor;
        ctx.fillRect(borderSize, currentY, width - 2 * borderSize, sectionHeight - borderSize);

        if (index > 0) {
          ctx.fillStyle = borderColor;
          ctx.fillRect(borderSize, currentY - borderSize, width - 2 * borderSize, borderSize);
        }

        const textColor = isDarkSection ? whiteColor : blackColor;

        switch (section.type) {
          case "title":
            drawFittedText(ctx, title.toUpperCase(), width / 2, currentY, width - 40, sectionHeight, textColor);
            break;
            
          case "primary":
            switch (title) {
              case "Send Money":
                drawFittedText(ctx, phoneNumber || "0722 256 123", width / 2, currentY, width - 40, sectionHeight, textColor);
                break;
              case "Pay Bill":
                drawFittedText(ctx, paybillNumberLabel || "BUSINESS NUMBER", width / 2, currentY, width - 40, sectionHeight * 0.3, textColor);
                drawFittedText(ctx, paybillNumber || "12345", width / 2, currentY + sectionHeight * 0.4, width - 40, sectionHeight * 0.5, textColor);
                break;
              case "Buy Goods":
                drawFittedText(ctx, tillNumberLabel || "TILL NUMBER", width / 2, currentY, width - 40, sectionHeight * 0.3, textColor);
                drawFittedText(ctx, tillNumber || "54321", width / 2, currentY + sectionHeight * 0.4, width - 40, sectionHeight * 0.5, textColor);
                break;
              case "Withdraw Money":
                drawFittedText(ctx, agentNumberLabel || "AGENT NUMBER", width / 2, currentY, width - 40, sectionHeight * 0.3, textColor);
                drawFittedText(ctx, agentNumber || "98765", width / 2, currentY + sectionHeight * 0.4, width - 40, sectionHeight * 0.5, textColor);
                break;
            }
            break;
            
          case "secondary":
            switch (title) {
              case "Pay Bill":
                drawFittedText(ctx, accountNumberLabel || "ACCOUNT NUMBER", width / 2, currentY, width - 40, sectionHeight * 0.3, textColor);
                drawFittedText(ctx, accountNumber || "67890", width / 2, currentY + sectionHeight * 0.4, width - 40, sectionHeight * 0.5, textColor);
                break;
              case "Withdraw Money":
                drawFittedText(ctx, storeNumberLabel || "STORE NUMBER", width / 2, currentY, width - 40, sectionHeight * 0.3, textColor);
                drawFittedText(ctx, storeNumber || "24680", width / 2, currentY + sectionHeight * 0.4, width - 40, sectionHeight * 0.5, textColor);
                break;
            }
            break;
            
          case "business":
            drawFittedText(ctx, businessName?.toUpperCase() || "NELSON ANANGWE", width / 2, currentY, width - 40, sectionHeight, textColor);
            break;
        }

        currentY += sectionHeight;
      });

      // Generate and draw QR code
      const qrData = await generateDownloadQrData();
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      document.body.appendChild(tempDiv);

      const root = createRoot(tempDiv);
      root.render(<QrSvg value={qrData} className="qr-code-svg" fgColor="#000000" style={{ width: qrCodeWidth, height: qrCodeWidth }} />);
      await new Promise(resolve => setTimeout(resolve, 50));

      const svg = tempDiv.querySelector("svg");
      if (!svg) throw new Error("QR SVG not found");

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
      });

      ctx.drawImage(img, qrCodePadding, qrCodeY, qrCodeWidth, qrCodeWidth);
      root.unmount();
      document.body.removeChild(tempDiv);

      // Generate filename
      const fileName = (() => {
        switch (title) {
          case "Send Money": return `${phoneNumber}-send-money`;
          case "Pay Bill": return `${paybillNumber}-pay-bill`;
          case "Buy Goods": return `${tillNumber}-buy-goods`;
          case "Withdraw Money": return `${agentNumber}-withdraw-money`;
          default: return `mpesa-poster-${Date.now()}`;
        }
      })();

      // Handle download
      if (format === "pdf") {
        const { PDFDocument } = await import("pdf-lib");
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([canvas.width, canvas.height]);
        const pngImage = await pdfDoc.embedPng(canvas.toDataURL("image/png"));
        page.drawImage(pngImage, { x: 0, y: 0, width: canvas.width, height: canvas.height });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
        const link = document.createElement("a");
        link.download = `${fileName}.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // For offline mode, store the current form data
      if (isWorkingOffline) {
        const currentData = {
          phoneNumber: watch("phoneNumber"),
          paybillNumber: watch("paybillNumber"),
          accountNumber: watch("accountNumber"),
          tillNumber: watch("tillNumber"),
          agentNumber: watch("agentNumber"),
          storeNumber: watch("storeNumber"),
          businessName: watch("businessName"),
          type: watch("type")
        };
        localStorage.setItem('offlinePosterData', JSON.stringify(currentData));
      }

    } catch (error) {
      console.error("Error generating poster:", error);
      alert(isWorkingOffline 
        ? "Poster generated offline. Data saved for next session." 
        : "Failed to generate download. Try again.");
    }
  };

  // Handle share with offline support
  const handleShare = async () => {
    try {
      if (!posterRef.current) return;
  
      const qrData = await generateDownloadQrData();
      if (!qrData) throw new Error("Invalid QR code data");
  
      let shareMessage = `M-Pesa Payment Poster - ${title}\n`;
      let shareUrl = qrData;
  
      if (qrGenerationMethod === "push" && !isWorkingOffline) {
        // Online push STK
        shareMessage = `Scan or visit this link to make an M-Pesa payment:`;
      } else {
        // Offline mode or M-Pesa App
        shareMessage += `Type: ${title}\n`;
        
        switch (title) {
          case "Send Money":
            shareMessage += `Phone: ${phoneNumber}\n`;
            break;
          case "Pay Bill":
            shareMessage += `Paybill: ${paybillNumber}\nAccount: ${accountNumber}\n`;
            break;
          case "Buy Goods":
            shareMessage += `Till Number: ${tillNumber}\n`;
            break;
          case "Withdraw Money":
            shareMessage += `Agent: ${agentNumber}\nStore: ${storeNumber}\n`;
            break;
        }
  
        if (showName && businessName) {
          shareMessage += `Name: ${businessName}\n`;
        }
  
        shareMessage += isWorkingOffline 
          ? `Scan the QR code with an offline QR scanner`
          : `Scan the QR code to make payment`;
      }
  
      if (navigator.share) {
        await navigator.share({
          title: `M-Pesa ${title} Poster`,
          text: shareMessage,
          url: shareUrl.includes('http') ? shareUrl : undefined,
        });
      } else {
        // Fallback for desktop browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareMessage + (isWorkingOffline 
          ? `\n\nOffline QR Data:\n${qrData}`
          : `\n\nPayment Link:\n${shareUrl}`);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(isWorkingOffline 
          ? 'Offline payment details copied to clipboard!'
          : 'Payment details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert(isWorkingOffline
        ? 'Offline sharing failed. Please save or screenshot the poster.'
        : 'Sharing failed. Please try downloading instead.');
    }
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters except leading + and spaces
    const cleanedValue = value.replace(/[^\d+ ]/g, '');
    
    // Use AsYouType formatter for real-time formatting
    const formatter = new AsYouType();
    
    // Feed the input character by character to get proper formatting
    cleanedValue.split('').forEach(char => formatter.input(char));
    
    // Get the formatted number
    const formattedNumber = formatter.getNumber();
    
    if (formattedNumber) {
      // Return in national format if it's a local number (starts with 0)
      if (formattedNumber.number.startsWith('+2540')) {
        return formattedNumber.formatNational();
      }
      // Return in international format if it's a full international number
      return formattedNumber.formatInternational();
    }
    
    // Fallback - return the cleaned value with preserved spaces
    return cleanedValue;
  };

  const onSubmit = handleSubmit(async () => {
    await handleDownload();
  });

  // Helper functions for the preview
  function getGridTemplateRows(title: string, showName: boolean): string {
    const sectionCount = getSectionCount(title, showName);
    return `repeat(${sectionCount}, minmax(80px, 1fr))`;
  }

  function calculatePosterMinHeight(title: string, showName: boolean): string {
    const sectionCount = getSectionCount(title, showName);
    return `${sectionCount * 80}px`;
  }

  function getSectionCount(title: string, showName: boolean): number {
    let count = 2; // Title + one content section by default
    
    if (title === "Pay Bill" || title === "Withdraw Money") {
      count = 3; // Title + two content sections
    }
    
    if (showName) {
      count += 1; // Add name section
    }
    
    return count;
  }

  function renderMiddleSections(title: string, _color: string, showName: boolean) {
    const sections = [];
    const sectionColors = getSectionColors(title, showName);
    let sectionCount = showName 
      ? (title === "Pay Bill" || title === "Withdraw Money" ? 2 : 1) 
      : (title === "Pay Bill" || title === "Withdraw Money" ? 2 : 1);

    for (let i = 0; i < sectionCount; i++) {
      const sectionIndex = i + 1; // +1 because title is section 0
      const isWhite = sectionColors[sectionIndex] === "#ffffff";
      
      sections.push(
        <div
          key={i}
          className="flex flex-col justify-center"
          style={{
            backgroundColor: sectionColors[sectionIndex],
            minHeight: "80px",
            padding: "0.5rem 0",
            borderTop: "8px solid #1a2335",
            borderBottom: i === sectionCount - 1 && !showName ? "none" : "none"
          }}
        >
          {renderSectionContent(title, i, isWhite)}
        </div>
      );
    }

    return sections;
  }

  function renderSectionContent(title: string, sectionIndex: number, isWhite: boolean) {
    const textColor = isWhite ? "#000000" : "#ffffff";
    
    const labelStyles = {
      color: textColor,
      fontSize: "clamp(0.875rem, 3vw, 1.125rem)",
      lineHeight: "1.2"
    };

    const valueStyles = {
      color: textColor,
      fontSize: "clamp(1.25rem, 4vw, 2rem)",
      lineHeight: "1.2"
    };

    switch (title) {
      case "Send Money":
        return (
          <div 
            className="font-bold text-center py-2 px-2" 
            style={valueStyles}
          >
            {phoneNumber || "0722 256 123"}
          </div>
        );
      
      case "Pay Bill":
        if (sectionIndex === 0) {
          return (
            <>
              <div className="font-bold w-full py-1 px-2 text-center" style={labelStyles}>
                Business Number
              </div>
              <div className="font-bold text-center py-1 px-2" style={valueStyles}>
                {paybillNumber || "12345"}
              </div>
            </>
          );
        } else {
          return (
            <>
              <div className="font-bold w-full py-1 px-2 text-center" style={labelStyles}>
                Account Number
              </div>
              <div className="font-bold text-center py-1 px-2" style={valueStyles}>
                {accountNumber || "67890"}
              </div>
            </>
          );
        }
      
      case "Buy Goods":
        return (
          <>
            <div className="font-bold w-full py-1 px-2 text-center" style={labelStyles}>
              Till Number
            </div>
            <div className="font-bold text-center py-1 px-2" style={valueStyles}>
              {tillNumber || "54321"}
            </div>
          </>
        );
      
      case "Withdraw Money":
        if (sectionIndex === 0) {
          return (
            <>
              <div className="font-bold w-full py-1 px-2 text-center" style={labelStyles}>
                Agent Number
              </div>
              <div className="font-bold text-center py-1 px-2" style={valueStyles}>
                {agentNumber || "98765"}
              </div>
            </>
          );
        } else {
          return (
            <>
              <div className="font-bold w-full py-1 px-2 text-center" style={labelStyles}>
                Store Number
              </div>
              <div className="font-bold text-center py-1 px-2" style={valueStyles}>
                {storeNumber || "24680"}
              </div>
            </>
          );
        }
      
      default:
        return null;
    }
  }

  function getSectionColors(title: string, showName: boolean): string[] {
    const sectionCount = getSectionCount(title, showName);
    const colors = [];
    
    colors.push(selectedColor);
    
    for (let i = 1; i < sectionCount; i++) {
      colors.push(colors[i-1] === selectedColor ? "#ffffff" : selectedColor);
    }
    
    return colors;
  }

  const colorOptions = [
    { name: "Green", value: "#16a34a", class: "bg-green-600" },
    { name: "Rose", value: "#be123c", class: "bg-rose-700" },
    { name: "Yellow", value: "#F7C50C", class: "bg-[#F7C50C]" },
    { name: "Blue", value: "#1B398E", class: "bg-blue-800" },
  ];

  // Add offline notification banner
  if (!isOnline) {
    return (
      <div className="flex flex-col dark:bg-[#0a0a23] bg-gray-100 w-full max-w-[100vw]">
        <div className="p-4 text-center">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <p>You are currently offline. Working with locally saved data.</p>
            <p className="text-sm mt-1">Some features may be limited.</p>
          </div>
          
          {/* Render the poster form in offline mode */}
          <div className="flex-1 flex flex-col md:flex-row gap-8 px-4 py-4 sm:py-8 sm:px-6 lg:px-8 relative z-10">
            {/* Left Column: Make + Customize */}
            <div className="w-full md:w-1/2 flex flex-col gap-6">
              {/* Make Your Poster Card */}
              <Card className="relative bg-white dark:bg-[#0a0a23] border border-green-500 rounded-md px-2 sm:px-3 pt-6 pb-3 w-full">
                <CardTitle className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 text-center bg-white dark:bg-[#0a0a23]">
                  <p className="font-handwriting text-xl text-gray-700 dark:text-white whitespace-nowrap relative">
                    Make Your M-Pesa Poster (Offline)
                  </p>
                  <div className="text-center italic text-gray-500 dark:text-gray-300 text-xs mt-1">
                    Download It, Share It, Stick it!
                  </div>
                </CardTitle>
                <CardContent className="pt-14">
                  <form onSubmit={onSubmit} className="space-y-4">
                    {/* Radio buttons */}
                    <div className={`relative border dark:border-gray-500 border-gray-300 rounded-md p-2 mb-4`}>
                      <div className={`absolute -top-3 left-4 dark:bg-gray-600 bg-gray-200 px-2 text-sm font-medium dark:text-white text-gray-800`}>
                        Generate QR Code for:
                      </div>
                      <div className="flex space-x-4 mt-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4 text-green-600"
                            checked={qrGenerationMethod === "push"}
                            onChange={() => setQrGenerationMethod("push")}
                          />
                          <span className={`dark:text-white text-black mt-3`}>Push STK</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4 text-green-600"
                            checked={qrGenerationMethod === "mpesa"}
                            onChange={() => setQrGenerationMethod("mpesa")}
                          />
                          <span className={`dark:text-white text-black mt-3`}>M-Pesa App</span>
                        </label>
                      </div>

                      <p className="text-xs italic text-green-500 mt-3">
                        {qrGenerationMethod === "push"
                          ? "QR Code will initiate an M-Pesa payment"
                          : "QR Code will open the M-Pesa app"}
                      </p>
                    </div>

                    {/* Show Name Checkbox and Name Input */}
                    <div className="flex items-center space-x-2 mb-2 pb-2">
                      <Controller
                        name="showName"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="showName"
                            checked={field.value}
                            onCheckedChange={(checked: boolean) => {
                              field.onChange(checked);
                            }}
                            className={`dark:text-white border-white text-black border-gray-300`}
                          />
                        )}
                      />
                      <label
                        htmlFor="showName"
                        className={`text-sm font-small leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-white text-black`}
                      >
                        Include Merchant Name
                      </label>
                    </div>               

                    {/* Transaction Type Selector */}
                    <div className="relative">
                      <label 
                        htmlFor="type" 
                        className={`hidden md:block text-sm font-medium dark:text-white text-gray-700 mb-1`}
                      >
                        Transaction Type
                      </label>
                      <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <Select 
                            onValueChange={(value: TRANSACTION_TYPE) => {
                              field.onChange(value);
                              switch(value) {
                                case TRANSACTION_TYPE.SEND_MONEY:
                                  setValue("title", "Send Money");
                                  break;
                                case TRANSACTION_TYPE.PAYBILL:
                                  setValue("title", "Pay Bill");
                                  break;
                                case TRANSACTION_TYPE.TILL_NUMBER:
                                  setValue("title", "Buy Goods");
                                  break;
                                case TRANSACTION_TYPE.AGENT:
                                  setValue("title", "Withdraw Money");
                                  break;
                              }
                              setValue("phoneNumber", "");
                              setValue("paybillNumber", "");
                              setValue("accountNumber", "");
                              setValue("tillNumber", "");
                              setValue("agentNumber", "");
                              setValue("storeNumber", "");
                              trigger();
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black text-white bg-white text-black peer`}>
                              <SelectValue placeholder=" " />
                            </SelectTrigger>
                            <label 
                              htmlFor="type" 
                              className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                field.value
                                  ? "-top-2 text-xs text-green-500"
                                  : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                              } md:hidden`}
                            >
                              Transaction Type
                            </label>
                            <SelectContent className={`dark:bg-[#0a0a23] text-white bg-white text-black`}>                          
                              <SelectItem value={TRANSACTION_TYPE.PAYBILL}>Pay Bill</SelectItem>
                              <SelectItem value={TRANSACTION_TYPE.TILL_NUMBER}>Buy Goods</SelectItem>
                              <SelectItem value={TRANSACTION_TYPE.AGENT}>Withdraw Money</SelectItem>
                              <SelectItem value={TRANSACTION_TYPE.SEND_MONEY}>Send Money</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.type && (
                        <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
                      )}
                    </div>
                        
                    {/* Send Money Fields */}
                    {watch("type") === TRANSACTION_TYPE.SEND_MONEY && (
                      <div className="relative">
                        <Controller
                          name="phoneNumber"
                          control={control}
                          render={({ field }) => {
                            const phoneHistory = useInputHistory('phoneNumber');
                            
                            return (
                              <div className="relative">
                                <Input
                                  id="phone"
                                  type="tel"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const formatted = formatPhoneNumber(e.target.value);
                                    field.onChange(formatted);
                                  }}
                                  onBlur={() => {
                                    if (field.value) {
                                      phoneHistory.addToHistory(field.value);
                                    }
                                  }}
                                  className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black text-white bg-white text-black peer`}
                                  placeholder=" "
                                  list={`phoneNumber-history`}
                                />
                                <label 
                                  htmlFor="phone" 
                                  className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                    field.value
                                      ? "-top-2 text-xs text-green-500"
                                      : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                                  } md:hidden`}
                                >
                                  Phone Number
                                </label>
                                {phoneHistory.history.length > 0 && (
                                  <datalist id={`phoneNumber-history`}>
                                    {phoneHistory.history.map((item, index) => (
                                      <option key={index} value={item} />
                                    ))}
                                  </datalist>
                                )}
                              </div>
                            );
                          }}
                        />
                        {errors.phoneNumber && (
                          <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
                        )}
                      </div>
                    )}

                    {/* Pay Bill Fields */}
                    {watch("type") === TRANSACTION_TYPE.PAYBILL && (
                      <>
                        <div className="relative">
                          <Controller
                            name="paybillNumber"
                            control={control}
                            render={({ field }) => {
                              const paybillHistory = useInputHistory('paybillNumber');
                              
                              return (
                                <div className="relative">
                                  <Input
                                    id="paybillNumber"
                                    type="text"
                                    inputMode="numeric"
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, "");
                                      field.onChange(value);
                                    }}
                                    onBlur={() => {
                                      if (field.value) {
                                        paybillHistory.addToHistory(field.value);
                                      }
                                    }}
                                    className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black text-white bg-white text-black peer`}
                                    placeholder=" "
                                    list={`paybillNumber-history`}
                                  />
                                  <label 
                                    htmlFor="paybillNumber" 
                                    className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                      field.value
                                        ? "-top-2 text-xs text-green-500"
                                        : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                                    } md:hidden`}
                                  >
                                    Business Number
                                  </label>
                                  {paybillHistory.history.length > 0 && (
                                    <datalist id={`paybillNumber-history`}>
                                      {paybillHistory.history.map((item, index) => (
                                        <option key={index} value={item} />
                                      ))}
                                    </datalist>
                                  )}
                                </div>
                              );
                            }}
                          />
                          {errors.paybillNumber && (
                            <p className="mt-1 text-sm text-red-500">{errors.paybillNumber.message}</p>
                          )}
                        </div>
                        <div className="relative">
                          <Controller
                            name="accountNumber"
                            control={control}
                            render={({ field }) => {
                              const accountHistory = useInputHistory('accountNumber');
                              
                              return (
                                <div className="relative">
                                  <Input
                                    id="accountNumber"
                                    type="text"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onBlur={() => {
                                      if (field.value) {
                                        accountHistory.addToHistory(field.value);
                                      }
                                    }}
                                    className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black text-white bg-white text-black peer`}
                                    placeholder=" "
                                    list={`accountNumber-history`}
                                  />
                                  <label 
                                    htmlFor="accountNumber" 
                                    className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                      field.value
                                        ? "-top-2 text-xs text-green-500"
                                        : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                                    } md:hidden`}
                                  >
                                    Account Number
                                  </label>
                                  {accountHistory.history.length > 0 && (
                                    <datalist id={`accountNumber-history`}>
                                      {accountHistory.history.map((item, index) => (
                                        <option key={index} value={item} />
                                      ))}
                                    </datalist>
                                  )}
                                </div>
                              );
                            }}
                          />
                          {errors.accountNumber && (
                            <p className="mt-1 text-sm text-red-500">{errors.accountNumber.message}</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Buy Goods (Till Number) Fields */}
                    {watch("type") === TRANSACTION_TYPE.TILL_NUMBER && (
                      <div className="relative">
                        <Controller
                          name="tillNumber"
                          control={control}
                          render={({ field }) => {
                            const tillHistory = useInputHistory('tillNumber');
                            
                            return (
                              <div className="relative">
                                <Input
                                  id="tillNumber"
                                  type="text"
                                  inputMode="numeric"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    field.onChange(value);
                                  }}
                                  onBlur={() => {
                                    if (field.value) {
                                      tillHistory.addToHistory(field.value);
                                    }
                                  }}
                                  className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black text-white bg-white text-black peer`}
                                  placeholder=" "
                                  list={`tillNumber-history`}
                                />
                                <label 
                                  htmlFor="tillNumber" 
                                  className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                    field.value
                                      ? "-top-2 text-xs text-green-500"
                                      : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                                  } md:hidden`}
                                >
                                  Till Number
                                </label>
                                {tillHistory.history.length > 0 && (
                                  <datalist id={`tillNumber-history`}>
                                    {tillHistory.history.map((item, index) => (
                                      <option key={index} value={item} />
                                    ))}
                                  </datalist>
                                )}
                              </div>
                            );
                          }}
                        />
                        {errors.tillNumber && (
                          <p className="mt-1 text-sm text-red-500">{errors.tillNumber.message}</p>
                        )}
                      </div>
                    )}

                    {/* Withdraw Money (Agent) Fields */}
                    {watch("type") === TRANSACTION_TYPE.AGENT && (
                      <>
                        <div className="relative">
                          <Controller
                            name="agentNumber"
                            control={control}
                            render={({ field }) => {
                              const agentHistory = useInputHistory('agentNumber');
                              
                              return (
                                <div className="relative">
                                  <Input
                                    id="agentNumber"
                                    type="text"
                                    inputMode="numeric"
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, "");
                                      field.onChange(value);
                                    }}
                                    onBlur={() => {
                                      if (field.value) {
                                        agentHistory.addToHistory(field.value);
                                      }
                                    }}
                                    className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black text-white bg-white text-black peer`}
                                    placeholder=" "
                                    list={`agentNumber-history`}
                                  />
                                  <label 
                                    htmlFor="agentNumber" 
                                    className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                      field.value
                                        ? "-top-2 text-xs text-green-500"
                                        : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                                    } md:hidden`}
                                  >
                                    Agent Number
                                  </label>
                                  {agentHistory.history.length > 0 && (
                                    <datalist id={`agentNumber-history`}>
                                      {agentHistory.history.map((item, index) => (
                                        <option key={index} value={item} />
                                      ))}
                                    </datalist>
                                  )}
                                </div>
                              );
                            }}
                          />
                          {errors.agentNumber && (
                            <p className="mt-1 text-sm text-red-500">{errors.agentNumber.message}</p>
                          )}
                        </div>
                        <div className="relative">
                          <Controller
                            name="storeNumber"
                            control={control}
                            render={({ field }) => {
                              const storeHistory = useInputHistory('storeNumber');
                              
                              return (
                                <div className="relative">
                                  <Input
                                    id="storeNumber"
                                    type="text"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onBlur={() => {
                                      if (field.value) {
                                        storeHistory.addToHistory(field.value);
                                      }
                                    }}
                                    className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black text-white bg-white text-black peer`}
                                    placeholder=" "
                                    list={`storeNumber-history`}
                                  />
                                  <label 
                                    htmlFor="storeNumber" 
                                    className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                      field.value
                                        ? "-top-2 text-xs text-green-500"
                                        : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                                    } md:hidden`}
                                  >
                                    Store Number
                                  </label>
                                  {storeHistory.history.length > 0 && (
                                    <datalist id={`storeNumber-history`}>
                                      {storeHistory.history.map((item, index) => (
                                        <option key={index} value={item} />
                                      ))}
                                    </datalist>
                                  )}
                                </div>
                              );
                            }}
                          />
                          {errors.storeNumber && (
                            <p className="mt-1 text-sm text-red-500">{errors.storeNumber.message}</p>
                          )}
                        </div>
                      </>
                    )}      

                    {watch("showName") && (
                      <div className="relative">
                        <Controller
                          name="businessName"
                          control={control}
                          render={({ field }) => {
                            const businessHistory = useInputHistory('businessName');
                            
                            return (
                              <div className="relative">
                                <Input
                                  id="name"
                                  type="text"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    field.onChange(e.target.value.toUpperCase());
                                  }}
                                  onBlur={() => {
                                    if (field.value) {
                                      businessHistory.addToHistory(field.value);
                                    }
                                  }}
                                  className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black text-white bg-white text-black peer`}
                                  placeholder=" "
                                  list={`businessName-history`}
                                />
                                <label 
                                  htmlFor="name" 
                                  className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                    field.value
                                      ? "-top-2 text-xs text-green-500"
                                      : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                                  } md:hidden`}
                                >
                                  Merchant Name
                                </label>
                                {businessHistory.history.length > 0 && (
                                  <datalist id={`businessName-history`}>
                                    {businessHistory.history.map((item, index) => (
                                      <option key={index} value={item} />
                                    ))}
                                  </datalist>
                                )}
                              </div>
                            );
                          }}
                        />
                        {errors.businessName && (
                          <p className="mt-1 text-sm text-red-500">{errors.businessName.message}</p>
                        )}
                      </div>
                    )}   
                  </form>
                </CardContent>
              </Card>
              {/* Customize Poster Card */}
              <Card className="relative bg-white dark:bg-[#0a0a23] border border-green-500 rounded-md px-2 sm:px-3 pt-6 pb-3 w-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 text-center bg-white dark:bg-[#0a0a23]">
                  <p className="font-handwriting text-xl text-gray-700 dark:text-white whitespace-nowrap relative">
                    Customize your Poster
                  </p>
                </div>
                {/* Color Picker - full width */}
                  <div className="relative border border-gray-500 rounded-md p-4 mb-4 mt-2 w-full">
                    <div className="absolute -top-3 left-4 bg-gray-600 px-2 text-sm text-white">
                      Pick Poster Color
                    </div>

                    <div className="flex flex-wrap items-end gap-x-1 gap-y-1">
                      {/* Standard color buttons */}
                      {colorOptions.map((color) => (
                        <div key={color.value} className="flex flex-col items-center w-9">
                          <button
                            type="button"
                            className={`w-8 h-8 min-w-8 min-h-8 shrink-0 rounded-full border-2 flex items-center justify-center ${
                              selectedColor === color.value
                                ? "border-gray-300 md:border-gray-800"
                                : "border-transparent"
                            } ${color.class}`}
                            onClick={() => setValue("selectedColor", color.value)}
                            aria-label={`Select ${color.name} color`}
                          >
                            {selectedColor === color.value && (
                              <CheckIcon className="h-5 w-5 text-white" />
                            )}
                          </button>
                          {/* Optional empty caption space for alignment (if needed) */}
                          <span className="invisible text-xs">.</span>
                        </div>
                      ))}

                      {/* Custom picker + caption */}
                      <div className="flex flex-col items-center w-9">
                        <Controller
                          name="selectedColor"
                          control={control}
                          render={({ field }) => (
                            <div
                              className="size-8 rounded-full border-2 border-white overflow-hidden cursor-pointer"
                              style={{
                                backgroundImage: `conic-gradient(
                                  red 0deg 45deg,
                                  orange 45deg 90deg,
                                  yellow 90deg 135deg,
                                  green 135deg 180deg,
                                  cyan 180deg 225deg,
                                  blue 225deg 270deg,
                                  indigo 270deg 315deg,
                                  violet 315deg 360deg
                                )`
                              }}
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "color";
                                input.value = field.value;
                                input.onchange = (e) => field.onChange((e.target as HTMLInputElement).value);
                                input.click();
                              }}
                            />
                          )}
                        />
                        <span className="text-xs text-gray-300 md:text-gray-500 mt-[2px]">Custom</span>
                      </div>
                    </div>
                  </div>
                  {/* Template selector subsection - full width */}
                    <div className="relative border border-gray-500 rounded-md p-4 mb-4 mt-2 w-full">
                      <div className="absolute -top-3 left-4 bg-gray-600 px-2 text-sm text-white">
                          Select a Template
                      </div>
                      <div className="relative w-full rounded-xl overflow-hidden">
                          {/* Left scroll indicator */}
                          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0a23] md:from-gray-100 to-transparent z-10 pointer-events-none flex items-center justify-start pl-1">
                          <ChevronLeftIcon className="h-6 w-6 text-gray-300 md:text-gray-500 animate-pulse" />
                          </div>

                          {/* Right scroll indicator */}
                          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0a23] md:from-gray-100 to-transparent z-10 pointer-events-none flex items-center justify-end pr-1">
                          <ChevronRightIcon className="h-6 w-6 text-gray-300 md:text-gray-500 animate-pulse" />
                          </div>

                          <ScrollArea className="w-full h-[170px] rounded-lg">
                          <div className="flex space-x-4 px-8 py-1 min-w-max flex-nowrap">
                              {templates.map((template) => (
                              <div
                                  key={template.slug}
                                  onClick={() => setSelectedTemplate(template)}
                                  className={`p-3 rounded-lg cursor-pointer transition-all w-[160px] h-[150px] flex flex-col ${
                                  selectedTemplate.slug === template.slug
                                      ? "bg-gray-800 text-white ring-2 ring-green-500"
                                      : "bg-[#1a1a3a] hover:bg-[#2a2a4a] md:bg-white md:hover:bg-gray-100 border border-gray-700 md:border-gray-200"
                                  }`}
                              >
                                  <div className="font-medium truncate">
                                  {template.name}
                                  </div>
                                  <div className="text-xs mt-1 line-clamp-2 flex-grow text-gray-300 md:text-gray-800">
                                  {template.description}
                                  </div>
                                  <div
                                  className={`text-xs mt-1 font-semibold ${
                                      selectedTemplate.slug === template.slug
                                      ? "text-green-300"
                                      : "text-green-400 md:text-green-600"
                                  }`}
                                  >
                                  {template.size.label}
                                  </div>
                                  <div
                                  className={`text-xs mt-1 ${
                                      selectedTemplate.slug === template.slug
                                      ? "text-gray-300"
                                      : "text-gray-400 md:text-gray-500"
                                  }`}
                                  >
                                  {template.size.width}×{template.size.height}px
                                  </div>
                              </div>
                              ))}
                          </div>
                          <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                      </div>
                    </div>  
              </Card>
            </div>
            
            {/* Right Column: Poster Preview */}
            <div className="w-full md:w-1/2 flex flex-col">
              <form onSubmit={onSubmit} className="space-y-4 w-full">
                <Card className="relative bg-white dark:bg-[#0a0a23] border border-green-500 rounded-md px-2 sm:px-3 pt-6 pb-3 w-full">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 text-center bg-white dark:bg-[#0a0a23]">
                    <p className="font-handwriting text-xl text-gray-700 dark:text-white whitespace-nowrap relative">
                      A Preview of your Poster
                    </p>
                  </div>
                  <div className="w-full flex flex-col items-center justify-center overflow-x-auto">
                    {/* Poster Container */}
                    <div className="w-full max-w-lg">
                      {/* QR Code Block */}
                      <div className="w-full flex justify-center">
                          <div
                          className="bg-white border-l-8 border-r-8 border-t-0 border-gray-800 flex flex-col w-full"
                          style={{
                              maxWidth: `${selectedTemplate.size.width}px`,
                          }}
                          >
                          {/* Header Section */}
                          <div
                              className="w-full flex items-center justify-center py-4 px-2"
                              style={{
                              backgroundColor: selectedColor,
                              borderTop: "8px solid #1a2335",
                              minHeight: "70px",
                              borderBottom: "8px solid #1a2335",
                              }}
                          >
                              <p
                              className="text-center font-bold text-white whitespace-nowrap w-full overflow-hidden break-words px-2"
                              style={{
                                  fontSize: "clamp(1.25rem, 4vw, 2rem)",
                              }}
                              >
                              SCAN TO PAY!
                              </p>
                          </div>

                          {/* QR Code Section */}
                          <div className="w-full p-3" style={{ aspectRatio: "1/1" }}>
                              {previewQrData ? (
                              <QrSvg
                                  value={previewQrData}
                                  className="qr-code-svg w-full h-full"
                                  fgColor="#000000"
                              />
                              ) : (
                              <div className="flex items-center justify-center h-full text-gray-500">
                                  Generating QR code...
                              </div>
                              )}
                          </div>
                          </div>
                      </div>

                      {/* Poster Grid Section */}
                      <div
                          id="poster"
                          ref={posterRef}
                          className="grid bg-white w-full shadow-lg overflow-hidden border-8 border-gray-800"
                          style={{
                          gridTemplateRows: getGridTemplateRows(title, showName),
                          aspectRatio: `${selectedTemplate.size.width} / ${selectedTemplate.size.height}`,
                          height: '1200',
                          minHeight: calculatePosterMinHeight(title, showName),
                          }}
                      >
                          {/* Title Section */}
                          <div 
                              className="flex flex-col items-center justify-center px-2" 
                              style={{ 
                              backgroundColor: selectedColor,
                              minHeight: "80px",
                              padding: "0.5rem 0"
                              }}>
                          <div 
                              className="font-bold w-full py-1 text-center text-white"
                              style={{ fontSize: "clamp(0.875rem, 3vw, 1.125rem)" }}
                          >
                              Transaction
                          </div>
                          <h2 
                              className="font-bold text-white text-center px-2 w-full break-words"
                              style={{ fontSize: "clamp(1.25rem, 4vw, 1.75rem)" }}
                          >
                              {title.toUpperCase()}
                          </h2>
                          </div>

                          {/* Middle Sections */}
                          {renderMiddleSections(title, selectedColor, showName)}

                          {/* Optional Name Section */}
                          {showName && (
                          <div
                              className="flex flex-col items-center justify-center px-2"
                              style={{
                              backgroundColor: getSectionColors(title, showName)[getSectionCount(title, showName) - 1],
                              minHeight: "80px",
                              padding: "0.5rem 0",
                              borderTop: "8px solid #1a2335"
                              }}
                          >
                              <div 
                              className="font-bold w-full py-1 text-center"
                              style={{ 
                                  color: getSectionColors(title, showName)[getSectionCount(title, showName) - 1] === selectedColor ? "#ffffff" : "#000000",
                                  fontSize: "clamp(0.875rem, 3vw, 1.125rem)"
                              }}
                              >
                              Business Name
                              </div>
                              <div 
                              className="font-bold text-center px-2 w-full break-words"
                              style={{ 
                                  color: getSectionColors(title, showName)[getSectionCount(title, showName) - 1] === selectedColor ? "#ffffff" : "#000000",
                                  fontSize: "clamp(1rem, 4vw, 1.5rem)"
                              }}
                              >
                              {businessName || "NELSON ANANGWE"}
                              </div>
                          </div>
                          )}
                      </div>
                      </div>
                  </div>

                  {/* Share & Download Buttons */}
                  <div className="flex flex-row mt-4 w-full gap-2 items-center">
                    <div className="flex flex-row mt-4 w-full gap-2 items-center">
                          <motion.div whileHover={{ scale: 1.03 }} className="flex-1 min-w-[120px]">
                            <Button
                              type="button"
                              onClick={handleShare}
                              className="w-full bg-blue-600 text-white text-sm font-bold py-4 px-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                              disabled={!isValid}
                            >
                              <HiOutlineShare className="size-5 mr-1" />
                              <span>Share</span>
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.03 }} className="flex-1 min-w-[120px]">
                            <Button
                              type="submit"
                              className="w-full bg-gray-800 text-white text-sm font-bold py-4 px-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                              disabled={!isValid}
                            >
                              <HiOutlineDownload className="size-5 mr-1" />
                              <span>Download</span>
                            </Button>
                          </motion.div>
                        </div>
                  </div>
                </Card>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal online rendering
  return (
    <div className={`flex flex-col dark:bg-[#0a0a23] bg-gray-100 w-full max-w-[100vw]`}>
      <div className="flex-1 flex flex-col md:flex-row gap-8 px-4 py-4 sm:py-8 sm:px-6 lg:px-8 relative z-10 ">
        {/* Left Column: Make + Customize */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          {/* Make Your Poster Card */}
          <Card className="relative bg-white dark:bg-[#0a0a23] border border-green-500 rounded-md px-2 sm:px-3 pt-6 pb-3 w-full">
            <CardTitle className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 text-center bg-white dark:bg-[#0a0a23]">
              <p className="font-handwriting text-xl text-gray-700 dark:text-white whitespace-nowrap relative">
                Make Your M-Pesa Poster
              </p>
              <div className="text-center italic text-gray-500 dark:text-gray-300 text-xs mt-1">
                Download It, Share It, Stick it!
              </div>
            </CardTitle>
            <CardContent className="pt-14">
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Radio buttons */}
                <div className={`relative border dark:border-gray-500 border-gray-300 rounded-md p-2 mb-4`}>
                  <div className={`absolute -top-3 left-4 dark:bg-gray-600 bg-gray-200 px-2 text-sm font-medium dark:text-white text-gray-800`}>
                    Generate QR Code for:
                  </div>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-green-600"
                        checked={qrGenerationMethod === "push"}
                        onChange={() => setQrGenerationMethod("push")}
                      />
                      <span className={`dark:text-white text-black mt-3`}>Push STK</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-green-600"
                        checked={qrGenerationMethod === "mpesa"}
                        onChange={() => setQrGenerationMethod("mpesa")}
                      />
                      <span className={`dark:text-white text-black mt-3`}>M-Pesa App</span>
                    </label>
                  </div>

                  <p className="text-xs italic text-green-500 mt-3">
                    {qrGenerationMethod === "push"
                      ? "QR Code will initiate an M-Pesa payment"
                      : "QR Code will open the M-Pesa app"}
                  </p>
                </div>

                {/* Show Name Checkbox and Name Input */}
                <div className="flex items-center space-x-2 mb-2 pb-2">
                  <Controller
                    name="showName"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="showName"
                        checked={field.value}
                        onCheckedChange={(checked: boolean) => {
                          field.onChange(checked);
                        }}
                        className={`dark:text-white border-white text-black border-gray-300`}
                      />
                    )}
                  />
                  <label
                    htmlFor="showName"
                    className={`text-sm font-small leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-white text-black`}
                  >
                    Include Merchant Name
                  </label>
                </div>               

                {/* Transaction Type Selector */}
                <div className="relative">
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={(value: TRANSACTION_TYPE) => {
                          field.onChange(value);
                          switch(value) {
                            case TRANSACTION_TYPE.SEND_MONEY:
                              setValue("title", "Send Money");
                              break;
                            case TRANSACTION_TYPE.PAYBILL:
                              setValue("title", "Pay Bill");
                              break;
                            case TRANSACTION_TYPE.TILL_NUMBER:
                              setValue("title", "Buy Goods");
                              break;
                            case TRANSACTION_TYPE.AGENT:
                              setValue("title", "Withdraw Money");
                              break;
                          }
                          setValue("phoneNumber", "");
                          setValue("paybillNumber", "");
                          setValue("accountNumber", "");
                          setValue("tillNumber", "");
                          setValue("agentNumber", "");
                          setValue("storeNumber", "");
                          trigger();
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black dark:text-white bg-white text-black peer`}>
                          <SelectValue placeholder=" " />
                        </SelectTrigger>
                        <label 
                        htmlFor="type" 
                        className={`absolute left-3 transition-all pointer-events-none dark:bg-black : "bg-white"} px-1 ${
                          field.value
                            ? "-top-2 text-xs text-green-500"
                            : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                        }`}
                      >
                        Transaction Type
                      </label>
                        <SelectContent className={`dark:bg-[#0a0a23] text-white bg-white text-gray-400`}>                          
                          <SelectItem value={TRANSACTION_TYPE.PAYBILL}>Pay Bill</SelectItem>
                          <SelectItem value={TRANSACTION_TYPE.TILL_NUMBER}>Buy Goods</SelectItem>
                          <SelectItem value={TRANSACTION_TYPE.AGENT}>Withdraw Money</SelectItem>
                          <SelectItem value={TRANSACTION_TYPE.SEND_MONEY}>Send Money</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
                  )}
                </div>
                    
                {/* Send Money Fields */}
                {watch("type") === TRANSACTION_TYPE.SEND_MONEY && (
                  <div className="relative">
                    <Controller
                      name="phoneNumber"
                      control={control}
                      render={({ field }) => {
                        const phoneHistory = useInputHistory('phoneNumber');
                        
                        return (
                          <div className="relative">
                            <Input
                              id="phone"
                              type="tel"
                              value={field.value || ""}
                              onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value);
                                field.onChange(formatted);
                              }}
                              onBlur={() => {
                                if (field.value) {
                                  phoneHistory.addToHistory(field.value);
                                }
                              }}
                              className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black dark:text-white bg-white text-black peer`}
                              placeholder=" "
                              list={`phoneNumber-history`}
                            />
                            <label 
                            htmlFor="phone" 
                            className={`absolute left-3 transition-all pointer-events-none dark:bg-black : "bg-white"} px-1 ${
                              field.value
                                ? "-top-2 text-xs text-green-500"
                                : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                            }`}
                          >
                            Phone Number
                          </label>
                            {phoneHistory.history.length > 0 && (
                              <datalist id={`phoneNumber-history`}>
                                {phoneHistory.history.map((item, index) => (
                                  <option key={index} value={item} />
                                ))}
                              </datalist>
                            )}
                          </div>
                        );
                      }}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
                    )}
                  </div>
                )}

                {/* Pay Bill Fields */}
                {watch("type") === TRANSACTION_TYPE.PAYBILL && (
                  <>
                    <div className="relative">
                      <Controller
                        name="paybillNumber"
                        control={control}
                        render={({ field }) => {
                          const paybillHistory = useInputHistory('paybillNumber');
                          
                          return (
                            <div className="relative">
                              <Input
                                id="paybillNumber"
                                type="text"
                                inputMode="numeric"
                                value={field.value || ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "");
                                  field.onChange(value);
                                }}
                                onBlur={() => {
                                  if (field.value) {
                                    paybillHistory.addToHistory(field.value);
                                  }
                                }}
                                className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black dark:text-white bg-white text-black peer`}
                                placeholder=" "
                                list={`paybillNumber-history`}
                              />
                              <label 
                                htmlFor="paybillNumber" 
                                className={`absolute left-3 transition-all pointer-events-none dark:bg-black : "bg-white"} px-1 ${
                                  field.value
                                    ? "-top-2 text-xs text-green-500"
                                    : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                                }`}
                              >
                                Business Number
                              </label>
                              {paybillHistory.history.length > 0 && (
                                <datalist id={`paybillNumber-history`}>
                                  {paybillHistory.history.map((item, index) => (
                                    <option key={index} value={item} />
                                  ))}
                                </datalist>
                              )}
                            </div>
                          );
                        }}
                      />
                      {errors.paybillNumber && (
                        <p className="mt-1 text-sm text-red-500">{errors.paybillNumber.message}</p>
                      )}
                    </div>
                    <div className="relative">
                      <Controller
                        name="accountNumber"
                        control={control}
                        render={({ field }) => {
                          const accountHistory = useInputHistory('accountNumber');
                          
                          return (
                            <div className="relative">
                              <Input
                                id="accountNumber"
                                type="text"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={() => {
                                  if (field.value) {
                                    accountHistory.addToHistory(field.value);
                                  }
                                }}
                                className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black dark:text-white bg-white text-black peer`}
                                placeholder=" "
                                list={`accountNumber-history`}
                              />
                              <label 
                                htmlFor="accountNumber" 
                                className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                  field.value
                                    ? "-top-2 text-xs text-green-500"
                                    : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                                }`}
                              >
                                Account Number
                              </label>
                              {accountHistory.history.length > 0 && (
                                <datalist id={`accountNumber-history`}>
                                  {accountHistory.history.map((item, index) => (
                                    <option key={index} value={item} />
                                  ))}
                                </datalist>
                              )}
                            </div>
                          );
                        }}
                      />
                      {errors.accountNumber && (
                        <p className="mt-1 text-sm text-red-500">{errors.accountNumber.message}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Buy Goods (Till Number) Fields */}
                {watch("type") === TRANSACTION_TYPE.TILL_NUMBER && (
                  <div className="relative">
                    <Controller
                      name="tillNumber"
                      control={control}
                      render={({ field }) => {
                        const tillHistory = useInputHistory('tillNumber');
                        
                        return (
                          <div className="relative">
                            <Input
                              id="tillNumber"
                              type="text"
                              inputMode="numeric"
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                field.onChange(value);
                              }}
                              onBlur={() => {
                                if (field.value) {
                                  tillHistory.addToHistory(field.value);
                                }
                              }}
                              className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black dark:text-white bg-white text-black peer`}
                              placeholder=" "
                              list={`tillNumber-history`}
                            />
                            <label 
                              htmlFor="tillNumber" 
                              className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                field.value
                                  ? "-top-2 text-xs text-green-500"
                                  : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                              }`}
                            >
                              Till Number
                            </label>
                            {tillHistory.history.length > 0 && (
                              <datalist id={`tillNumber-history`}>
                                {tillHistory.history.map((item, index) => (
                                  <option key={index} value={item} />
                                ))}
                              </datalist>
                            )}
                          </div>
                        );
                      }}
                    />
                    {errors.tillNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.tillNumber.message}</p>
                    )}
                  </div>
                )}

                {/* Withdraw Money (Agent) Fields */}
                {watch("type") === TRANSACTION_TYPE.AGENT && (
                  <>
                    <div className="relative">
                      <Controller
                        name="agentNumber"
                        control={control}
                        render={({ field }) => {
                          const agentHistory = useInputHistory('agentNumber');
                          
                          return (
                            <div className="relative">
                              <Input
                                id="agentNumber"
                                type="text"
                                inputMode="numeric"
                                value={field.value || ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "");
                                  field.onChange(value);
                                }}
                                onBlur={() => {
                                  if (field.value) {
                                    agentHistory.addToHistory(field.value);
                                  }
                                }}
                                className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black dark:text-white bg-white text-black peer`}
                                placeholder=" "
                                list={`agentNumber-history`}
                              />
                              <label 
                                htmlFor="agentNumber" 
                                className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                  field.value
                                    ? "-top-2 text-xs text-green-500"
                                    : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                                }`}
                              >
                                Agent Number
                              </label>
                              {agentHistory.history.length > 0 && (
                                <datalist id={`agentNumber-history`}>
                                  {agentHistory.history.map((item, index) => (
                                    <option key={index} value={item} />
                                  ))}
                                </datalist>
                              )}
                            </div>
                          );
                        }}
                      />
                      {errors.agentNumber && (
                        <p className="mt-1 text-sm text-red-500">{errors.agentNumber.message}</p>
                      )}
                    </div>
                    <div className="relative">
                      <Controller
                        name="storeNumber"
                        control={control}
                        render={({ field }) => {
                          const storeHistory = useInputHistory('storeNumber');
                          
                          return (
                            <div className="relative">
                              <Input
                                id="storeNumber"
                                type="text"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={() => {
                                  if (field.value) {
                                    storeHistory.addToHistory(field.value);
                                  }
                                }}
                                className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black dark:text-white bg-white text-black peer`}
                                placeholder=" "
                                list={`storeNumber-history`}
                              />
                              <label 
                                htmlFor="storeNumber" 
                                className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                  field.value
                                    ? "-top-2 text-xs text-green-500"
                                    : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                                }`}
                              >
                                Store Number
                              </label>
                              {storeHistory.history.length > 0 && (
                                <datalist id={`storeNumber-history`}>
                                  {storeHistory.history.map((item, index) => (
                                    <option key={index} value={item} />
                                  ))}
                                </datalist>
                              )}
                            </div>
                          );
                        }}
                      />
                      {errors.storeNumber && (
                        <p className="mt-1 text-sm text-red-500">{errors.storeNumber.message}</p>
                      )}
                    </div>
                  </>
                )}      

                {watch("showName") && (
                  <div className="relative">
                    <Controller
                      name="businessName"
                      control={control}
                      render={({ field }) => {
                        const businessHistory = useInputHistory('businessName');
                        
                        return (
                          <div className="relative">
                            <Input
                              id="name"
                              type="text"
                              value={field.value || ""}
                              onChange={(e) => {
                                field.onChange(e.target.value.toUpperCase());
                              }}
                              onBlur={() => {
                                if (field.value) {
                                  businessHistory.addToHistory(field.value);
                                }
                              }}
                              className={`w-full p-3 border dark:border-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold dark:bg-black dark:text-white bg-white text-black peer`}
                              placeholder=" "
                              list={`businessName-history`}
                            />
                            <label 
                              htmlFor="name" 
                              className={`absolute left-3 transition-all pointer-events-none dark:bg-black bg-white px-1 ${
                                field.value
                                  ? "-top-2 text-xs text-green-500"
                                  : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500"
                              }`}
                            >
                              Merchant Name
                            </label>
                            {businessHistory.history.length > 0 && (
                              <datalist id={`businessName-history`}>
                                {businessHistory.history.map((item, index) => (
                                  <option key={index} value={item} />
                                ))}
                              </datalist>
                            )}
                          </div>
                        );
                      }}
                    />
                    {errors.businessName && (
                      <p className="mt-1 text-sm text-red-500">{errors.businessName.message}</p>
                    )}
                  </div>
                )}   
              </form>
            </CardContent>
          </Card>
          {/* Customize Poster Card */}
          <Card className="relative bg-white dark:bg-[#0a0a23] border border-green-500 rounded-md px-2 sm:px-3 pt-6 pb-3 w-full">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 text-center bg-white dark:bg-[#0a0a23]">
              <p className="font-handwriting text-xl text-gray-700 dark:text-white whitespace-nowrap relative">
                Customize your Poster
              </p>
            </div>
            {/* Color Picker - full width */}
              <div className="relative border border-gray-500 rounded-md p-4 mb-4 mt-2 w-full">
                <div className="absolute -top-3 left-4 bg-gray-600 px-2 text-sm text-white">
                  Pick Poster Color
                </div>

                <div className="flex flex-wrap items-end gap-x-1 gap-y-1">
                  {/* Standard color buttons */}
                  {colorOptions.map((color) => (
                    <div key={color.value} className="flex flex-col items-center w-9">
                      <button
                        type="button"
                        className={`w-8 h-8 min-w-8 min-h-8 shrink-0 rounded-full border-2 flex items-center justify-center ${
                          selectedColor === color.value
                            ? "border-gray-300 md:border-gray-800"
                            : "border-transparent"
                        } ${color.class}`}
                        onClick={() => setValue("selectedColor", color.value)}
                        aria-label={`Select ${color.name} color`}
                      >
                        {selectedColor === color.value && (
                          <CheckIcon className="h-5 w-5 text-white" />
                        )}
                      </button>
                      {/* Optional empty caption space for alignment (if needed) */}
                      <span className="invisible text-xs">.</span>
                    </div>
                  ))}

                  {/* Custom picker + caption */}
                  <div className="flex flex-col items-center w-9">
                    <Controller
                      name="selectedColor"
                      control={control}
                      render={({ field }) => (
                        <div
                          className="size-8 rounded-full border-2 border-white overflow-hidden cursor-pointer"
                          style={{
                            backgroundImage: `conic-gradient(
                              red 0deg 45deg,
                              orange 45deg 90deg,
                              yellow 90deg 135deg,
                              green 135deg 180deg,
                              cyan 180deg 225deg,
                              blue 225deg 270deg,
                              indigo 270deg 315deg,
                              violet 315deg 360deg
                            )`
                          }}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "color";
                            input.value = field.value;
                            input.onchange = (e) => field.onChange((e.target as HTMLInputElement).value);
                            input.click();
                          }}
                        />
                      )}
                    />
                    <span className="text-xs text-gray-300 md:text-gray-500 mt-[2px]">Custom</span>
                  </div>
                </div>
              </div>
              {/* Template selector subsection - full width */}
                <div className="relative border border-gray-500 rounded-md p-4 mb-4 mt-2 w-full">
                  <div className="absolute -top-3 left-4 bg-gray-600 px-2 text-sm text-white">
                      Select a Template
                  </div>
                  <div className="relative w-full rounded-xl overflow-hidden">
                      {/* Left scroll indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0a23] md:from-gray-100 to-transparent z-10 pointer-events-none flex items-center justify-start pl-1">
                      <ChevronLeftIcon className="h-6 w-6 text-gray-300 md:text-gray-500 animate-pulse" />
                      </div>

                      {/* Right scroll indicator */}
                      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0a23] md:from-gray-100 to-transparent z-10 pointer-events-none flex items-center justify-end pr-1">
                      <ChevronRightIcon className="h-6 w-6 text-gray-300 md:text-gray-500 animate-pulse" />
                      </div>

                      <ScrollArea className="w-full h-[170px] rounded-lg">
                      <div className="flex space-x-4 px-8 py-1 min-w-max flex-nowrap">
                          {templates.map((template) => (
                          <div
                              key={template.slug}
                              onClick={() => setSelectedTemplate(template)}
                              className={`p-3 rounded-lg cursor-pointer transition-all w-[160px] h-[150px] flex flex-col ${
                              selectedTemplate.slug === template.slug
                                  ? "bg-gray-800 text-white ring-2 ring-green-500"
                                  : "bg-[#1a1a3a] hover:bg-[#2a2a4a] md:bg-white md:hover:bg-gray-100 border border-gray-700 md:border-gray-200"
                              }`}
                          >
                              <div className="font-medium truncate">
                              {template.name}
                              </div>
                              <div className="text-xs mt-1 line-clamp-2 flex-grow text-gray-300 md:text-gray-800">
                              {template.description}
                              </div>
                              <div
                              className={`text-xs mt-1 font-semibold ${
                                  selectedTemplate.slug === template.slug
                                  ? "text-green-300"
                                  : "text-green-400 md:text-green-600"
                              }`}
                              >
                              {template.size.label}
                              </div>
                              <div
                              className={`text-xs mt-1 ${
                                  selectedTemplate.slug === template.slug
                                  ? "text-gray-300"
                                  : "text-gray-400 md:text-gray-500"
                              }`}
                              >
                              {template.size.width}×{template.size.height}px
                              </div>
                          </div>
                          ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                  </div>
                </div>  
          </Card>
        </div>

        {/* Right Column: Poster Preview */}
        <div className="w-full md:w-1/2 flex flex-col">
          <form onSubmit={onSubmit} className="space-y-4 w-full">
            <Card className="relative bg-white dark:bg-[#0a0a23] border border-green-500 rounded-md px-2 sm:px-3 pt-6 pb-3 w-full">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 text-center bg-white dark:bg-[#0a0a23]">
                <p className="font-handwriting text-xl text-gray-700 dark:text-white whitespace-nowrap relative">
                  A Preview of your Poster
                </p>
              </div>
              <div className="w-full flex flex-col items-center justify-center overflow-x-auto">
                {/* Poster Container */}
                <div className="w-full max-w-lg">
                  {/* QR Code Block */}
                  <div className="w-full flex justify-center">
                      <div
                      className="bg-white border-l-8 border-r-8 border-t-0 border-gray-800 flex flex-col w-full"
                      style={{
                          maxWidth: `${selectedTemplate.size.width}px`,
                      }}
                      >
                      {/* Header Section */}
                      <div
                          className="w-full flex items-center justify-center py-4 px-2"
                          style={{
                          backgroundColor: selectedColor,
                          borderTop: "8px solid #1a2335",
                          minHeight: "70px",
                          borderBottom: "8px solid #1a2335",
                          }}
                      >
                          <p
                          className="text-center font-bold text-white whitespace-nowrap w-full overflow-hidden break-words px-2"
                          style={{
                              fontSize: "clamp(1.25rem, 4vw, 2rem)",
                          }}
                          >
                          SCAN TO PAY!
                          </p>
                      </div>

                      {/* QR Code Section */}
                      <div className="w-full p-3" style={{ aspectRatio: "1/1" }}>
                          {previewQrData ? (
                          <QrSvg
                              value={previewQrData}
                              className="qr-code-svg w-full h-full"
                              fgColor="#000000"
                          />
                          ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                              Generating QR code...
                          </div>
                          )}
                      </div>
                      </div>
                  </div>

                  {/* Poster Grid Section */}
                  <div
                      id="poster"
                      ref={posterRef}
                      className="grid bg-white w-full shadow-lg overflow-hidden border-8 border-gray-800"
                      style={{
                      gridTemplateRows: getGridTemplateRows(title, showName),
                      aspectRatio: `${selectedTemplate.size.width} / ${selectedTemplate.size.height}`,
                      height: '1200',
                      minHeight: calculatePosterMinHeight(title, showName),
                      }}
                  >
                      {/* Title Section */}
                      <div 
                          className="flex flex-col items-center justify-center px-2" 
                          style={{ 
                          backgroundColor: selectedColor,
                          minHeight: "80px",
                          padding: "0.5rem 0"
                          }}>
                      <div 
                          className="font-bold w-full py-1 text-center text-white"
                          style={{ fontSize: "clamp(0.875rem, 3vw, 1.125rem)" }}
                      >
                          Transaction
                      </div>
                      <h2 
                          className="font-bold text-white text-center px-2 w-full break-words"
                          style={{ fontSize: "clamp(1.25rem, 4vw, 1.75rem)" }}
                      >
                          {title.toUpperCase()}
                      </h2>
                      </div>

                      {/* Middle Sections */}
                      {renderMiddleSections(title, selectedColor, showName)}

                      {/* Optional Name Section */}
                      {showName && (
                      <div
                          className="flex flex-col items-center justify-center px-2"
                          style={{
                          backgroundColor: getSectionColors(title, showName)[getSectionCount(title, showName) - 1],
                          minHeight: "80px",
                          padding: "0.5rem 0",
                          borderTop: "8px solid #1a2335"
                          }}
                      >
                          <div 
                          className="font-bold w-full py-1 text-center"
                          style={{ 
                              color: getSectionColors(title, showName)[getSectionCount(title, showName) - 1] === selectedColor ? "#ffffff" : "#000000",
                              fontSize: "clamp(0.875rem, 3vw, 1.125rem)"
                          }}
                          >
                          Business Name
                          </div>
                          <div 
                          className="font-bold text-center px-2 w-full break-words"
                          style={{ 
                              color: getSectionColors(title, showName)[getSectionCount(title, showName) - 1] === selectedColor ? "#ffffff" : "#000000",
                              fontSize: "clamp(1rem, 4vw, 1.5rem)"
                          }}
                          >
                          {businessName || "NELSON ANANGWE"}
                          </div>
                      </div>
                      )}
                  </div>
                  </div>
              </div>

              {/* Share & Download Buttons */}
              <div className="flex flex-row mt-4 w-full gap-2 items-center">
                <div className="flex flex-row mt-4 w-full gap-2 items-center">
                      <motion.div whileHover={{ scale: 1.03 }} className="flex-1 min-w-[120px]">
                        <Button
                          type="button"
                          onClick={handleShare}
                          className="w-full bg-blue-600 text-white text-sm font-bold py-4 px-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                          disabled={!isValid}
                        >
                          <HiOutlineShare className="size-5 mr-1" />
                          <span>Share</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.03 }} className="flex-1 min-w-[120px]">
                        <Button
                          type="submit"
                          className="w-full bg-gray-800 text-white text-sm font-bold py-4 px-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                          disabled={!isValid}
                        >
                          <HiOutlineDownload className="size-5 mr-1" />
                          <span>Download</span>
                        </Button>
                      </motion.div>
                    </div>
              </div>
            </Card>
          </form>
        </div>
      </div>  
      </div>
  );
}

export default PosterPage;