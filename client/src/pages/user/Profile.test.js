import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "./Profile";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";
import "@testing-library/jest-dom";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

describe("Profile Component", () => {
  const mockUser = {
    name: "Tester",
    email: "Tester@test.com",
    phone: "1234567890",
    address: "Tester St",
  };
  const setAuthMock = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue([{ user: mockUser }, setAuthMock]);
    localStorage.setItem("auth", JSON.stringify({ user: mockUser }));
    jest.clearAllMocks();
  });

  it("renders initial profile data", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Enter Your Name").value).toBe(
      mockUser.name
    );
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe(
      mockUser.email
    );
    expect(screen.getByPlaceholderText("Enter Your Phone").value).toBe(
      mockUser.phone
    );
    expect(screen.getByPlaceholderText("Enter Your Address").value).toBe(
      mockUser.address
    );

    // email field should be disabled
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeDisabled();
  });

  it("should allow typing for name, password, phone, and address fields", async () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: "newname" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "mockpassword" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: "5555555555" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: "newaddress" },
    });

    expect(getByPlaceholderText("Enter Your Name").value).toBe("newname");
    expect(getByPlaceholderText("Enter Your Password").value).toBe(
      "mockpassword"
    );
    expect(getByPlaceholderText("Enter Your Phone").value).toBe("5555555555");
    expect(getByPlaceholderText("Enter Your Address").value).toBe("newaddress");
  });

  it("should not allow typing for email", async () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    const emailInput = getByPlaceholderText("Enter Your Email");
    expect(emailInput).toBeDisabled();
  });

  it("updates profile successfully", async () => {
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: "new",
          email: "Tester@test.com", // same email
          phone: "9999999999",
          address: "new",
        },
        error: false,
      },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: "new" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "mockpassword" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: "9999999999" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: "new" },
    });

    fireEvent.click(screen.getByRole("button", { name: "UPDATE" }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
        name: "new",
        email: "Tester@test.com", // same email
        phone: "9999999999",
        address: "new",
        password: "mockpassword",
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Profile Updated Successfully"
      );
    });

    expect(setAuthMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user: {
          name: "new",
          email: "Tester@test.com",
          phone: "9999999999",
          address: "new",
        },
      })
    );

    // localStorage updated
    const storedAuth = JSON.parse(localStorage.getItem("auth"));
    expect(storedAuth.user).toEqual({
      name: "new",
      email: "Tester@test.com",
      phone: "9999999999",
      address: "new",
    });
  });

  it("should handle error API response gracefully", async () => {
    axios.put.mockResolvedValue({
      data: {
        success: false,
        message: "Error While Updating Profile",
        error: "Invalid update",
      },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "mockpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "UPDATE" }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        address: mockUser.address,
        password: "mockpassword",
      });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid update");
    });
  });

  it("handles update profile error", async () => {
    axios.put.mockRejectedValue(new Error("Mocking profile update error"));

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "mockpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "UPDATE" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong while updating the profile");
    });
  });
});
