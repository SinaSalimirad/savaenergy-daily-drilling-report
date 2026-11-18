import { BellIcon, SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeButton } from "@/components/ui/theme-button";

export default function PanelLayout({children} : {
    children: React.ReactNode
}) {


    return <>
        <header className="flex flex-wrap items-center justify-between gap-4 px-16 py-6 bg-card">
            <span className="font-logo text-xl text-foreground">
            SavaDailyDrillingReport
            </span>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            className="h-10 w-48 pl-9 sm:w-64"
          />
        </div>

        <Separator
          orientation="vertical"
          className="h-8 data-vertical:self-center max-md:hidden"
        />

        <Avatar size="lg">
          <AvatarFallback>SS</AvatarFallback>
        </Avatar>
            <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-lg" aria-label="Notifications">
            <BellIcon className="size-4.5"/>
          </Button>
          <ThemeButton />
        </div>
            </div>

        </header>
        {children}
    </>
}
