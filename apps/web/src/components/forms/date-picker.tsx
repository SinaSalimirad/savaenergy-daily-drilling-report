"use client";

import { format, parse } from "date-fns";
import { CalendarCheckIcon, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        {/* Same look as the select triggers, so the fields line up in the form. */}
        <PopoverTrigger
          id={id}
          type="button"
          aria-invalid={invalid}
          data-empty={!date}
          className="flex h-9 min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-input bg-transparent px-2.5 py-1 text-left text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[empty=true]:text-muted-foreground dark:bg-input/30"
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
      {/* One click fills in today's date, so nobody has to open the calendar for it. */}
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        title="Use today's date"
        aria-label="Use today's date"
        // Same border, radius, shadow and background as the date field next to it.
        className="size-9 rounded-md border-input bg-transparent text-muted-foreground shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-input/50"
        onClick={() => onChange(format(new Date(), DATE_FORMAT))}
      >
        <CalendarCheckIcon />
      </Button>
    </div>
  );
}
