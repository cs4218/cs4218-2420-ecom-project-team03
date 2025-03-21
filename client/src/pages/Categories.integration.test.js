import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Categories from "./Categories";
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:6060";

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
  it("renders the list of categories successfully", async () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    expect(screen.getByText("All Categories")).toBeInTheDocument();

    const categoriesList = screen.getByTestId("categories-list");
    const firstCategory = await within(categoriesList).findByText("Electronic");
    expect(firstCategory).toBeInTheDocument();
    expect(firstCategory.closest("a")).toHaveAttribute("href", "/category/electronic");

    const secondCategory = await within(categoriesList).findByText("Book");
    expect(secondCategory).toBeInTheDocument();
    expect(secondCategory.closest("a")).toHaveAttribute("href", "/category/book");
  });
});
