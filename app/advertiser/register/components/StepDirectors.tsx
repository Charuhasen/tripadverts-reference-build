import React, { useState } from "react";
import { RegistrationData } from "@/lib/schemas/registrationData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function StepDirectors({ 
  data, onNext, onBack 
}: { 
  data: RegistrationData; 
  onNext: (update: Partial<RegistrationData>) => void;
  onBack: () => void;
}) {
  const [directors, setDirectors] = useState<Array<Record<string, any>>>(
    data.directors?.length ? data.directors : [{ id: Date.now(), role: "Director" }]
  );
  const [authorizedSignatoryId, setAuthorizedSignatoryId] = useState<number | string>(
    directors[0]?.id || ""
  );

  const updateDirector = (index: number, key: string, val: any) => {
    const newDirectors = [...directors];
    newDirectors[index] = { ...newDirectors[index], [key]: val };
    setDirectors(newDirectors);
  };

  const addDirector = () => {
    setDirectors([...directors, { id: Date.now(), role: "Director" }]);
  };

  const removeDirector = (index: number) => {
    if (directors.length === 1) return; // Prevent removing the last one
    const newDirectors = directors.filter((_, i) => i !== index);
    setDirectors(newDirectors);
    
    // Reset authorized signatory if it was the removed one
    if (authorizedSignatoryId === directors[index].id) {
      setAuthorizedSignatoryId(newDirectors[0]?.id || "");
    }
  };

  const handleNext = () => {
    onNext({ 
      directors: directors.map(d => ({
        ...d,
        isAuthorizedSignatory: d.id === authorizedSignatoryId
      })) 
    });
  };

  // Validation
  const totalOwnership = directors.reduce((sum, d) => sum + (Number(d.ownership) || 0), 0);
  const isValidOwnership = totalOwnership <= 100;
  const isComplete = true; // Disabled for testing

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Directors & Owners</h2>
        <p className="text-muted-foreground">Add all directors and beneficial owners (anyone holding 25% or more).</p>
      </div>

      <div className="space-y-6 pb-4">
        {!isValidOwnership && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm font-medium border border-destructive/20">
            Total ownership percentage cannot exceed 100%. Current total: {totalOwnership}%
          </div>
        )}

        {directors.map((dir, idx) => (
          <div key={dir.id} className="p-5 border border-border rounded-xl bg-muted/20 space-y-4 relative">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-foreground">Person {idx + 1}</h3>
              {directors.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeDirector(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Full Name</Label>
                <Input placeholder="Jane Smith" value={dir.fullName || ''} onChange={(e) => updateDirector(idx, 'fullName', e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input placeholder="e.g. American" value={dir.nationality || ''} onChange={(e) => updateDirector(idx, 'nationality', e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={dir.dob || ''} onChange={(e) => updateDirector(idx, 'dob', e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={dir.role} onValueChange={(val) => updateDirector(idx, 'role', val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="Shareholder">Shareholder</SelectItem>
                    <SelectItem value="CEO">CEO</SelectItem>
                    <SelectItem value="Beneficial Owner">Beneficial Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ownership Percentage (%)</Label>
                <Input type="number" min="0" max="100" placeholder="0 - 100" value={dir.ownership || ''} onChange={(e) => updateDirector(idx, 'ownership', e.target.value)} />
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addDirector} className="w-full border-dashed border-2 border-border py-6 text-muted-foreground hover:text-primary hover:border-primary/50">
          <Plus className="w-4 h-4 mr-2" />
          Add Another Person
        </Button>

        <div className="pt-6 border-t border-border space-y-4">
          <Label className="text-base text-foreground">Who is the primary Authorized Signatory?</Label>
          <RadioGroup 
            value={String(authorizedSignatoryId)} 
            onValueChange={(val) => setAuthorizedSignatoryId(val)}
            className="space-y-2"
          >
            {directors.map((dir, idx) => (
              <div key={dir.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-card">
                <RadioGroupItem value={String(dir.id)} id={`auth-${dir.id}`} />
                <Label htmlFor={`auth-${dir.id}`} className="font-medium cursor-pointer flex-1 text-foreground">
                  {dir.fullName || `Person ${idx + 1}`} <span className="text-muted-foreground font-normal ml-2">({dir.role})</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 pt-6 border-t border-border flex justify-between">
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
