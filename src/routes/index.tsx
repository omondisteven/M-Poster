import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  GithubIcon,
  LockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { ColorPicker } from "@/components/ui/color-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import templates from "@/data/templates.json";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';

// Define zod schema for validation
const formSchema = z
  .object({
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").optional(),
    name: z.string().optional(),
    selectedColor: z.string(),
    showName: z.boolean(),
    title: z.string().min(1, "Title cannot be empty"),
    businessNumber: z.string().optional(),
    businessNumberLabel: z.string().optional(),
    accountNumber: z.string().optional(),
    accountNumberLabel: z.string().optional(),
    tillNumber: z.string().optional(),
    tillNumberLabel: z.string().optional(),
    agentNumber: z.string().optional(),
    agentNumberLabel: z.string().optional(),
    storeNumber: z.string().optional(),
    storeNumberLabel: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Name is only required when showName is true AND title is Send Money
    if (data.showName && data.title === "Send Money" && !data.name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name is required when 'Show Name' is enabled for Send Money",
        path: ["name"],
      });
    }

    // Validate based on transaction type
    switch (data.title) {
      case "Send Money":
        if (!data.phoneNumber?.trim() || data.phoneNumber.trim().length < 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Phone number is required for Send Money",
            path: ["phoneNumber"],
          });
        }
        break;
      
      case "Pay Bill":
        if (!data.businessNumber?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Business number is required for Pay Bill",
            path: ["businessNumber"],
          });
        }
        if (!data.accountNumber?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Account number is required for Pay Bill",
            path: ["accountNumber"],
          });
        }
        break;
      
      case "Buy Goods":
        if (!data.tillNumber?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Till number is required for Buy Goods",
            path: ["tillNumber"],
          });
        }
        break;
      
      case "Withdraw Money":
        if (!data.agentNumber?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Agent number is required for Withdraw Money",
            path: ["agentNumber"],
          });
        }
        if (!data.storeNumber?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Store number is required for Withdraw Money",
            path: ["storeNumber"],
          });
        }
        break;
    }
  });

