"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MonitorSmartphone } from "lucide-react";
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
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
      {/* Progress Indicator */}
      <div className="w-full flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-4">
          <div className="flex items-start justify-center max-w-2xl mx-auto">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const isLast = index === STEPS.length - 1;

              return (
                <div key={step.id} className="flex-1 flex flex-col items-center relative gap-2">
                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="absolute top-4 left-[50%] w-full h-[2px] -z-10 bg-border" />
                  )}
                  
                  {/* Step Node */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-300 z-10 bg-card ring-4 ring-card",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-primary/20"
                        : isCompleted
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-muted text-muted-foreground border border-border"
                    )}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  
                  {/* Step Label */}
                  <span
                    className={cn(
                      "text-xs font-semibold tracking-wide text-center",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
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
            <div className="flex-1 min-h-0 max-w-screen-2xl mx-auto w-full px-6 lg:px-10 py-6 flex flex-col">
              {currentStep === 1 && (
                <StepCampaignInfo
                  data={draft.campaignInfo}
                  onNext={handleInfoNext}
                />
              )}
              {currentStep === 2 && (
                <StepCampaignTarget
                  data={draft.campaignTarget}
                  onNext={handleTargetNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <StepCampaignPayment
                  draft={draft}
                  payment={draft.campaignPayment}
                  onBack={handleBack}
                  onSubmit={handlePaymentSubmit}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
