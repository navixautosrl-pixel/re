"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export function Select({
  id,
  value,
  onValueChange,
  placeholder,
  options,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        id={id}
        className="flex w-full items-center justify-between gap-2 border-b border-border-strong bg-transparent py-3 text-left text-base text-foreground data-[placeholder]:text-muted-foreground/60 focus-visible:border-accent-2 focus-visible:outline-none"
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={8}
          className="glass z-[70] max-h-64 overflow-hidden rounded-md shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]"
        >
          <RadixSelect.Viewport className="p-1.5">
            {options.map((option) => (
              <RadixSelect.Item
                key={option}
                value={option}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2.5 text-sm text-foreground/90 outline-none data-[highlighted]:bg-white/[0.06] data-[state=checked]:text-accent-2"
              >
                <RadixSelect.ItemText>{option}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check className="size-3.5 text-accent-2" aria-hidden="true" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
