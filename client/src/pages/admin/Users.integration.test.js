import React from "react";
import { render, screen } from "@testing-library/react";
import Users from "./Users";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../context/auth";
import { SearchProvider } from "../../context/search";
import { CartProvider } from "../../context/cart";
import '@testing-library/jest-dom';

describe("Users Component Integration Test", () => {
  it("should render the admin panel component together with users component", () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter>
              <Users />
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    expect(screen.getByText("Dashboard - All Users")).toBeInTheDocument();
    expect(screen.getByText("All Users")).toBeInTheDocument();
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });
});
