import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UserMenu from "./UserMenu";
import Profile from "../pages/user/Profile";
import Orders from "../pages/user/Orders";
import "@testing-library/jest-dom";
import { AuthProvider } from "../context/auth";
import { SearchProvider } from "../context/search";
import { CartProvider } from "../context/cart";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:6060";

const adminCredentials = {
  email: "test@example.com",
  password: "password123",
};

const loginAdmin = async () => {
  const response = await axios.post("/api/v1/auth/login", adminCredentials);
  localStorage.setItem("auth", JSON.stringify(response.data));
  const token = response.data.token;
  axios.defaults.headers.common["Authorization"] = token;
};

beforeAll(async () => {
  await loginAdmin();
});

describe("UserMenu Navigation Integration", () => {
  it("navigates to Profile when clicking the Profile link", () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={["/dashboard/user"]}>
              <UserMenu />
              <Routes>
                <Route path="/dashboard/user" element={<UserMenu />} />
                <Route path="/dashboard/user/profile" element={<Profile />} />
                <Route path="/dashboard/user/orders" element={<Orders />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );
    const profileLinks = screen.getAllByText("Profile");
    fireEvent.click(profileLinks[0]);
    expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
  });

  it("navigates to Orders when clicking the Orders link", () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={["/dashboard/user"]}>
              <UserMenu />
              <Routes>
                <Route path="/dashboard/user" element={<UserMenu />} />
                <Route path="/dashboard/user/profile" element={<Profile />} />
                <Route path="/dashboard/user/orders" element={<Orders />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );
    const ordersLinks = screen.getAllByText("Orders");
    fireEvent.click(ordersLinks[0]);
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });
});