// Define form type
interface FormValues {
  phoneNumber?: string;
  phoneNumberLabel?: string;
  businessNumber?: string;
  businessNumberLabel?: string;
  accountNumber?: string;
  accountNumberLabel?: string;
  tillNumber?: string;
  tillNumberLabel?: string;
  agentNumber?: string;
  agentNumberLabel?: string;
  storeNumber?: string;
  storeNumberLabel?: string;
  name?: string;
  selectedColor: string;
  showName: boolean;
  title: string;
}

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const posterRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      phoneNumberLabel: "Phone Number",
      businessNumber: "",
      businessNumberLabel: "Business Number",
      accountNumber: "",
      accountNumberLabel: "Account Number",
      tillNumber: "",
      tillNumberLabel: "Till Number",
      agentNumber: "",
      agentNumberLabel: "Agent Number",
      storeNumber: "",
      storeNumberLabel: "Store Number",
      name: "",
      selectedColor: "#16a34a",
      showName: true,
      title: "Send Money",
    },
    mode: "onChange",
  });

  const phoneNumber = watch("phoneNumber");
  const name = watch("name");
  const selectedColor = watch("selectedColor");
  const showName = watch("showName");
  const title = watch("title");
  const businessNumber = watch("businessNumber");
  const accountNumber = watch("accountNumber");
  const tillNumber = watch("tillNumber");
  const agentNumber = watch("agentNumber");
  const storeNumber = watch("storeNumber");
  const businessNumberLabel = watch("businessNumberLabel");
  const accountNumberLabel = watch("accountNumberLabel");
  const tillNumberLabel = watch("tillNumberLabel");
  const agentNumberLabel = watch("agentNumberLabel");
  const storeNumberLabel = watch("storeNumberLabel");

  const colorOptions = [
    { name: "Green", value: "#16a34a", class: "bg-green-600" },
    { name: "Rose", value: "#be123c", class: "bg-rose-700" },
    { name: "Yellow", value: "#F7C50C", class: "bg-[#F7C50C]" },
    { name: "Blue", value: "#1B398E", class: "bg-blue-800" },
  ];

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    const match = numbers.match(/^(\d{4})(\d{3})(\d{3})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return value;
  };

  const onSubmit = handleSubmit(async () => {
    await handleDownload();
  });

  const handleDownload = async () => {
    if (!posterRef.current) return;

    try {
        await document.fonts.load("bold 120px Inter");

        const canvas = document.createElement("canvas");
        const width = selectedTemplate.size.width;
        
        // Calculate dynamic height based on content
        const posterHeight = selectedTemplate.size.height;
        const qrCodePadding = 20;
        const qrCodeWidth = width - (qrCodePadding * 2);
        
        // Calculate total height:
        const qrSectionHeight = qrCodeWidth + 100;
        const totalHeight = posterHeight + 40 + qrSectionHeight;
        
        canvas.width = width;
        canvas.height = totalHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            console.error("Unable to get canvas context");
            return;
        }

        // Colors
        const mainColor = selectedColor;
        const borderColor = "#1a2335";
        const whiteColor = "#ffffff";
        const textColor = "#000000";
        const labelBgColor = "#1a2335";
        const borderSize = 8;

        // Adjust heights based on content
        const originalPosterHeight = posterHeight;
        let sectionCount = 2; // Default to 2 sections
        
        // Determine section count based on content
        if (showName && title === "Send Money") {
            sectionCount = 3;
        } else if (title === "Withdraw Money" || title === "Pay Bill") {
            sectionCount = 3; // For transaction types with multiple fields
        }
        
        const sectionHeight = originalPosterHeight / sectionCount;

        // Padding values
        const valueTopPadding = Math.round(sectionHeight * 0.1);
        const valueBottomPadding = Math.round(sectionHeight * 0.125);
        const labelHeight = Math.round(Math.min(width, originalPosterHeight) * 0.06) * 1.5;

        // Draw outer border for the main poster
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, width, originalPosterHeight);

        // Draw top section (colored with header)
        ctx.fillStyle = mainColor;
        ctx.fillRect(
            borderSize,
            borderSize,
            width - 2 * borderSize,
            sectionHeight - borderSize
        );

        // Draw middle section (white with details)
        ctx.fillStyle = whiteColor;
        ctx.fillRect(
            borderSize,
            sectionHeight + borderSize,
            width - 2 * borderSize,
            sectionHeight - 2 * borderSize
        );

        // Draw third section if needed (for name or additional fields)
        if (sectionCount === 3) {
            ctx.fillStyle = title === "Send Money" ? mainColor : whiteColor;
            ctx.fillRect(
                borderSize,
                2 * sectionHeight + borderSize,
                width - 2 * borderSize,
                sectionHeight - 2 * borderSize
            );
        }

        // Set text properties
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Font sizes
        const titleFontSize = Math.round(Math.min(width, originalPosterHeight) * 0.1);
        const labelFontSize = Math.round(Math.min(width, originalPosterHeight) * 0.06);
        const valueFontSize = Math.round(Math.min(width, originalPosterHeight) * 0.15);
        const nameFontSize = Math.round(Math.min(width, originalPosterHeight) * 0.1);

        // Draw Title text
        ctx.fillStyle = whiteColor;
        ctx.font = `bold ${titleFontSize}px Inter, sans-serif`;
        ctx.fillText(title.toUpperCase(), width / 2, sectionHeight / 2);

        // Draw content based on transaction type
        switch (title) {
            case "Send Money":
                ctx.fillStyle = textColor;
                ctx.font = `bold ${valueFontSize}px Inter, sans-serif`;
                ctx.fillText(
                    phoneNumber || "0712 345 678",
                    width / 2,
                    (showName ? originalPosterHeight / 2 : sectionHeight + (originalPosterHeight - sectionHeight) / 2) + valueTopPadding
                );
                break;
                
            case "Pay Bill":
                // Business Number Label (top section)
                ctx.fillStyle = labelBgColor;
                ctx.fillRect(
                    borderSize,
                    sectionHeight + sectionHeight * 0.15 - labelHeight/2,
                    width - 2 * borderSize,
                    labelHeight
                );
                ctx.fillStyle = whiteColor;
                ctx.font = `bold ${labelFontSize}px Inter, sans-serif`;
                ctx.fillText(businessNumberLabel || "BUSINESS NUMBER", width / 2, sectionHeight + sectionHeight * 0.15);
                
                // Business Number Value
                ctx.fillStyle = textColor;
                ctx.font = `bold ${valueFontSize}px Inter, sans-serif`;
                ctx.fillText(businessNumber || "12345", width / 2, sectionHeight + sectionHeight * 0.35 + valueTopPadding + valueBottomPadding);
                
                // Account Number Label (middle section)
                ctx.fillStyle = labelBgColor;
                ctx.fillRect(
                    borderSize,
                    2 * sectionHeight + sectionHeight * 0.15 - labelHeight/2,
                    width - 2 * borderSize,
                    labelHeight
                );
                ctx.fillStyle = whiteColor;
                ctx.font = `bold ${labelFontSize}px Inter, sans-serif`;
                ctx.fillText(accountNumberLabel || "ACCOUNT NUMBER", width / 2, 2 * sectionHeight + sectionHeight * 0.15);
                
                // Account Number Value
                ctx.fillStyle = textColor;
                ctx.font = `bold ${valueFontSize}px Inter, sans-serif`;
                ctx.fillText(accountNumber || "12345", width / 2, 2 * sectionHeight + sectionHeight * 0.35 + valueTopPadding + valueBottomPadding);
                break;
                
            case "Buy Goods":
                // Till Number Label (top section)
                ctx.fillStyle = labelBgColor;
                ctx.fillRect(
                    borderSize,
                    sectionHeight + sectionHeight * 0.15 - labelHeight/2,
                    width - 2 * borderSize,
                    labelHeight
                );
                ctx.fillStyle = whiteColor;
                ctx.font = `bold ${labelFontSize}px Inter, sans-serif`;
                ctx.fillText(tillNumberLabel || "TILL NUMBER", width / 2, sectionHeight + sectionHeight * 0.15);
                
                // Till Number Value
                ctx.fillStyle = textColor;
                ctx.font = `bold ${valueFontSize}px Inter, sans-serif`;
                ctx.fillText(tillNumber || "12345", width / 2, sectionHeight + sectionHeight * 0.35 + valueTopPadding + valueBottomPadding);
                break;
                
            case "Withdraw Money":
                // Agent Number Label (top section)
                ctx.fillStyle = labelBgColor;
                ctx.fillRect(
                    borderSize,
                    sectionHeight + sectionHeight * 0.15 - labelHeight/2,
                    width - 2 * borderSize,
                    labelHeight
                );
                ctx.fillStyle = whiteColor;
                ctx.font = `bold ${labelFontSize}px Inter, sans-serif`;
                ctx.fillText(agentNumberLabel || "AGENT NUMBER", width / 2, sectionHeight + sectionHeight * 0.15);
                
                // Agent Number Value
                ctx.fillStyle = textColor;
                ctx.font = `bold ${valueFontSize}px Inter, sans-serif`;
                ctx.fillText(agentNumber || "12345", width / 2, sectionHeight + sectionHeight * 0.35 + valueTopPadding + valueBottomPadding);
                
                // Store Number Label (middle section)
                ctx.fillStyle = labelBgColor;
                ctx.fillRect(
                    borderSize,
                    2 * sectionHeight + sectionHeight * 0.15 - labelHeight/2,
                    width - 2 * borderSize,
                    labelHeight
                );
                ctx.fillStyle = whiteColor;
                ctx.font = `bold ${labelFontSize}px Inter, sans-serif`;
                ctx.fillText(storeNumberLabel || "STORE NUMBER", width / 2, 2 * sectionHeight + sectionHeight * 0.15);
                
                // Store Number Value
                ctx.fillStyle = textColor;
                ctx.font = `bold ${valueFontSize}px Inter, sans-serif`;
                ctx.fillText(storeNumber || "12345", width / 2, 2 * sectionHeight + sectionHeight * 0.35 + valueTopPadding + valueBottomPadding);
                break;
        }

        // Draw name (only for Send Money when showName is true)
        if (showName && title === "Send Money") {
            ctx.fillStyle = whiteColor;
            ctx.font = `bold ${nameFontSize}px Inter, sans-serif`;
            ctx.fillText(name?.toUpperCase() || "JOHN DOE", width / 2, originalPosterHeight - sectionHeight / 2);
        }

        // QR Code Section
        const qrSectionY = originalPosterHeight + 40;

        // Draw outer border for QR code section
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, qrSectionY, width, qrSectionHeight);

        // Draw white background for QR code section
        ctx.fillStyle = whiteColor;
        ctx.fillRect(
            borderSize,
            qrSectionY + borderSize,
            width - 2 * borderSize,
            qrSectionHeight - 2 * borderSize
        );

        // Position QR code within the bordered section
        const qrCodeY = qrSectionY + borderSize + 20;

        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(generateQRCodeData(), {
            width: qrCodeWidth,
            margin: 0,
            color: {
                dark: selectedColor,
                light: whiteColor,
            },
            errorCorrectionLevel: 'H'
        });

        const qrCodeImg = new Image();
        qrCodeImg.src = qrCodeDataURL;
        await new Promise((resolve) => {
            qrCodeImg.onload = resolve;
        });
        ctx.drawImage(qrCodeImg, qrCodePadding, qrCodeY, qrCodeWidth, qrCodeWidth);
    
        // Add text inside the QR code bordered section
        ctx.fillStyle = textColor;
        ctx.font = ` ${Math.round(qrCodeWidth * 0.05)}px Inter, sans-serif`;
        ctx.fillText("Scan to get payment details", width / 2, qrCodeY + qrCodeWidth + 30);

        // Generate download link
        const dataUrl = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement("a");
        link.download = `send-ke-${title.toLowerCase().replace(/\s/g, "-")}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error generating image:", error);
    }
};
  
  // Generate QR code data based on the current form values
  const generateQRCodeData = () => {
    switch (title) {
      case "Send Money":
        return `Send Money to ${phoneNumber || "0712 345 678"}`;
      case "Pay Bill":
        return `Pay Bill\nBusiness: ${businessNumber || "12345"}\nAccount: ${accountNumber || "12345"}`;
      case "Buy Goods":
        return `Buy Goods\nTill: ${tillNumber || "12345"}`;
      case "Withdraw Money":
        return `Withdraw Money\nAgent: ${agentNumber || "12345"}\nStore: ${storeNumber || "12345"}`;
      default:
        return "Payment Information";
    }
  };

  return (
    <div className="flex flex-col bg-gray-100">
      <div className="flex-1 flex flex-col md:flex-row px-4 py-4 sm:py-8 md:py-0 sm:px-6 lg:px-8 gap-8 relative z-10">
        {/* Left Column - App Info */}
        <div className="w-full md:w-1/2 flex flex-col justify-center md:py-12 md:px-8">
          {/* Header for medium screens and up - now in left column */}
          <div className="hidden md:block mb-8">
            <h1 className="text-4xl font-display font-bold text-green-600">
              send.ke
            </h1>
            <h3 className="text-lg font-display text-gray-800 mt-2 max-w-md">
              Your Phone Number 🤝 Payment Poster
            </h3>
          </div>

          {/* App features */}
          <div className="flex flex-row gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center border border-green-100 hover:border-green-400 cursor-pointer">
              <CheckIcon className="w-5 h-5 text-green-600 mr-1" />
              <span className="text-sm text-gray-700">100% Free</span>
            </div>
            <div className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center border border-blue-100 hover:border-blue-400 cursor-pointer">
              <LockIcon className="w-5 h-5 text-blue-600 mr-1" />
              <span className="text-sm text-gray-700">Works Offline</span>
            </div>
            <div className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center border border-purple-100 hover:border-purple-400 cursor-pointer">
              <GithubIcon className="w-5 h-5 text-purple-600 mr-1" />
              <a
                href="https://github.com/DavidAmunga/sendke"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Open Source
              </a>
            </div>
          </div>

          <Card className="">
            <CardTitle className="px-6 text-xl  font-bold text-gray-900">
              Make Your Payment Poster
            </CardTitle>

            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Transaction Type
                  </label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold">
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Send Money">Send Money</SelectItem>
                          <SelectItem value="Pay Bill">Pay Bill</SelectItem>
                          <SelectItem value="Buy Goods">Buy Goods</SelectItem>
                          <SelectItem value="Withdraw Money">Withdraw Money</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {title === "Send Money" && (
                  <>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="phone"
                            type="text"
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 10) {
                                field.onChange(formatPhoneNumber(value));
                              }
                            }}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                            placeholder="0712 345 678"
                          />
                        )}
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.phoneNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
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
                          />
                        )}
                      />
                      <label
                        htmlFor="showName"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Show Name Field
                      </label>
                    </div>

                    {showName && (
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Your Name
                        </label>
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <Input
                              id="name"
                              type="text"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.value.toUpperCase());
                              }}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                              placeholder="JOHN DOE"
                            />
                          )}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {title === "Pay Bill" && (
                  <>
                    <div>
                      <label
                        htmlFor="businessNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Business Number
                      </label>
                      <Controller
                        name="businessNumber"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="businessNumber"
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                            placeholder="12345"
                          />
                        )}
                      />
                      {errors.businessNumber && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.businessNumber.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="accountNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Account Number
                      </label>
                      <Controller
                        name="accountNumber"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="accountNumber"
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                            placeholder="12345"
                          />
                        )}
                      />
                      {errors.accountNumber && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.accountNumber.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {title === "Buy Goods" && (
                  <div>
                    <label
                      htmlFor="tillNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Till Number
                    </label>
                    <Controller
                      name="tillNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="tillNumber"
                          type="text"
                          value={field.value}
                          onChange={field.onChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                          placeholder="12345"
                        />
                      )}
                    />
                    {errors.tillNumber && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.tillNumber.message}
                      </p>
                    )}
                  </div>
                )}

                {title === "Withdraw Money" && (
                  <>
                    <div>
                      <label
                        htmlFor="agentNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Agent Number
                      </label>
                      <Controller
                        name="agentNumber"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="agentNumber"
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                            placeholder="12345"
                          />
                        )}
                      />
                      {errors.agentNumber && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.agentNumber.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="storeNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Store Number
                      </label>
                      <Controller
                        name="storeNumber"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="storeNumber"
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold"
                            placeholder="12345"
                          />
                        )}
                      />
                      {errors.storeNumber && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.storeNumber.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Poster Color
                  </label>
                  <div className="flex items-center space-x-4">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`size-8 rounded-full border-2 flex items-center justify-center ${
                          selectedColor === color.value
                            ? "border-gray-800"
                            : "border-transparent"
                        } ${color.class}`}
                        onClick={() => setValue("selectedColor", color.value)}
                        aria-label={`Select ${color.name} color`}
                      >
                        {selectedColor === color.value && (
                          <CheckIcon className="h-5 w-5 text-white" />
                        )}
                      </button>
                    ))}
                    <div className="flex items-center">
                      <Controller
                        name="selectedColor"
                        control={control}
                        render={({ field }) => (
                          <ColorPicker
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            className="size-8 rounded-full"
                          />
                        )}
                      />
                      <span className="ml-2 text-xs text-gray-500">Custom</span>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    transition: {
                      duration: 0.2,
                    },
                  }}
                >
                  <Button
                    type="submit"
                    // disabled={!isValid}
                    className="w-full bg-gray-800 text-white text-xl font-bold py-8 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    DOWNLOAD
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-gray-500 mt-2 text-sm">
            Download It, Share It , Stick it anywhere !
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center justify-center md:py-12">
          <div className="w-full max-w-lg">
            {/* Poster Preview */}
            <div
              id="poster"
              ref={posterRef}
              className="grid bg-white w-full shadow-lg overflow-hidden border-8 border-gray-800"
              style={{
                gridTemplateRows: showName && title === "Send Money" ? "1fr 1fr 1fr" : "1fr 1fr",
                aspectRatio: `${selectedTemplate.size.width} / ${selectedTemplate.size.height}`,
                maxHeight: "400px",
              }}
             >
              {/* Title Section */}
              <div className="flex items-center justify-center px-4 sm:px-6" style={{ backgroundColor: selectedColor }}>
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">{title.toUpperCase()}</h2>
              </div>

              {/* Details Section */}
              <div
                className="bg-white flex flex-col items-center justify-center px-4 sm:px-6"
                style={{
                  borderTop: "8px solid #1a2335",
                  borderBottom: showName && title === "Send Money" ? "8px solid #1a2335" : "none",
                }}
              >
                {/* Display Content Based on Transaction Type */}
                {title === "Send Money" && (
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center">
                    {phoneNumber || "0712 345 678"}
                  </div>
                )}

                {title === "Pay Bill" && (
                  <div className="w-full space-y-2">
                    {/* Business Number */}
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-white bg-gray-800 w-full px-4 py-2 text-center">Business Number</div>
                      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center pb-2 border-b-2 border-gray-300">
                        {businessNumber || "12345"}
                      </div>
                    </div>
                    {/* Account Number */}
                    <div className="space-y-1 pt-2">
                      <div className="text-lg font-bold text-white bg-gray-800 w-full px-4 py-2 text-center">Account Number</div>
                      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center pb-2 border-b-2 border-gray-300">
                        {accountNumber || "67890"}
                      </div>
                    </div>
                  </div>
                )}

                {title === "Buy Goods" && (
                  <div className="w-full space-y-1">
                    <div className="text-lg font-bold text-white bg-gray-800 w-full px-4 py-2 text-center">Till Number</div>
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center pb-2 border-b-2 border-gray-300">
                      {tillNumber || "54321"}
                    </div>
                  </div>
                )}

                {title === "Withdraw Money" && (
                  <div className="w-full space-y-2">
                    {/* Agent Number */}
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-white bg-gray-800 w-full px-4 py-2 text-center">Agent Number</div>
                      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center pb-2 border-b-2 border-gray-300">
                        {agentNumber || "98765"}
                      </div>
                    </div>
                    {/* Store Number */}
                    <div className="space-y-1 pt-2">
                      <div className="text-lg font-bold text-white bg-gray-800 w-full px-4 py-2 text-center">Store Number</div>
                      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center pb-2 border-b-2 border-gray-300">
                        {storeNumber || "24680"}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Name Section */}
              {showName && title === "Send Money" && (
                <div className="flex items-center justify-center px-4 sm:px-6" style={{ backgroundColor: selectedColor }}>
                  <div className="text-2xl sm:text-3xl font-bold text-white text-center">{name || "JOHN DOE"}</div>
                </div>
              )}
            </div>

            {/* QR Code Component */}
            <div className="grid bg-white w-full shadow-lg overflow-hidden border-8 border-gray-800">
              <div className="bg-white p-4 rounded-lg border border-gray-300 w-full" style={{ maxWidth: `${selectedTemplate.size.width}px` }}>
                <div className="w-full" style={{ aspectRatio: "1/1" }}>
                  <QRCodeSVG
                    value={generateQRCodeData()}
                    width="100%"
                    height="100%"
                    level="H"
                    fgColor={selectedColor}
                    style={{ display: 'block', width: '100%', height: 'auto' }}
                  />
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">Scan to get payment details</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-start justify-center text-center mt-2">
            <p className="font-handwriting text-2xl text-gray-600 z-10">
              Preview of your poster
            </p>
          </div>

          {/* Template Selector */}
          <div className="w-full max-w-lg mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              Select Template Size
              <span className="ml-2 text-xs text-gray-500 italic">
                (scroll horizontally to see more)
              </span>
            </h3>
            <div className="relative w-full rounded-xl overflow-hidden">
              {/* Left scroll indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-100 to-transparent z-10 pointer-events-none flex items-center justify-start pl-1">
                <ChevronLeftIcon className="h-6 w-6 text-gray-500 animate-pulse" />
              </div>

              {/* Right scroll indicator */}
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-100 to-transparent z-10 pointer-events-none flex items-center justify-end pr-1">
                <ChevronRightIcon className="h-6 w-6 text-gray-500 animate-pulse" />
              </div>

              <ScrollArea className="w-full h-[170px] rounded-lg">
                <div className="flex space-x-4 px-8 py-1 min-w-max">
                  {templates.map((template) => (
                    <div
                      key={template.slug}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-3 rounded-lg cursor-pointer transition-all w-[160px] h-[150px] flex flex-col ${
                        selectedTemplate.slug === template.slug
                          ? "bg-gray-800 text-white ring-2 ring-green-500"
                          : "bg-white hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="font-medium truncate">
                        {template.name}
                      </div>
                      <div className="text-xs mt-1 line-clamp-2 flex-grow">
                        {template.description}
                      </div>
                      <div
                        className={`text-xs mt-1 font-semibold ${
                          selectedTemplate.slug === template.slug
                            ? "text-green-300"
                            : "text-green-600"
                        }`}
                      >
                        {template.size.label}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          selectedTemplate.slug === template.slug
                            ? "text-gray-300"
                            : "text-gray-500"
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
        </div>
      </div>

      {/* Twitter CTA for Template Contributions */}
      <div className="w-full py-4 bg-blue-50 border-t border-blue-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-500 mr-2"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
              <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
            </svg>
            <span className="font-medium text-gray-700">
              Have a business that needs a template?
            </span>
          </div>
          <a
            href="https://x.com/davidamunga_"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
            Tweet @davidamunga_ to suggest new templates
          </a>
        </div>
      </div>
    </div>
  );
}