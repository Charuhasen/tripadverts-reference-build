"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignInfo, CampaignObjective } from "@/lib/schemas/campaignData";
import { ArrowRight, Upload, X, ImageIcon, Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: CampaignInfo;
  onNext: (data: CampaignInfo) => void;
}

export function StepCampaignInfo({ data, onNext }: Props) {
  const [info, setInfo] = useState<CampaignInfo>(data);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nameValid = info.name.trim().length >= 3 && info.name.length <= 120;
  const objectiveValid = info.objective !== "";
  const hasContent = !!info.adContent.previewUrl;
  const canProceed = nameValid && objectiveValid && hasContent;

  const handleNext = () => {
    if (canProceed) onNext(info);
  };

  const handleFile = (file: File) => {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) return;
    const previewUrl = URL.createObjectURL(file);
    setInfo((prev) => ({
      ...prev,
      adContent: { file, previewUrl, type: isVideo ? "video" : "image" },
    }));
  };

  const clearContent = () => {
    if (info.adContent.previewUrl) URL.revokeObjectURL(info.adContent.previewUrl);
    setInfo((prev) => ({
      ...prev,
      adContent: { file: null, previewUrl: "", type: null },
    }));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold tracking-tight">Campaign Information</h2>
        <p className="text-muted-foreground mt-1">
          Set up your campaign details and upload your ad creative.
        </p>
      </div>

      {/* Two-column body */}
      <div className="flex-1 flex gap-8 min-h-0 overflow-hidden">

        {/* LEFT: Form fields */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 overflow-y-auto">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="campaign-name" className="text-sm font-semibold">
              Campaign Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="campaign-name"
              placeholder='e.g. "New Product Launch – March"'
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              maxLength={120}
              className="h-10"
              aria-describedby="campaign-name-hint"
            />
            <div id="campaign-name-hint" className="flex justify-between text-xs text-muted-foreground">
              <span>
                {info.name.length > 0 && info.name.trim().length < 3 && (
                  <span className="text-destructive">Minimum 3 characters required</span>
                )}
              </span>
              <span>{info.name.length}/120</span>
            </div>
          </div>

          {/* Campaign Objective */}
          <div className="space-y-2">
            <Label htmlFor="campaign-objective" className="text-sm font-semibold">
              Campaign Objective <span className="text-destructive">*</span>
            </Label>
            <Select
              value={info.objective}
              onValueChange={(val) =>
                setInfo({ ...info, objective: val as CampaignObjective })
              }
            >
              <SelectTrigger id="campaign-objective" className="h-10 w-full">
                <SelectValue placeholder="Select an objective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="awareness">Awareness</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the primary goal of your campaign.
            </p>
          </div>

          {/* Campaign Description */}
          <div className="space-y-2">
            <Label htmlFor="campaign-description" className="text-sm font-semibold">
              Description{" "}
              <span className="font-normal text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="campaign-description"
              placeholder="Provide internal context for the campaign..."
              value={info.description}
              onChange={(e) => setInfo({ ...info, description: e.target.value })}
              maxLength={500}
              rows={4}
              aria-describedby="campaign-desc-hint"
            />
            <div id="campaign-desc-hint" className="flex justify-between text-xs text-muted-foreground">
              <span>Not visible in ad delivery</span>
              <span>{info.description.length}/500</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Upload + Preview */}
        <div className="w-[340px] shrink-0 flex flex-col gap-3">
          <div className="flex-shrink-0">
            <p className="text-sm font-semibold mb-1">
              Ad Creative <span className="text-destructive">*</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Upload an image or video for your ad.
            </p>
          </div>

          {/* Drop zone / preview */}
          <div className="flex-1 min-h-0 relative">
            {!hasContent ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  "h-full min-h-[280px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
                  dragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                )}
              >
                <div className="rounded-full bg-muted p-4">
                  <Upload className="size-6 text-muted-foreground" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-medium">Drop your file here</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ImageIcon className="size-3.5" /> JPG, PNG, GIF
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Film className="size-3.5" /> MP4, MOV, WebM
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Max 100 MB</p>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[280px] relative rounded-xl overflow-hidden border border-border bg-muted/20 group">
                {info.adContent.type === "image" ? (
                  <img
                    src={info.adContent.previewUrl}
                    alt="Ad preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={info.adContent.previewUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
                {/* Overlay actions */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-card/90 backdrop-blur-sm border border-border rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-card transition-colors"
                  >
                    Replace
                  </button>
                  <button
                    onClick={clearContent}
                    className="bg-card/90 backdrop-blur-sm border border-border rounded-md p-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                {/* Type badge */}
                <div className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-sm border border-border rounded-md px-2 py-1 flex items-center gap-1.5">
                  {info.adContent.type === "image"
                    ? <ImageIcon className="size-3 text-muted-foreground" />
                    : <Film className="size-3 text-muted-foreground" />}
                  <span className="text-xs text-muted-foreground capitalize">{info.adContent.type}</span>
                  {info.adContent.file && (
                    <span className="text-xs text-muted-foreground/60 ml-1">
                      · {(info.adContent.file.size / 1_000_000).toFixed(1)} MB
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-5 border-t border-border mt-5 flex-shrink-0">
        <Button
          size="lg"
          className="px-8"
          disabled={!canProceed}
          onClick={handleNext}
        >
          Next: Targeting
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
