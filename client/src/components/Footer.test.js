import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Footer from "./Footer";

describe("Footer Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders footer text", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(getByText("All Rights Reserved © TestingComp")).toBeInTheDocument();
  });

  it.each(
    [["About", "/about"], ["Contact", "/contact"], ["Privacy Policy", "/policy"]]
  )("renders footer link for %s", (text, href) => {
    const { getByText } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const linkElement = getByText(text);

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", href);
  });
});
