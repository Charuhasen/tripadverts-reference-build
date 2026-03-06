"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RegistrationData, initialRegistrationData } from "@/lib/schemas/registrationData";
import { StepAccountType } from "./components/StepAccountType";
import { StepIdentity } from "./components/StepIdentity";
import { StepBusinessInfo } from "./components/StepBusinessInfo";
import { StepDirectors } from "./components/StepDirectors";
import { StepBanking } from "./components/StepBanking";
import { StepReview } from "./components/StepReview";
import { Check } from "lucide-react";

const STEPS_CONFIG = [
  { id: 1, title: "Account Type" },
  { id: 2, title: "Identity" },
  { id: 3, title: "Business" },
  { id: 4, title: "Directors" },
  { id: 5, title: "Banking" },
  { id: 6, title: "Review" },
];

export default function CustomerRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<RegistrationData>(initialRegistrationData);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  const handleNext = (stepData: Partial<RegistrationData>) => {
    setData((prev) => ({ ...prev, ...stepData }));
    setDirection(1);
    
    // Logic for skipping steps
    if (currentStep === 2 && data.accountType === "individual" && (!stepData.accountType || stepData.accountType === "individual")) {
      // Individual doesn't need Business and Director steps (steps 3 and 4)
      setCurrentStep(5);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    
    // Logic for skipping steps going back
    if (currentStep === 5 && data.accountType === "individual") {
      setCurrentStep(2);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleSubmit = () => {
    console.log("Final Registration Payload:", data);
  };

  const variants: any = {
    initial: (direction: number) => ({
      x: direction > 0 ? "50%" : "-50%",
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "50%" : "-50%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    }),
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="w-full max-w-3xl mb-6 flex-shrink-0">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-border -z-10" />
          {STEPS_CONFIG.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            // For individual, skip Business and Directors visually
            if (data.accountType === "individual" && (step.id === 3 || step.id === 4)) return null;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-300 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : isCompleted 
                        ? "bg-foreground text-background" 
                        : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={`mt-2 text-xs font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden relative flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-6 sm:p-8 w-full h-full flex flex-col"
            >
              {currentStep === 1 && (
                <StepAccountType data={data} onNext={handleNext} />
              )}
              {currentStep === 2 && (
                <StepIdentity data={data} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 3 && (
                <StepBusinessInfo data={data} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 4 && (
                <StepDirectors data={data} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 5 && (
                <StepBanking data={data} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 6 && (
                <StepReview data={data} onBack={handleBack} onSubmit={handleSubmit} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
