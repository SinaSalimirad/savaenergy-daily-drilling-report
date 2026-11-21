import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { moveSection, resetApiClientMock } from "@/test/api-client-mock";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import type { Section } from "../api";
import { SectionsTable } from "./sections-table";

const makeSection = (overrides: Partial<Section>): Section => ({
  id: "s1",
  well_id: "w1",
  well_name: "A-1",
  project_name: "Alpha",
  sort_order: 1,
  hole_size: 12.25,
  hole_type: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const ROW_HEIGHT = 50;
const realRect = Element.prototype.getBoundingClientRect;

// happy-dom has no layout, so every box is empty and a drag has nowhere to land. Give each
// body row a box of its own: row `n` sits at y = n * ROW_HEIGHT.
function giveRowsALayout() {
  Element.prototype.getBoundingClientRect = function getRect() {
    const rows = [...document.querySelectorAll("tbody tr")];
    const index = rows.indexOf(this as HTMLTableRowElement);
    if (index === -1) return realRect.call(this);
    const top = index * ROW_HEIGHT;
    return {
      x: 0,
      y: top,
      top,
      bottom: top + ROW_HEIGHT,
      left: 0,
      right: 500,
      width: 500,
      height: ROW_HEIGHT,
      toJSON: () => ({}),
    };
  };
}

function ordersShown() {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => row.querySelectorAll("td")[1]?.textContent);
}

/** Drags the handle of body row `from` onto the place of body row `to`. */
function drag(from: number, to: number) {
  const handle = screen.getAllByRole("button", { name: /Drag to reorder/ })[
    from
  ];
  if (!handle) throw new Error("No such handle");
  const startY = from * ROW_HEIGHT + 25;
  const endY = to * ROW_HEIGHT + 25;
  fireEvent.mouseDown(handle, { clientX: 10, clientY: startY, button: 0 });
  fireEvent.mouseMove(document, { clientX: 10, clientY: (startY + endY) / 2 });
  fireEvent.mouseMove(document, { clientX: 10, clientY: endY });
  fireEvent.mouseUp(document, { clientX: 10, clientY: endY });
}

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
  giveRowsALayout();
});

afterEach(() => {
  Element.prototype.getBoundingClientRect = realRect;
});

describe("SectionsTable", () => {
  it("dragging the second row above the first swaps their order", async () => {
    moveSection.mockResolvedValue({ data: {}, error: null });
    const sections = [
      makeSection({ id: "s1", sort_order: 1, hole_size: 12.25 }),
      makeSection({ id: "s2", sort_order: 2, hole_size: 8.5 }),
    ];
    render(<SectionsTable data={sections} emptyMessage="None." />, {
      wrapper: QueryWrapper,
    });

    drag(1, 0);

    // The table moves at once, before the server answers.
    await waitFor(() => expect(ordersShown()).toEqual(["1", "2"]));
    expect(screen.getAllByRole("row")[1]?.textContent).toContain('8 1/2"');
    expect(screen.getAllByRole("row")[2]?.textContent).toContain('12 1/4"');
    // The API is asked to put section 2 at order 1.
    await waitFor(() =>
      expect(moveSection).toHaveBeenCalledWith({ to_order: 1 }),
    );
  });

  it("a section cannot be dropped on another well", async () => {
    const sections = [
      makeSection({ id: "s1", well_id: "w1", sort_order: 1 }),
      makeSection({ id: "s2", well_id: "w2", well_name: "B-1", sort_order: 1 }),
    ];
    render(<SectionsTable data={sections} emptyMessage="None." />, {
      wrapper: QueryWrapper,
    });

    drag(1, 0);

    expect(moveSection).not.toHaveBeenCalled();
  });
});
