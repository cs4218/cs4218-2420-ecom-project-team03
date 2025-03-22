import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Categories from "./Categories";
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import { CartProvider } from "../context/cart";
import { AuthProvider } from "../context/auth";
import { SearchProvider } from "../context/search";
axios.defaults.baseURL = "http://localhost:6060";

describe("Categories component", () => {
  it("renders the list of categories successfully", async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter>
              <Categories />
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    expect(screen.getByText("All Categories")).toBeInTheDocument();

    const categoriesList = screen.getByTestId("categories-list");
    const firstCategory = await within(categoriesList).findByText("Electronic");
    expect(firstCategory).toBeInTheDocument();
    expect(firstCategory.closest("a")).toHaveAttribute(
      "href",
      "/category/electronic"
    );

    const secondCategory = await within(categoriesList).findByText("Book");
    expect(secondCategory).toBeInTheDocument();
    expect(secondCategory.closest("a")).toHaveAttribute(
      "href",
      "/category/book"
    );
  });
});
