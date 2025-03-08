import { expect, jest } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import useCategory from "./useCategory";
import axios from "axios";

jest.mock("axios");

describe("useCategory hook", () => {
  it("should return empty [] on its initial state", async () => {
    const { result } = renderHook(() => useCategory());
    expect(result.current).toEqual([]);
  });

  it("should get all categories successfully", async () => {
    const mockCategories = [
      { _id: "1", name: "Category 1" },
      { _id: "2", name: "Category 2" },
      { _id: "2", name: "Category 3" },
    ];

    axios.get.mockResolvedValue({
      data: {
        success: true,
        message: "All Categories List",
        category: mockCategories,
      },
    });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).toEqual(mockCategories);
      expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
    });
  });

  it("should handle API errors and keep categories empty", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error("Something went wrong"));

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
