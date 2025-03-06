import React from "react";
import { expect, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CategoryForm from "./CategoryForm";

describe("CategoryForm Component", () => {
  const handleSubmit = jest.fn((e) => e.preventDefault());
  const setValue = jest.fn();
  const initialValue = "Dummy Value";

  beforeEach(() => {
    handleSubmit.mockClear();
    setValue.mockClear();
  });

  it("renders the form successfully", () => {
    render(
      <CategoryForm handleSubmit={handleSubmit} value={initialValue} setValue={setValue} />
    );

    const inputElement = screen.getByPlaceholderText("Enter new category");
    const submitButton = screen.getByRole("button", { name: /submit/i });

    expect(inputElement).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it("calls setValue when input value changes", () => {
    render(
      <CategoryForm handleSubmit={handleSubmit} value="" setValue={setValue} />
    );

    const inputElement = screen.getByPlaceholderText("Enter new category");
    fireEvent.change(inputElement, { target: { value: "Something New" } });

    expect(setValue).toHaveBeenCalledWith("Something New");
  });

  it("calls handleSubmit when the form is submitted", () => {
    const { container } = render(
      <CategoryForm handleSubmit={handleSubmit} value="" setValue={setValue} />
    );

    const formElement = container.querySelector("form");
    fireEvent.submit(formElement);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
