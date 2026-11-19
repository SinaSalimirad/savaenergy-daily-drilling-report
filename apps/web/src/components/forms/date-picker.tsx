"use client";

import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DATE_FORMAT = "yyyy-MM-dd";

/** Calendar popover. The form keeps the date as `yyyy-MM-dd` text, the API's format. */
export function DatePicker({
  id,
  invalid,
  value,
  onChange,
}: {
  id: string;
  invalid: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? parse(value, DATE_FORMAT, new Date()) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Same look as the select triggers, so the fields line up in the form. */}
      <PopoverTrigger
        id={id}
        type="button"
        aria-invalid={invalid}
        data-empty={!date}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-2.5 py-1 text-left text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[empty=true]:text-muted-foreground dark:bg-input/30"
      >
        {date ? format(date, "PPP") : <span>Pick a date</span>}
        <CalendarIcon className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      {/* As wide as the field that opened it. */}
      <PopoverContent
        side="top"
        className="w-(--anchor-width) p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          classNames={{ root: "w-full" }}
          onSelect={(next) => {
            onChange(next ? format(next, DATE_FORMAT) : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
