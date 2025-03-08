import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Categories from "./Categories";
import useCategory from "../hooks/useCategory";
import "@testing-library/jest-dom";

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));
describe("Categories component", () => {
  const mockCategories = [
    { _id: "1", name: "first-category", slug: "first-category" },
    { _id: "2", name: "second-category", slug: "second-category" },
  ];
  it("renders the list of categories successfully", () => {
    useCategory.mockReturnValue(mockCategories);

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    const categoriesList = screen.getByTestId("categories-list");

    const firstCategory = within(categoriesList).getByText("first-category");
    expect(firstCategory).toBeInTheDocument();
    expect(firstCategory.closest("a")).toHaveAttribute("href", "/category/first-category");

    const secondCategory = within(categoriesList).getByText("second-category");
    expect(secondCategory).toBeInTheDocument();
    expect(secondCategory.closest("a")).toHaveAttribute("href", "/category/second-category");
  });

  it("renders empty list when no categories are available", () => {
    useCategory.mockReturnValue([]);

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    const categoriesList = screen.getByTestId("categories-list");

    expect(within(categoriesList).queryByRole("link")).toBeNull();
  });
});
