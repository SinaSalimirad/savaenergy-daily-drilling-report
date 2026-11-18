"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { type NavSection, navSections } from "./nav-sections";

function NavSectionMenu({
  section,
  pathname,
}: {
  section: NavSection;
  pathname: string;
}) {
  const isSectionActive = pathname.startsWith(section.href);

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        data-active={isSectionActive || undefined}
        className="data-active:bg-muted/50"
      >
        {section.label}
      </NavigationMenuTrigger>

      <NavigationMenuContent>
        <ul className="grid w-56 gap-1">
          {section.items.map((item) => (
            <li key={item.href}>
              <NavigationMenuLink
                render={<Link href={item.href} />}
                active={pathname === item.href}
              >
                {item.label}
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

export function PanelNavbar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="border-y bg-card px-16 py-2">
      <NavigationMenu className="max-w-full justify-start">
        <NavigationMenuList className="flex-wrap justify-start gap-1">
          {navSections.map((section) => (
            <NavSectionMenu
              key={section.href}
              section={section}
              pathname={pathname}
            />
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}
