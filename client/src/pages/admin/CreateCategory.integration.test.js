import { expect, jest } from "@jest/globals";
import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  within,
  act,
} from "@testing-library/react";
import axios from "axios";
import CreateCategory from "./CreateCategory";
import Categories from "../Categories";
import toast from "react-hot-toast";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import { AuthProvider } from "../../context/auth";
import { SearchProvider } from "../../context/search";
import { CartProvider } from "../../context/cart";

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

jest.mock("react-hot-toast");

describe("CreateCategory Component", () => {
  const renderComponent = () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter>
              <CreateCategory />
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );
  };
  it("displays fetched categories in the categories component", async () => {
    renderComponent();

    const categoryTable = screen.getByTestId("category-table");
    const firstCategory = await within(categoryTable).findByText("Electronic");
    expect(firstCategory).toBeInTheDocument();
    const secondCategory = await within(categoryTable).findByText("Book");
    expect(secondCategory).toBeInTheDocument();

    const tbody = categoryTable.querySelector("tbody");
    const rows = tbody.querySelectorAll("tr");

    expect(rows.length).toBe(2);
  });
  it("does not add a duplicate category and the table remains unchanged", async () => {
    renderComponent();

    const categoryTable = await screen.findByTestId("category-table");

    await waitFor(() => {
      const tbody = categoryTable.querySelector("tbody");
      expect(tbody.querySelectorAll("tr").length).toBe(2);
    });

    const createCategoryForm = screen.getByTestId("create-category-form");
    const input =
      within(createCategoryForm).getByPlaceholderText("Enter new category");
    const submitButton = within(createCategoryForm).getByText("Submit");

    fireEvent.change(input, { target: { value: "Electronic" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const tbody = categoryTable.querySelector("tbody");
      const rows = tbody.querySelectorAll("tr");
      expect(rows.length).toBe(2); // remains as 2 items
    });
  });

  it("creates new catagory upon successful submission", async () => {
    renderComponent();

    const createCategoryForm = await screen.getByTestId("create-category-form");
    const input =
      within(createCategoryForm).getByPlaceholderText("Enter new category");
    const submitButton = within(createCategoryForm).getByText("Submit");

    fireEvent.change(input, { target: { value: "New Category" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("New Category")).toBeInTheDocument();
    });
  });

  it("updates a category successfully", async () => {
    renderComponent();

    const categoryTable = await screen.findByTestId("category-table");
    await waitFor(() => {
      expect(within(categoryTable).getByText("New Category")).toBeInTheDocument();
    });

    const electronicRow = within(categoryTable)
      .getByText("New Category")
      .closest("tr");

    const editButton = within(electronicRow).getByText("Edit");
    fireEvent.click(editButton);

    const updateForm = screen.getByTestId("update-category-form");
    const updateInput = within(updateForm).getByDisplayValue("New Category");
    const updateSubmitButton = within(updateForm).getByText("Submit");

    fireEvent.change(updateInput, { target: { value: "Updated New Category" } });
    fireEvent.click(updateSubmitButton);

    await waitFor(() => {
      expect(
        within(categoryTable).getByText("Updated New Category")
      ).toBeInTheDocument();
    });
  });

  it("handles empty string successfully when updating a category", async () => {
    renderComponent();

    const categoryTable = await screen.findByTestId("category-table");
    await waitFor(() => {
      expect(within(categoryTable).getByText("Book")).toBeInTheDocument();
    });

    const bookRow = within(categoryTable).getByText("Book").closest("tr");

    const editButton = within(bookRow).getByText("Edit");
    fireEvent.click(editButton);

    const updateForm = screen.getByTestId("update-category-form");
    const updateInput = within(updateForm).getByDisplayValue("Book");
    const updateSubmitButton = within(updateForm).getByText("Submit");

    fireEvent.change(updateInput, { target: { value: "   " } });
    fireEvent.click(updateSubmitButton);

    await waitFor(() => {
      expect(within(categoryTable).getByText("Book")).toBeInTheDocument();
    });
  });

  it("handles updating a category name using an existing category name", async () => {
    renderComponent();

    const categoryTable = await screen.findByTestId("category-table");
    await waitFor(() => {
      expect(within(categoryTable).getByText("Book")).toBeInTheDocument();
    });

    const bookRow = within(categoryTable).getByText("Book").closest("tr");

    const editButton = within(bookRow).getByText("Edit");
    fireEvent.click(editButton);

    const updateForm = screen.getByTestId("update-category-form");
    const updateInput = within(updateForm).getByDisplayValue("Book");
    const updateSubmitButton = within(updateForm).getByText("Submit");

    fireEvent.change(updateInput, { target: { value: "Electronic" } });
    fireEvent.click(updateSubmitButton);

    await waitFor(() => {
      expect(within(categoryTable).getByText("Book")).toBeInTheDocument(); // remains as Book
    });
  });

  it("deletes a category successfully", async () => {
    renderComponent();

    const categoryTable = await screen.findByTestId("category-table");
    await waitFor(() => {
      expect(within(categoryTable).getByText("Updated New Category")).toBeInTheDocument();
    });

    const targetRow = within(categoryTable).getByText("Updated New Category").closest("tr");

    const deleteButton = within(targetRow).getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(within(categoryTable).queryByText("Updated New Category")).toBeNull();
    });
  });
});
