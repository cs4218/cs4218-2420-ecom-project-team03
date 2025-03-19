import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import UserMenu from "./UserMenu";

describe("UserMenu Component", () => {
  it("renders usermenu", () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );
  });

  it("displays the dashboard header", () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it.each([
    ["Profile", "/dashboard/user/profile"],
    ["Orders", "/dashboard/user/orders"],
  ])("contains link %s with correct href", (linkText, expectedHref) => {
    const { getByText } = render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );
    const link = getByText(linkText);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", expectedHref);
  });
});
