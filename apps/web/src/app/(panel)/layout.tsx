import { BellIcon } from "lucide-react";
import { PanelBreadcrumb } from "@/components/layout/panel-breadcrumb";
import { PanelNavbar } from "@/components/layout/panel-navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeButton } from "@/components/ui/theme-button";
import { ProjectFilterSelect } from "@/features/projects/components/project-filter-select";
import { ProjectFilterProvider } from "@/features/projects/project-filter";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectFilterProvider>
      <header className="flex flex-wrap items-center justify-between gap-4 px-16 py-8 bg-card">
        <span className="font-logo text-xl text-foreground">
          SavaDailyDrillingReport
        </span>

        <div className="flex flex-wrap items-center gap-x-6 ">
          <ProjectFilterSelect />

          <Separator
            orientation="vertical"
            className="h-8 data-vertical:self-center max-md:hidden"
          />

          <Avatar size="lg">
            <AvatarFallback>SS</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-lg" aria-label="Notifications">
              <BellIcon className="size-4.5" />
            </Button>
            <ThemeButton />
          </div>
        </div>
      </header>
      <PanelNavbar />
      <PanelBreadcrumb />

      {children}
    </ProjectFilterProvider>
  );
}
