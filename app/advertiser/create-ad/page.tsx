"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MonitorSmartphone, X, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import {
  CampaignDraft,
  CampaignInfo,
  CampaignTarget,
  CampaignPayment,
  initialCampaignDraft,
} from "@/lib/schemas/campaignData";
import { StepCampaignInfo } from "./components/StepCampaignInfo";
import { StepCampaignTarget } from "./components/StepCampaignTarget";
import { StepCampaignPayment } from "./components/StepCampaignPayment";

export interface StepNavState {
  canProceed: boolean;
  nextLabel: string;
  processing?: boolean;
}

const STEPS = [
  { id: 1, title: "Campaign Info" },
  { id: 2, title: "Targeting" },
  { id: 3, title: "Payment" },
];

export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<CampaignDraft>(initialCampaignDraft);
  const [direction, setDirection] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [navState, setNavState] = useState<StepNavState>({ canProceed: false, nextLabel: "Next" });
  const submitRef = useRef<(() => void) | null>(null);
  const stepBackRef = useRef<(() => void) | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();

  const handleNavChange = useCallback((state: StepNavState) => {
    setNavState(state);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Unsaved changes warning
  useEffect(() => {
    const hasData =
      draft.campaignInfo.name !== "" ||
      draft.campaignTarget.selectedZoneIds.length > 0;

    if (!hasData) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [draft]);

  const handleInfoNext = (info: CampaignInfo) => {
    setDraft((prev) => ({ ...prev, campaignInfo: info }));
    setDirection(1);
    setCurrentStep(2);
  };

  const handleTargetNext = (target: CampaignTarget) => {
    setDraft((prev) => ({ ...prev, campaignTarget: target }));
    setDirection(1);
    setCurrentStep(3);
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePaymentSubmit = (payment: CampaignPayment) => {
    setDraft((prev) => ({ ...prev, campaignPayment: payment }));
    console.log("Campaign submitted:", { ...draft, campaignPayment: payment });
  };

  const handleSaveDraft = () => {
    console.log("Draft saved:", draft);
    setShowExitDialog(false);
    router.push("/advertiser/dashboard");
  };

  const handleDiscardDraft = () => {
    setShowExitDialog(false);
    router.push("/advertiser/dashboard");
  };

  const variants: any = {
    initial: (dir: number) => ({
      x: dir > 0 ? "50%" : "-50%",
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "50%" : "-50%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    }),
  };

  if (!mounted) return null;

  if (!isDesktop) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
        <MonitorSmartphone className="w-16 h-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-bold tracking-tight mb-2">Desktop Required</h2>
        <p className="text-muted-foreground max-w-sm">
          Campaign creation is best experienced on a desktop or laptop device.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Progress bar + Navigation */}
      <div className="w-full flex-shrink-0 border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 flex items-center h-11 gap-4">
          {/* Left: Back + Exit */}
          <div className="flex items-center gap-3 min-w-[120px]">
            {(currentStep > 1 || stepBackRef.current) && (
              <button
                onClick={() => {
                  if (stepBackRef.current) {
                    stepBackRef.current();
                  } else {
                    handleBack();
                  }
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <button
              onClick={() => setShowExitDialog(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Exit
            </button>
          </div>

          {/* Center: Steps */}
          <div className="flex-1 flex items-center justify-center gap-1 text-xs">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} className="flex items-center gap-1">
                  {index > 0 && (
                    <span className={cn(
                      "w-4 h-px mx-1",
                      isCompleted ? "bg-primary" : "bg-border"
                    )} />
                  )}
                  <span className={cn(
                    "font-medium transition-colors",
                    isActive ? "text-foreground" :
                    isCompleted ? "text-primary" :
                    "text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="w-3.5 h-3.5 inline" /> : null}
                    {isCompleted ? "" : `${step.id}. `}{step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Next */}
          <div className="min-w-[120px] flex justify-end">
            <Button
              size="sm"
              disabled={!navState.canProceed || navState.processing}
              onClick={() => submitRef.current?.()}
            >
              {navState.processing ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {navState.nextLabel}
                  <ArrowRight className="ml-1.5 size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content — full width, no card wrapper */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full flex flex-col"
          >
            <div className="flex-1 min-h-0 max-w-screen-2xl mx-auto w-full px-6 lg:px-10 py-3 flex flex-col">
              {currentStep === 1 && (
                <StepCampaignInfo
                  data={draft.campaignInfo}
                  onNext={handleInfoNext}
                  onNavChange={handleNavChange}
                  submitRef={submitRef}
                />
              )}
              {currentStep === 2 && (
                <StepCampaignTarget
                  data={draft.campaignTarget}
                  onNext={handleTargetNext}
                  onBack={handleBack}
                  onNavChange={handleNavChange}
                  submitRef={submitRef}
                  stepBackRef={stepBackRef}
                />
              )}
              {currentStep === 3 && (
                <StepCampaignPayment
                  draft={draft}
                  payment={draft.campaignPayment}
                  onBack={handleBack}
                  onSubmit={handlePaymentSubmit}
                  onNavChange={handleNavChange}
                  submitRef={submitRef}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Exit confirmation modal */}
      <AnimatePresence>
        {showExitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowExitDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-semibold">Exit campaign creation?</h3>
              <p className="text-xs text-muted-foreground mt-1.5">
                You have unsaved progress. Would you like to save this as a draft before leaving?
              </p>
              <div className="flex flex-col gap-2 mt-5">
                <Button onClick={handleSaveDraft} size="sm" className="w-full">
                  Save as Draft
                </Button>
                <Button onClick={handleDiscardDraft} variant="outline" size="sm" className="w-full">
                  Discard & Exit
                </Button>
                <Button onClick={() => setShowExitDialog(false)} variant="ghost" size="sm" className="w-full">
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
