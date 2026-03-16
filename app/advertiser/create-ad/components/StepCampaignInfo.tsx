"use client";

import { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignInfo, CampaignObjective } from "@/lib/schemas/campaignData";
import { Upload, X, ImageIcon, Film, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepNavState } from "../page";

const SLOT_DURATION = 15;

interface Props {
  data: CampaignInfo;
  onNext: (data: CampaignInfo) => void;
  onNavChange?: (state: StepNavState) => void;
  submitRef?: React.MutableRefObject<(() => void) | null>;
}

export function StepCampaignInfo({ data, onNext, onNavChange, submitRef }: Props) {
  const [info, setInfo] = useState<CampaignInfo>(data);
  const [dragging, setDragging] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasContent = !!info.adContent.previewUrl;

  useEffect(() => {
    onNavChange?.({ canProceed: true, nextLabel: "Next: Targeting" });
  }, [onNavChange]);

  useEffect(() => {
    if (submitRef) {
      submitRef.current = () => { onNext(info); };
    }
  });

  const slotCount = videoDuration !== null
    ? Math.ceil(Math.round(videoDuration) / SLOT_DURATION)
    : info.adContent.type === "image" ? 1 : null;

  const handleNext = () => { onNext(info); };

  const handleFile = (file: File) => {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) return;
    const previewUrl = URL.createObjectURL(file);
    setVideoDuration(null);
    setInfo((prev) => ({
      ...prev,
      adContent: { file, previewUrl, type: isVideo ? "video" : "image" },
    }));
  };

  useEffect(() => {
    if (info.adContent.type !== "video" || !info.adContent.previewUrl) {
      setVideoDuration(null);
      return;
    }
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = info.adContent.previewUrl;
    video.onloadedmetadata = () => setVideoDuration(video.duration);
  }, [info.adContent.previewUrl, info.adContent.type]);

  const clearContent = () => {
    if (info.adContent.previewUrl) URL.revokeObjectURL(info.adContent.previewUrl);
    setVideoDuration(null);
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
      <div className="mb-3 flex-shrink-0">
        <h2 className="text-lg font-bold tracking-tight">New Campaign</h2>
      </div>

      {/* Name + Objective row */}
      <div className="flex gap-4 mb-3 flex-shrink-0">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="campaign-name" className="text-xs font-semibold">
            Campaign Name
          </Label>
          <Input
            id="campaign-name"
            placeholder='e.g. "New Product Launch – March"'
            value={info.name}
            onChange={(e) => setInfo({ ...info, name: e.target.value })}
            maxLength={120}
            className="h-9"
          />
        </div>
        <div className="w-[200px] space-y-1.5">
          <Label htmlFor="campaign-objective" className="text-xs font-semibold">
            Objective
          </Label>
          <Select
            value={info.objective}
            onValueChange={(val) => setInfo({ ...info, objective: val as CampaignObjective })}
          >
            <SelectTrigger id="campaign-objective" className="h-9 w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="awareness">Awareness</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="promotion">Promotion</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Upload area — hero */}
      <div className="flex-1 min-h-0 relative">
        {!hasContent ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "h-full min-h-[200px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors",
              dragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40 hover:bg-muted/30"
            )}
          >
            <div className="rounded-full bg-muted p-3">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-semibold">Upload your ad creative</p>
              <p className="text-xs text-muted-foreground mt-1">
                Drop a file here or click to browse
              </p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ImageIcon className="size-3.5" /> JPG, PNG, GIF
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Film className="size-3.5" /> MP4, MOV, WebM
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Ads are billed in 15s slots. Images = 1 slot. Videos are rounded up to the nearest 15s.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[200px] flex flex-col gap-3">
            {/* Preview */}
            <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-border bg-muted/20 group">
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
                  className="bg-card/90 backdrop-blur-sm border border-border rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-card transition-colors cursor-pointer"
                >
                  Replace
                </button>
                <button
                  onClick={clearContent}
                  className="bg-card/90 backdrop-blur-sm border border-border rounded-md p-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Slot info bar */}
            <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-muted/50 border border-border text-xs shrink-0">
              <span className="flex items-center gap-1.5">
                {info.adContent.type === "image"
                  ? <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  : <Film className="w-3.5 h-3.5 text-muted-foreground" />}
                <span className="capitalize">{info.adContent.type}</span>
              </span>
              {info.adContent.file && (
                <span className="text-muted-foreground">
                  {(info.adContent.file.size / 1_000_000).toFixed(1)} MB
                </span>
              )}
              {videoDuration !== null && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {Math.floor(videoDuration / 60) > 0 && `${Math.floor(videoDuration / 60)}m `}
                  {Math.round(videoDuration % 60)}s
                </span>
              )}
              <div className="flex-1" />
              {slotCount !== null && (
                <span className="font-semibold text-primary">
                  {slotCount} slot{slotCount !== 1 ? "s" : ""} ({slotCount * SLOT_DURATION}s)
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
  );
}
