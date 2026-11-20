import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { PRODUCT_KINDS } from "schema";
import { KindBadge } from "./kind-badge";

describe("KindBadge", () => {
  it("shows the label of every kind, each with its own colour", () => {
    const classes = new Set<string>();
    for (const kind of PRODUCT_KINDS) {
      const { unmount } = render(<KindBadge kind={kind} />);
      classes.add(screen.getByText(/./).className);
      unmount();
    }

    expect(classes.size).toBe(PRODUCT_KINDS.length);
  });
});
