// src/components/SettingsPage.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { Switch } from "@/components/ui/switch";
import { TRANSACTION_TYPE } from "@/@types/TransactionType";
import { createFileRoute } from "@tanstack/react-router";
import toast from "react-hot-toast";

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});

export default function SettingsPage() {
  const { data, setData } = useAppContext();
  const [darkMode, setDarkMode] = useState(false);
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

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

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

  return (
    <div className="space-y-6 px-4 py-4 max-w-[100vw] overflow-x-hidden">
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle className="text-blue-600 text-lg sm:text-xl">Appearance</CardTitle>
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