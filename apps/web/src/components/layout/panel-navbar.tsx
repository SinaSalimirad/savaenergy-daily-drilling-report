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
import { isSectionActive, type NavSection, navSections } from "./nav-sections";

function NavSectionMenu({
  section,
  pathname,
}: {
  section: NavSection;
  pathname: string;
}) {
  const isActive = isSectionActive(section, pathname);
  const Icon = section.icon;

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        data-active={isActive || undefined}
        className="h-9 gap-1.5 rounded-b-none px-3 text-sm data-active:bg-muted"
      >
        <Icon className="size-4" aria-hidden="true" />
        {section.label}
      </NavigationMenuTrigger>

      <NavigationMenuContent>
        <ul className="grid w-52 gap-0.5">
          {section.items.map((item) => (
            <li key={item.href}>
              <NavigationMenuLink
                render={<Link href={item.href} />}
                active={pathname === item.href}
                className="px-2 py-1.5 text-sm hover:bg-muted"
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
    <nav aria-label="Main" className="bg-card px-16">
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
