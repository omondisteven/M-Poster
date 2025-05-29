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

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});

export default function SettingsPage() {
  const { data, setData } = useAppContext();
  const [darkMode, setDarkMode] = useState(false);
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
    try {
      await setData({
        ...defaultValues
      });
      alert("Defaults saved successfully!");
    } catch (error) {
      console.error("Error saving defaults:", error);
      alert("Failed to save defaults. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Payment Values</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paybillNumber">Paybill Number</Label>
            <Input
              id="paybillNumber"
              name="paybillNumber"
              value={defaultValues.paybillNumber}
              onChange={handleInputChange}
              placeholder="123456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              value={defaultValues.accountNumber}
              onChange={handleInputChange}
              placeholder="Account number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tillNumber">Till Number</Label>
            <Input
              id="tillNumber"
              name="tillNumber"
              value={defaultValues.tillNumber}
              onChange={handleInputChange}
              placeholder="123456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeNumber">Store Number</Label>
            <Input
              id="storeNumber"
              name="storeNumber"
              value={defaultValues.storeNumber}
              onChange={handleInputChange}
              placeholder="Store number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agentNumber">Agent Number</Label>
            <Input
              id="agentNumber"
              name="agentNumber"
              value={defaultValues.agentNumber}
              onChange={handleInputChange}
              placeholder="Agent number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={defaultValues.phoneNumber}
              onChange={handleInputChange}
              placeholder="0722123456"
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleSaveDefaults} className="w-full">
              Save Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}