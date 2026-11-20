import { fireEvent, within } from "@testing-library/react";

/** Opens the list of a search-box combobox: it opens from the arrow button inside the box. */
export function openCombobox(scope: HTMLElement, placeholder: string) {
  const input = within(scope).getByPlaceholderText(placeholder);
  const arrow = input
    .closest("[data-slot=input-group]")
    ?.querySelector("button");
  if (!arrow) throw new Error(`No arrow button for "${placeholder}"`);
  fireEvent.click(arrow);
}
