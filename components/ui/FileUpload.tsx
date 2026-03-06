import React from "react";
import { UploadCloud } from "lucide-react";

interface FileUploadProps {
  label: string;
  description?: string;
  onChange?: (file: File | null) => void;
}

export function FileUpload({ label, description, onChange }: FileUploadProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted transition-colors cursor-pointer group">
        <div className="p-3 bg-card border border-border rounded-full mb-3 group-hover:scale-105 transition-transform shadow-sm">
          <UploadCloud className="w-5 h-5 text-primary" />
        </div>
        <div className="text-sm font-medium text-foreground">Click to upload or drag & drop</div>
        <p className="text-xs text-muted-foreground mt-1">{description || "PNG, JPG or PDF (max. 5MB)"}</p>
        <input 
          type="file" 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onChange?.(file);
          }} 
        />
      </div>
    </div>
  );
}
