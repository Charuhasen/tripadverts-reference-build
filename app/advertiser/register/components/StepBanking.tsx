import React, { useState } from "react";
import { RegistrationData, CountryCode } from "@/lib/schemas/registrationData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StepBanking({ 
  data, onNext, onBack 
}: { 
  data: RegistrationData; 
  onNext: (update: Partial<RegistrationData>) => void;
  onBack: () => void;
}) {
  const [bankingData, setBankingData] = useState<Record<string, any>>(data.banking || {});
  
  const updateField = (key: string, val: any) => {
    setBankingData(prev => ({ ...prev, [key]: val }));
  };

  const handleNext = () => {
    onNext({ banking: bankingData });
  };

  const country = data.country as CountryCode;

  const isComplete = true; // Disabled for testing

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Banking & Payment Info</h2>
        <p className="text-muted-foreground">Link your primary bank account for payouts and billing.</p>
      </div>

      <div className="space-y-6 pb-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" placeholder="e.g. Chase, Monzo, GTBank" value={bankingData.bankName || ''} onChange={(e) => updateField('bankName', e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="accountName">Account Holder Name</Label>
            <Input id="accountName" placeholder="John Doe" value={bankingData.accountName || ''} onChange={(e) => updateField('accountName', e.target.value)} />
          </div>

          {country === "US" && (
            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input id="routingNumber" placeholder="9 digits" value={bankingData.routingNumber || ''} onChange={(e) => updateField('routingNumber', e.target.value)} />
            </div>
          )}

          {country === "UK" && (
            <div className="space-y-2">
              <Label htmlFor="sortCode">Sort Code</Label>
              <Input id="sortCode" placeholder="12-34-56" value={bankingData.sortCode || ''} onChange={(e) => updateField('sortCode', e.target.value)} />
            </div>
          )}

          <div className={`space-y-2 ${country === "GH" || country === "NG" ? "md:col-span-2" : ""}`}>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input id="accountNumber" type="password" placeholder="Account Number" value={bankingData.accountNumber || ''} onChange={(e) => updateField('accountNumber', e.target.value)} />
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 mt-4">
          <p className="text-sm text-primary">
            <strong>Note:</strong> The bank account name must match your legal {data.accountType === "business" ? "business" : "individual"} name provided earlier. Payments to third-party accounts are not permitted.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 pt-6 border-t border-border flex justify-between">
        <Button variant="outline" size="lg" onClick={onBack} className="h-12 px-8">Back</Button>
        <Button 
          size="lg" 
          disabled={!isComplete}
          onClick={handleNext}
          className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
