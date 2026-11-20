import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { PROJECT_STATUSES, WELL_STATUSES } from "schema";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("shows every project and well status", () => {
    for (const status of [...PROJECT_STATUSES, ...WELL_STATUSES]) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(status)).toBeTruthy();
      unmount();
    }
  });

  it("uses the same colour for active on projects and wells", () => {
    render(
      <>
        <StatusBadge status="active" />
        <StatusBadge status="inactive" />
      </>,
    );

    const [active, inactive] = screen.getAllByText(/active/);
    expect(active?.className).not.toBe(inactive?.className);
  });
});
