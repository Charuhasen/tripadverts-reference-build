import React, { useState } from "react";
import { RegistrationData, COUNTRY_OPTIONS, CountryCode, AccountType } from "@/lib/schemas/registrationData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Building2, User } from "lucide-react";

export function StepAccountType({ 
  data, onNext 
}: { 
  data: RegistrationData; 
  onNext: (update: Partial<RegistrationData>) => void 
}) {
  const [country, setCountry] = useState<CountryCode | "">(data.country);
  const [accountType, setAccountType] = useState<AccountType | "">(data.accountType);

  const isComplete = true; // Validation removed for testing

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Let's get started</h2>
        <p className="text-muted-foreground">First, tell us where you're located and how you want to use the platform.</p>
      </div>

      <div className="space-y-6 pb-4">
        {/* Country Selection */}
        <div className="space-y-3">
          <Label htmlFor="country" className="text-base text-foreground">Country of Registration</Label>
          <Select value={country} onValueChange={(val) => setCountry(val as CountryCode)}>
            <SelectTrigger id="country" className="w-full text-base h-12 bg-background border-border">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-base cursor-pointer">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Requirements will adapt based on the selected region.</p>
        </div>

        {/* Account Type Selection */}
        <div className="space-y-4">
          <Label className="text-base text-foreground">Account Type</Label>
          <RadioGroup 
            value={accountType} 
            onValueChange={(val) => setAccountType(val as AccountType)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Individual Card */}
            <Label 
              htmlFor="type-individual"
              className={`[&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 cursor-pointer rounded-xl border-2 border-border bg-card p-4 hover:border-primary/50 transition-all ${accountType === "individual" ? "shadow-md shadow-primary/10" : ""}`}
            >
              <RadioGroupItem value="individual" id="type-individual" className="sr-only" />
              <div className="flex flex-col space-y-3">
                <div className="p-3 bg-primary/10 w-fit rounded-lg">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-foreground text-lg">Individual</div>
                  <p className="text-sm font-normal text-muted-foreground leading-snug">
                    I am registering as an individual content creator or sole advertiser.
                  </p>
                </div>
              </div>
            </Label>

            {/* Business Card */}
            <Label 
              htmlFor="type-business"
              className={`[&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 cursor-pointer rounded-xl border-2 border-border bg-card p-4 hover:border-primary/50 transition-all ${accountType === "business" ? "shadow-md shadow-primary/10" : ""}`}
            >
              <RadioGroupItem value="business" id="type-business" className="sr-only" />
              <div className="flex flex-col space-y-3">
                <div className="p-3 bg-primary/10 w-fit rounded-lg">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-foreground text-lg">Registered Business</div>
                  <p className="text-sm font-normal text-muted-foreground leading-snug">
                    I am registering an incorporated entity or officially registered business.
                  </p>
                </div>
              </div>
            </Label>
          </RadioGroup>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 pt-6 border-t border-border flex justify-end">
        <Button 
          size="lg" 
          disabled={!isComplete}
          onClick={() => onNext({ country: country || "US", accountType: accountType || "individual" })}
          className="w-full sm:w-auto h-12 px-8 text-base transition-all bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
