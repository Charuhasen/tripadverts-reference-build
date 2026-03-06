import React, { useState } from "react";
import { RegistrationData, CountryCode } from "@/lib/schemas/registrationData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/FileUpload";

export function StepIdentity({ 
  data, onNext, onBack 
}: { 
  data: RegistrationData; 
  onNext: (update: Partial<RegistrationData>) => void;
  onBack: () => void;
}) {
  const [identityData, setIdentityData] = useState<Record<string, any>>(data.identity || {});
  const [agreement, setAgreement] = useState(false);

  const updateField = (key: string, val: any) => {
    setIdentityData(prev => ({ ...prev, [key]: val }));
  };

  const handleNext = () => {
    onNext({ identity: identityData });
  };

  const country = data.country as CountryCode;

  // Basic validation check - a real app would use proper validation
  const isComplete = true; // Disabled for testing

  const renderCountrySpecificFields = () => {
    switch(country) {
      case "GH":
        return (
          <>
            <div className="space-y-4 pt-4 border-t border-border w-full md:col-span-2">
              <h3 className="font-semibold text-foreground">Verification Documents</h3>
              <div className="space-y-2 max-w-md">
                <Label htmlFor="ghCrad">Ghana Card Number</Label>
                <Input id="ghCard" placeholder="GHA-000000000-0" value={identityData.ghCard || ''} onChange={(e) => updateField('ghCard', e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <FileUpload label="Upload Ghana Card (Front)" onChange={(f) => updateField('idFront', f)} />
                <FileUpload label="Upload Ghana Card (Back)" onChange={(f) => updateField('idBack', f)} />
              </div>
            </div>
          </>
        );
      case "NG":
        return (
          <>
            <div className="space-y-4 pt-4 border-t border-border w-full md:col-span-2">
              <h3 className="font-semibold text-foreground">Verification Documents</h3>
              <div className="space-y-2 max-w-md">
                <Label htmlFor="nin">National Identification Number (NIN)</Label>
                <Input id="nin" placeholder="11-digit NIN" value={identityData.nin || ''} onChange={(e) => updateField('nin', e.target.value)} />
              </div>
              <div className="pt-2">
                <FileUpload label="Upload Government ID (National ID / Passport / Driver's License)" onChange={(f) => updateField('govtId', f)} />
              </div>
            </div>
          </>
        );
      case "US":
        return (
          <>
            <div className="space-y-4 pt-4 border-t border-border w-full md:col-span-2">
              <h3 className="font-semibold text-foreground">Verification Documents</h3>
              <div className="space-y-2 max-w-md">
                <Label htmlFor="ssn">Social Security Number (SSN - Last 4)</Label>
                <Input id="ssn" type="password" placeholder="***-**-1234" maxLength={4} value={identityData.ssn || ''} onChange={(e) => updateField('ssn', e.target.value)} />
              </div>
              <div className="pt-2">
                <FileUpload label="Upload Government ID (Driver's License / Passport)" onChange={(f) => updateField('govtId', f)} />
              </div>
            </div>
          </>
        );
      case "UK":
        return (
          <>
            <div className="space-y-4 pt-4 border-t border-border w-full md:col-span-2">
              <h3 className="font-semibold text-foreground">Verification Documents</h3>
              <div className="space-y-2 max-w-md">
                <Label htmlFor="nino">National Insurance Number</Label>
                <Input id="nino" placeholder="QQ 12 34 56 A" value={identityData.nino || ''} onChange={(e) => updateField('nino', e.target.value)} />
              </div>
              <div className="pt-2">
                <FileUpload label="Upload Government ID (Passport / Driving License)" onChange={(f) => updateField('govtId', f)} />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Identity Details</h2>
        <p className="text-muted-foreground">Please provide your personal information for verification.</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName">Full Legal Name</Label>
            <Input id="fullName" placeholder="John Doe" value={identityData.fullName || ''} onChange={(e) => updateField('fullName', e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" value={identityData.dob || ''} onChange={(e) => updateField('dob', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" value={identityData.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="john@example.com" value={identityData.email || ''} onChange={(e) => updateField('email', e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Residential Address</Label>
            <Input id="address" placeholder="123 Main St, Appt 4B, City, State, ZIP" value={identityData.address || ''} onChange={(e) => updateField('address', e.target.value)} />
          </div>

          {renderCountrySpecificFields()}

          <div className="md:col-span-2 pt-2">
            <FileUpload label="Selfie Capture (Optional)" description="Upload a clear photo of your face" onChange={(f) => updateField('selfie', f)} />
          </div>
        </div>

        <div className="flex items-start space-x-3 pt-4 border-t border-border">
          <Checkbox 
            id="agreement" 
            checked={agreement} 
            onCheckedChange={(c) => setAgreement(c as boolean)} 
            className="mt-1"
          />
          <Label htmlFor="agreement" className="text-sm font-normal text-muted-foreground leading-snug">
            {data.accountType === "business" 
              ? "I declare that I am an authorized representative of this business and the information provided is true and accurate. I authorize the verification of this information."
              : "I declare that the information provided is true and accurate. I authorize the verification of this information with relevant authorities."
            }
          </Label>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border flex justify-between shrink-0">
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
