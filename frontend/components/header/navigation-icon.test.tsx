import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { loanIcons } from "../../../shared/loan-icons";
import { NavigationIcon } from "./navigation-icon";

describe("NavigationIcon", () => {
  it("renders a Lucide icon outside the former hard-coded navigation set", async () => {
    const { container } = render(
      <NavigationIcon className="size-5" name="landmark" />,
    );

    await waitFor(() => expect(container.querySelector("svg")).toBeInTheDocument());
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("svg")).toHaveClass("size-5");
  });

  it("omits unknown icon names", () => {
    const { container } = render(<NavigationIcon name="not-a-lucide-icon" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("omits Lucide legacy aliases that are not offered by the picker", () => {
    const { container } = render(<NavigationIcon name="home" />);

    expect(container).toBeEmptyDOMElement();
  });

  it.each(loanIcons)("renders the $title custom icon", ({ value }) => {
    const { container } = render(<NavigationIcon className="size-5" name={value} />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("svg")).toHaveClass("size-5");
    expect(container.querySelector("path, circle")).toBeInTheDocument();
  });
});
