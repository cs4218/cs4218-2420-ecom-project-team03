import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "./Profile";
import axios from "axios";
import toast from "react-hot-toast";
import "@testing-library/jest-dom";
import { AuthProvider } from "../../context/auth";
import { SearchProvider } from "../../context/search";
import { CartProvider } from "../../context/cart";
import { DUMMY_USERS } from "../../misc/dummydata";

axios.defaults.baseURL = "http://localhost:6060";

jest.mock("react-hot-toast");

const dummyUser = DUMMY_USERS[0];

const adminCredentials = {
  email: dummyUser.email,
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

describe("Profile Component", () => {
  const renderComponent = () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter>
              <Profile />
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );
  };

  it("renders initial profile data", () => {
    renderComponent();

    expect(screen.getByPlaceholderText("Enter Your Name").value).toBe(
      dummyUser.name
    );
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe(
      dummyUser.email
    );
    expect(screen.getByPlaceholderText("Enter Your Phone").value).toBe(
      dummyUser.phone
    );
    expect(screen.getByPlaceholderText("Enter Your Address").value).toBe(
      dummyUser.address
    );

    // email field should be disabled
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeDisabled();
  });

  it("should return an error if password is less than 6 characters", async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "12345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "UPDATE" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Passsword is required and 6 character long"
      );
    });
  });

  it("should update profile successfully", async () => {
    renderComponent();

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
      expect(toast.success).toHaveBeenCalledWith(
        "Profile Updated Successfully"
      );
    });

    // localStorage updated
    const storedAuth = JSON.parse(localStorage.getItem("auth"));
    expect(storedAuth.user).toEqual(
      expect.objectContaining({
        name: "new",
        email: dummyUser.email,
        phone: "9999999999",
        address: "new",
      })
    );

    // revert back password
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "UPDATE" }));
  });
});
