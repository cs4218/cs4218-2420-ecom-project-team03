import { expect, jest } from "@jest/globals";
import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  within,
} from "@testing-library/react";
import axios from "axios";
import CreateCategory from "./CreateCategory";
import toast from "react-hot-toast";
import { MemoryRouter, Routes, Route } from "react-router-dom";
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
describe("CreateCategory Component", () => {
  const mockCategories = [{ _id: "1", name: "Mocked Electronics" }];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: { success: true, category: mockCategories },
    });
  });

  it("fetches category data on render", async () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByPlaceholderText("Enter new category")).toBeInTheDocument();
      expect(getByText("Manage Category")).toBeInTheDocument();
      expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
    });
  });

  it("displays fetched categories", async () => {
    const { getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      screen.findByText("Mocked Electronics");
    });
  });

  it("displays empty state when no categories are available", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, category: [] },
    });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByTestId("category-table");
      const rows = within(table).queryAllByRole("row");

      // expect only header row to be generated
      expect(rows.length).toBe(1);
    });
  });

  it("handles error when fetching categories", async () => {
    axios.get.mockRejectedValue("mocking error in fetching categories");

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
    });
  });

  it("handles creating a new category using an existing category name", async () => {
    // Return a valid response object, but with success false
    axios.post.mockResolvedValue({
      data: { success: false, message: "Category already exists" },
    });
  
    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );
  
    const createCategoryForm = screen.getByTestId("create-category-form");
    const input = within(createCategoryForm).getByPlaceholderText("Enter new category");
    const submitButton = within(createCategoryForm).getByText("Submit");
  
    fireEvent.change(input, { target: { value: "Mocked Electronics" } });
    fireEvent.click(submitButton);
  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/category/create-category", {
        name: "Mocked Electronics",
      });
      expect(toast.error).toHaveBeenCalledWith("Category already exists");
    });
  });

  it("submits create new category form", async () => {
    axios.post.mockResolvedValue({
      data: { success: true, message: "new category created" },
    });

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    const createCategoryForm = getByTestId("create-category-form");
    const input =
      within(createCategoryForm).getByPlaceholderText("Enter new category");
    const submitButton = within(createCategoryForm).getByText("Submit");

    fireEvent.change(input, { target: { value: "New Category 1" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/category/create-category",
        {
          name: "New Category 1",
        }
      );
      expect(toast.success).toHaveBeenCalledWith("New Category 1 is created");
    });
  });

  it("handles empty string successfully when creating new category", async () => {
    axios.post.mockRejectedValue("mocking error in posting new category");
  
    const { getByTestId } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );
  
    const createCategoryForm = getByTestId("create-category-form");
    const input = within(createCategoryForm).getByPlaceholderText("Enter new category");
    const submitButton = within(createCategoryForm).getByText("Submit");
  
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(submitButton);
  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/category/create-category", {
        name: "",
      });
      expect(toast.error).toHaveBeenCalledWith("Something went wrong in input form");
    });
  });

  it("updates a category successfully", async () => {
    axios.put.mockResolvedValue({
      data: { success: true, message: "Updated Electronics is updated" },
    });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    const editButton = await screen.findByText("Edit");
    fireEvent.click(editButton);

    const updateForm = screen.getByTestId("update-category-form");
    const updateInput = within(updateForm).getByDisplayValue(mockCategories[0].name);
    const updateSubmitButton = within(updateForm).getByText("Submit");

    fireEvent.change(updateInput, { target: { value: "Updated Electronics" } });
    fireEvent.click(updateSubmitButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/category/update-category/1", {
        name: "Updated Electronics",
      });
      expect(toast.success).toHaveBeenCalledWith("Updated Electronics is updated");
    });
  });

  it("handles empty string successfully when updating a category", async () => {
    axios.put.mockRejectedValue();

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    const editButton = await screen.findByText("Edit");
    fireEvent.click(editButton);

    const updateForm = screen.getByTestId("update-category-form");
    const updateInput = within(updateForm).getByDisplayValue(mockCategories[0].name);
    const updateSubmitButton = within(updateForm).getByText("Submit");

    fireEvent.change(updateInput, { target: { value: "" } });
    fireEvent.click(updateSubmitButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/category/update-category/1", {
        name: "",
      });
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("handles updating a category name using an existing category name", async () => {
    axios.put.mockResolvedValue({
      data: { success: false, message: "Category already exists" },
    });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    const editButton = await screen.findByText("Edit");
    fireEvent.click(editButton);

    const updateForm = screen.getByTestId("update-category-form");
    const updateInput = within(updateForm).getByDisplayValue(mockCategories[0].name);
    const updateSubmitButton = within(updateForm).getByText("Submit");

    fireEvent.change(updateInput, { target: { value: "Mocked Electronics" } });
    fireEvent.click(updateSubmitButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/category/update-category/1", {
        name: "Mocked Electronics",
      });
      expect(toast.error).toHaveBeenCalledWith("Category already exists");
    });
  });

  it("deletes a category successfully", async () => {
    axios.delete.mockResolvedValue({
      data: { success: true, message: "category is deleted" },
    });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    const deleteButton = await screen.findByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/v1/category/delete-category/1");
      expect(toast.success).toHaveBeenCalledWith("category is deleted");
    });
  });

  it("handles delete error", async () => {
    axios.delete.mockRejectedValue();

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    const deleteButton = await screen.findByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("handles deleting a category with invalid id", async () => {
    axios.delete.mockResolvedValue({
      data: { success: false, message: "Error while deleting category" },
    });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    const deleteButton = await screen.findByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error while deleting category");
    });
  });
});
