"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ColorSwatch } from "@/components/color-swatch";
import { Label } from "@/components/ui/Label";

type ColorPickerProps = {
  colors: string[];
  onChange: (colors: string[]) => void;
};

function normalizeHex(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return trimmed;
}

export function ColorPicker({ colors, onChange }: ColorPickerProps) {
  const [draft, setDraft] = useState("#c4a484");

  function addColor() {
    const normalized = normalizeHex(draft);
    if (!/^#[0-9a-f]{6}$/.test(normalized)) {
      return;
    }
    if (colors.includes(normalized)) {
      return;
    }
    onChange([...colors, normalized]);
  }

  function removeColor(color: string) {
    onChange(colors.filter((entry) => entry !== color));
  }

  return (
    <div className="space-y-3">
      <Label>Colors</Label>
      <div className="flex flex-wrap items-center gap-2">
        {colors.map((color) => (
          <div key={color} className="group relative">
            <ColorSwatch color={color} label={color} />
            <button
              type="button"
              onClick={() => removeColor(color)}
              aria-label={`Remove color ${color}`}
              className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-foreground text-background opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-2.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-label="Pick a color"
          className="size-11 cursor-pointer rounded-sm border border-border bg-background p-1"
        />
        <Button type="button" variant="secondary" onClick={addColor}>
          Add color
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Leave empty for products without color options.
      </p>
    </div>
  );
}
