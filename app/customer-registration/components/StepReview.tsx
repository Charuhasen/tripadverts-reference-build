import React, { useState } from "react";
import { RegistrationData } from "@/lib/schemas/registrationData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronRight, Loader2, Building2, User, CreditCard, Users } from "lucide-react";
import confetti from "canvas-confetti";

const SummarySection = ({ title, icon: Icon, children, onEdit }: any) => (
  <div className="border border-border rounded-xl overflow-hidden bg-card">
    <div className="flex items-center space-x-3 p-4 bg-muted/30 border-b border-border">
      <Icon className="w-5 h-5 text-primary" />
      <h3 className="font-semibold text-foreground flex-1">{title}</h3>
      <Button variant="ghost" size="sm" onClick={onEdit} className="text-primary hover:text-primary/80 hover:bg-primary/10 h-8 text-xs font-semibold">
        Edit
      </Button>
    </div>
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
      {children}
    </div>
  </div>
);

const DataPoint = ({ label, value }: { label: string, value: any }) => (
  <div className="flex flex-col">
    <span className="text-xs text-muted-foreground font-medium mb-1">{label}</span>
    <span className="text-sm font-semibold text-foreground">{value ? String(value) : <span className="text-muted-foreground/50 italic">Not provided</span>}</span>
  </div>
);

export function StepReview({ 
  data, onBack, onSubmit 
}: { 
  data: RegistrationData; 
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeCompliance, setAgreeCompliance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Trigger celebration
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      disableForReducedMotion: true
    });
    
    onSubmit();
  };

  const isComplete = true; // Disabled for testing

  if (isSuccess) {
    return (
      <div className="py-12 text-center space-y-6 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Application Submitted!</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-lg hover:text-foreground transition-colors">
          Your account is currently under review. 
          <br className="hidden sm:block" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 mt-4 shadow-sm border border-amber-500/20">
            Status: Pending Verification
          </span>
        </p>
        <div className="pt-8">
          <Button onClick={() => window.location.reload()} variant="outline" className="h-12 px-8">Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Review & Submit</h2>
        <p className="text-muted-foreground">Please review your information before final submission.</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-6">
        
        <SummarySection title="Identity Details" icon={User}>
          <DataPoint label="Account Type" value={data.accountType === 'business' ? 'Registered Business' : 'Individual'} />
          <DataPoint label="Country" value={data.country} />
          <DataPoint label="Full Legal Name" value={data.identity.fullName} />
          <DataPoint label="Date of Birth" value={data.identity.dob} />
          <DataPoint label="Email Address" value={data.identity.email} />
          <DataPoint label="Phone Number" value={data.identity.phone} />
          <DataPoint label="ID Number" value={data.identity.ghCard || data.identity.nin || data.identity.ssn || data.identity.nino} />
        </SummarySection>

        {data.accountType === "business" && (
          <SummarySection title="Business Details" icon={Building2}>
            <DataPoint label="Business Name" value={data.business.businessName} />
            <DataPoint label="Registration Number" value={data.business.regNumber} />
            <DataPoint label="Business Type" value={data.business.businessType} />
            <DataPoint label="Incorporation Date" value={data.business.incorporationDate} />
            <DataPoint label="Tax ID (TIN/EIN/UTR)" value={data.business.tin} />
          </SummarySection>
        )}

        {data.accountType === "business" && (
          <SummarySection title={`Directors (${data.directors.length})`} icon={Users}>
            {data.directors.map((dir, idx) => (
              <div key={idx} className="col-span-full border-b border-border last:border-0 pb-3 last:pb-0 mb-3 last:mb-0">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm text-foreground">{dir.fullName || `Person ${idx + 1}`}</span>
                  {dir.isAuthorizedSignatory && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Auth Signatory</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DataPoint label="Role" value={dir.role} />
                  <DataPoint label="Ownership" value={`${dir.ownership || 0}%`} />
                </div>
              </div>
            ))}
          </SummarySection>
        )}

        <SummarySection title="Banking Information" icon={CreditCard}>
          <DataPoint label="Bank Name" value={data.banking.bankName} />
          <DataPoint label="Account Holder" value={data.banking.accountName} />
          <DataPoint label="Account Number" value={"**" + (data.banking.accountNumber || "").slice(-4)} />
          {data.banking.routingNumber && <DataPoint label="Routing Number" value={data.banking.routingNumber} />}
          {data.banking.sortCode && <DataPoint label="Sort Code" value={data.banking.sortCode} />}
        </SummarySection>

        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-start space-x-3 bg-muted/20 p-4 rounded-xl border border-border">
            <Checkbox 
              id="compliance" 
              checked={agreeCompliance} 
              onCheckedChange={(c) => setAgreeCompliance(c as boolean)} 
              className="mt-1"
            />
            <Label htmlFor="compliance" className="text-sm font-normal text-muted-foreground leading-snug">
              I declare under penalty of perjury that all information provided is true, correct, and complete. I understand that false statements may lead to account termination.
            </Label>
          </div>

          <div className="flex items-start space-x-3 bg-muted/20 p-4 rounded-xl border border-border">
            <Checkbox 
              id="terms" 
              checked={agreeTerms} 
              onCheckedChange={(c) => setAgreeTerms(c as boolean)} 
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground leading-snug">
              I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a>, <a href="#" className="text-primary hover:underline">Privacy Policy</a>, and consent to electronic disclosures.
            </Label>
          </div>
        </div>

      </div>

      <div className="mt-8 pt-6 border-t border-border flex justify-between shrink-0">
        <Button variant="outline" size="lg" onClick={onBack} disabled={isSubmitting} className="h-12 px-8">Back</Button>
        <Button 
          size="lg" 
          disabled={!isComplete || isSubmitting}
          onClick={handleSubmit}
          className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 relative min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Complete Application
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
