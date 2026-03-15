import React, { useState } from "react";
import { RegistrationData, CountryCode } from "@/lib/schemas/registrationData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/FileUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function StepBusinessInfo({ 
  data, onNext, onBack 
}: { 
  data: RegistrationData; 
  onNext: (update: Partial<RegistrationData>) => void;
  onBack: () => void;
}) {
  const [businessData, setBusinessData] = useState<Record<string, any>>(data.business || {});
  
  const updateField = (key: string, val: any) => {
    setBusinessData(prev => ({ ...prev, [key]: val }));
  };

  const handleNext = () => {
    onNext({ business: businessData });
  };

  const country = data.country as CountryCode;

  // Real app validation
  const isComplete = true; // Disabled for testing

  const renderCountrySpecificFields = () => {
    switch(country) {
      case "GH":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="regNumber">Business Registration Number</Label>
              <Input id="regNumber" placeholder="CS0000000000" value={businessData.regNumber || ''} onChange={(e) => updateField('regNumber', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
              <Input id="tin" placeholder="P0000000000" value={businessData.tin || ''} onChange={(e) => updateField('tin', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat">VAT Registration Number (Optional)</Label>
              <Input id="vat" placeholder="V0000000000" value={businessData.vat || ''} onChange={(e) => updateField('vat', e.target.value)} />
            </div>
            
            <div className="md:col-span-2 pt-4">
              <Label className="mb-2 block font-semibold">Required Documents</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <FileUpload label="Upload Certificate of Incorporation" onChange={(f) => updateField('certInc', f)} />
                <FileUpload label="Upload TIN Certificate" onChange={(f) => updateField('tinCert', f)} />
              </div>
            </div>
          </>
        );
      case "NG":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="regNumber">CAC Registration Number</Label>
              <Input id="regNumber" placeholder="RC123456" value={businessData.regNumber || ''} onChange={(e) => updateField('regNumber', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tin">TIN</Label>
              <Input id="tin" placeholder="00000000-0000" value={businessData.tin || ''} onChange={(e) => updateField('tin', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat">VAT Number (If applicable)</Label>
              <Input id="vat" value={businessData.vat || ''} onChange={(e) => updateField('vat', e.target.value)} />
            </div>
            
            <div className="md:col-span-2 pt-4">
              <Label className="mb-2 block font-semibold">Required Documents</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <FileUpload label="Upload Certificate of Incorporation" onChange={(f) => updateField('certInc', f)} />
                <FileUpload label="Upload CAC Documents" onChange={(f) => updateField('cacDocs', f)} />
              </div>
            </div>
          </>
        );
      case "US":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="regNumber">State of Incorporation</Label>
              <Select value={businessData.regNumber} onValueChange={(val) => updateField('regNumber', val)}>
                <SelectTrigger id="regNumber" className="w-full">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {/* Simplified list for demo */}
                  <SelectItem value="DE">Delaware</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tin">Employer Identification Number (EIN)</Label>
              <Input id="tin" placeholder="12-3456789" value={businessData.tin || ''} onChange={(e) => updateField('tin', e.target.value)} />
            </div>
            
            <div className="md:col-span-2 pt-4">
              <Label className="mb-2 block font-semibold">Required Documents</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <FileUpload label="Upload Certificate of Formation" onChange={(f) => updateField('certInc', f)} />
                <FileUpload label="Upload EIN Confirmation Letter" onChange={(f) => updateField('einLetter', f)} />
              </div>
            </div>
          </>
        );
      case "UK":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="regNumber">Company Number (Companies House)</Label>
              <Input id="regNumber" placeholder="01234567" value={businessData.regNumber || ''} onChange={(e) => updateField('regNumber', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tin">Unique Taxpayer Reference (UTR)</Label>
              <Input id="tin" placeholder="12345 67890" value={businessData.tin || ''} onChange={(e) => updateField('tin', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat">VAT Number (If applicable)</Label>
              <Input id="vat" placeholder="GB 123 4567 89" value={businessData.vat || ''} onChange={(e) => updateField('vat', e.target.value)} />
            </div>
            
            <div className="md:col-span-2 pt-4">
              <Label className="mb-2 block font-semibold">Required Documents</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <FileUpload label="Upload Certificate of Incorporation" onChange={(f) => updateField('certInc', f)} />
                <FileUpload label="Upload UTR Confirmation Document" onChange={(f) => updateField('utrDoc', f)} />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const typeOptions = country === "US" 
    ? ["LLC", "C-Corp", "S-Corp", "Sole Prop"] 
    : country === "UK" 
      ? ["Ltd", "PLC", "LLP", "Sole Trader"] 
      : ["LLC", "Sole Proprietorship", "Partnership", "Public Company"];

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Business Information</h2>
        <p className="text-muted-foreground">Please provide the registered details of your company.</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="businessName">Registered Business Name</Label>
            <Input id="businessName" placeholder="Acme Inc." value={businessData.businessName || ''} onChange={(e) => updateField('businessName', e.target.value)} />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tradingName">Trading Name / DBA (If different)</Label>
            <Input id="tradingName" placeholder="Acme Services" value={businessData.tradingName || ''} onChange={(e) => updateField('tradingName', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="incorporationDate">Date of Incorporation</Label>
            <Input id="incorporationDate" type="date" value={businessData.incorporationDate || ''} onChange={(e) => updateField('incorporationDate', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select value={businessData.businessType} onValueChange={(val) => updateField('businessType', val)}>
              <SelectTrigger id="businessType" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(typeOptions) ? typeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                )) : null}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Registered Office Address</Label>
            <Input id="address" placeholder="123 Corporate Blvd, Suite 100, City, State, ZIP" value={businessData.address || ''} onChange={(e) => updateField('address', e.target.value)} />
          </div>

          <div className="md:col-span-2 space-y-4 pt-4 border-t border-border">
            <h3 className="font-semibold text-foreground">Registration Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
               {renderCountrySpecificFields()}
            </div>
          </div>
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
