// src/components/SettingsPage.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { Switch } from "@/components/ui/switch";
import { TRANSACTION_TYPE } from "@/@types/TransactionType";
import { createFileRoute } from "@tanstack/react-router";
import toast from "react-hot-toast";

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export default function SettingsPage() {
  const { data, setData } = useAppContext();
  const { darkMode, setDarkMode } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [defaultValues, setDefaultValues] = useState({
    paybillNumber: data.paybillNumber,
    accountNumber: data.accountNumber,
    tillNumber: data.tillNumber,
    storeNumber: data.storeNumber,
    agentNumber: data.agentNumber,
    phoneNumber: data.phoneNumber,
    type: data.type || TRANSACTION_TYPE.SEND_MONEY,
    color: data.color || "#16a34a"
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDefaultValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveDefaults = async () => {
    setIsSaving(true);
    try {
      setData({
        ...defaultValues
      });
      
      toast.success("Default values saved successfully!", {
        duration: 4000,
        position: "top-center",
      });
      
    } catch (error) {
      console.error("Error saving defaults:", error);
      toast.error("Failed to save default values. Please try again.", {
        duration: 4000,
        position: "top-center",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if there are changes to enable/disable save button
  const hasChanges = JSON.stringify(defaultValues) !== JSON.stringify({
    paybillNumber: data.paybillNumber,
    accountNumber: data.accountNumber,
    tillNumber: data.tillNumber,
    storeNumber: data.storeNumber,
    agentNumber: data.agentNumber,
    phoneNumber: data.phoneNumber,
    type: data.type,
    color: data.color
  });

  // Dark mode theme
  if (darkMode) {
    return (
      <div className="space-y-6 px-4 py-4 max-w-[100vw] overflow-x-hidden bg-[#0a0a23]">
        {/* Theme Card */}
        <Card className="relative bg-[#0a0a23] border border-green-500 rounded-md px-2 sm:px-3 pt-6 pb-3 w-full">
          <CardTitle className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0a23] px-2 sm:px-3 text-center">
            <p className="text-xl text-white whitespace-nowrap">
              Theme
            </p>
          </CardTitle>
          <CardContent className="pt-8">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-white">
                {isMobileDevice() ? "Light Mode" : "Dark Mode"}
              </Label>
              <Switch
                id="dark-mode"
                checked={isMobileDevice() ? !darkMode : darkMode}
                onCheckedChange={(checked) => {
                  setDarkMode(isMobileDevice() ? !checked : checked);
                }}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* PayBill Defaults */}
        <Card className="relative bg-[#0a0a23] border border-green-500 rounded-md px-2 sm:px-3 pt-6 pb-3 w-full">
          <CardTitle className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0a23] px-2 sm:px-3 text-center">
            <p className="text-xl text-white whitespace-nowrap">
              PayBill Defaults
            </p>
          </CardTitle>
          <CardContent className="pt-8 space-y-4">
            <div className="relative">
              <Input
                id="paybillNumber"
                name="paybillNumber"
                value={defaultValues.paybillNumber}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold bg-black text-white peer"
                placeholder=" "
              />
              <Label 
                htmlFor="paybillNumber" 
                className={`absolute left-3 transition-all pointer-events-none bg-black px-1 ${
                  defaultValues.paybillNumber
                    ? "-top-2 text-xs text-green-500 bg-black"
                    : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500 peer-focus:bg-black"
                }`}
              >
                Paybill Number
              </Label>
            </div>

            <div className="relative">
              <Input
                id="accountNumber"
                name="accountNumber"
                value={defaultValues.accountNumber}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold bg-black text-white peer"
                placeholder=" "
              />
              <Label 
                htmlFor="accountNumber" 
                className={`absolute left-3 transition-all pointer-events-none bg-black px-1 ${
                  defaultValues.accountNumber
                    ? "-top-2 text-xs text-green-500 bg-black"
                    : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500 peer-focus:bg-black"
                }`}
              >
                Account Number
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Buy Goods Defaults */}
        <Card className="relative bg-[#0a0a23] border border-green-500 rounded-md px-2 sm:px-3 pt-6 pb-3 w-full">
          <CardTitle className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0a23] px-2 sm:px-3 text-center">
            <p className="text-xl text-white whitespace-nowrap">
              Buy Goods Defaults
            </p>
          </CardTitle>
          <CardContent className="pt-8 space-y-4">
            <div className="relative">
              <Input
                id="tillNumber"
                name="tillNumber"
                value={defaultValues.tillNumber}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold bg-black text-white peer"
                placeholder=" "
              />
              <Label 
                htmlFor="tillNumber" 
                className={`absolute left-3 transition-all pointer-events-none bg-black px-1 ${
                  defaultValues.tillNumber
                    ? "-top-2 text-xs text-green-500 bg-black"
                    : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500 peer-focus:bg-black"
                }`}
              >
                Till Number
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Withdraw Money Defaults */}
        <Card className="relative bg-[#0a0a23] border border-green-500 rounded-md px-2 sm:px-3 pt-6 pb-3 w-full">
          <CardTitle className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0a23] px-2 sm:px-3 text-center">
            <p className="text-xl text-white whitespace-nowrap">
              Withdraw Money Defaults
            </p>
          </CardTitle>
          <CardContent className="pt-8 space-y-4">
            <div className="relative">
              <Input
                id="agentNumber"
                name="agentNumber"
                value={defaultValues.agentNumber}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold bg-black text-white peer"
                placeholder=" "
              />
              <Label 
                htmlFor="agentNumber" 
                className={`absolute left-3 transition-all pointer-events-none bg-black px-1 ${
                  defaultValues.agentNumber
                    ? "-top-2 text-xs text-green-500 bg-black"
                    : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500 peer-focus:bg-black"
                }`}
              >
                Agent Number
              </Label>
            </div>

            <div className="relative">
              <Input
                id="storeNumber"
                name="storeNumber"
                value={defaultValues.storeNumber}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold bg-black text-white peer"
                placeholder=" "
              />
              <Label 
                htmlFor="storeNumber" 
                className={`absolute left-3 transition-all pointer-events-none bg-black px-1 ${
                  defaultValues.storeNumber
                    ? "-top-2 text-xs text-green-500 bg-black"
                    : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500 peer-focus:bg-black"
                }`}
              >
                Store Number
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Send Money Defaults */}
        <Card className="relative bg-[#0a0a23] border border-green-500 rounded-md px-2 sm:px-3 pt-6 pb-3 w-full">
          <CardTitle className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0a23] px-2 sm:px-3 text-center">
            <p className="text-xl text-white whitespace-nowrap">
              Send Money Defaults
            </p>
          </CardTitle>
          <CardContent className="pt-8 space-y-4">
            <div className="relative">
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={defaultValues.phoneNumber}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-lg font-semibold bg-black text-white peer"
                placeholder=" "
              />
              <Label 
                htmlFor="phoneNumber" 
                className={`absolute left-3 transition-all pointer-events-none bg-black px-1 ${
                  defaultValues.phoneNumber
                    ? "-top-2 text-xs text-green-500 bg-black"
                    : "top-1/2 -translate-y-1/2 text-base text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-green-500 peer-focus:bg-black"
                }`}
              >
                Phone Number
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4">
          <Button 
            onClick={handleSaveDefaults} 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? "Saving..." : "Save All Defaults"}
          </Button>
        </div>
      </div>
    );
  }

  // Light mode theme
  return (
    <div className="space-y-6 px-4 py-4 max-w-[100vw] overflow-x-hidden">
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle className="text-blue-600 text-lg sm:text-xl">Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-gray-500">Dark Mode</Label>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* PayBill Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">PayBill Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paybillNumber" className="text-gray-500">Paybill Number</Label>
            <Input
              id="paybillNumber"
              name="paybillNumber"
              value={defaultValues.paybillNumber}
              onChange={handleInputChange}
              placeholder="123456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-gray-500">Account Number</Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              value={defaultValues.accountNumber}
              onChange={handleInputChange}
              placeholder="Account number"
            />
          </div>
        </CardContent>
      </Card>

      {/* Buy Goods Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">Buy Goods Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tillNumber" className="text-gray-500">Till Number</Label>
            <Input
              id="tillNumber"
              name="tillNumber"
              value={defaultValues.tillNumber}
              onChange={handleInputChange}
              placeholder="123456"
            />
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Money Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">Withdraw Money Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentNumber" className="text-gray-500">Agent Number</Label>
            <Input
              id="agentNumber"
              name="agentNumber"
              value={defaultValues.agentNumber}
              onChange={handleInputChange}
              placeholder="Agent number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeNumber" className="text-gray-500">Store Number</Label>
            <Input
              id="storeNumber"
              name="storeNumber"
              value={defaultValues.storeNumber}
              onChange={handleInputChange}
              placeholder="Store number"
            />
          </div>
        </CardContent>
      </Card>

      {/* Send Money Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">Send Money Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-gray-500">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={defaultValues.phoneNumber}
              onChange={handleInputChange}
              placeholder="0722123456"
            />
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button 
          onClick={handleSaveDefaults} 
          className="w-full"
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? "Saving..." : "Save All Defaults"}
        </Button>
      </div>
    </div>
  );
}