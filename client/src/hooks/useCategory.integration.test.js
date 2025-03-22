import { expect, jest } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import useCategory from "./useCategory";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:6060";

describe("useCategory hook", () => {
  it("handles API response with success:true", async () => {
    const targetCategories = [
      {
        _id: "66db427fdb0119d9234b27ed",
        name: "Electronic",
        slug: "electronic",
      },
      { _id: "66db427fdb0119d9234b27ef", name: "Book", slug: "book" },
    ];

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      // filter out redundant field __v
      const categories = result.current.map(({ __v, ...rest }) => rest);

      expect(categories).toEqual(targetCategories);
    });
  });

  describe("Negative tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("handles API response with success:false", async () => {
      const getSpy = jest.spyOn(axios, "get").mockResolvedValue({
        data: {
          success: false,
          message: "Error while updating category",
          error: new Error("Something went wrong"),
        },
      });

      const { result } = renderHook(() => useCategory());
      await expect(result.current).toEqual([]);

      getSpy.mockRestore();
    });

    it("should handle API errors and keep categories empty", async () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      const getSpy = jest
        .spyOn(axios, "get")
        .mockRejectedValue(new Error("Something went wrong"));

      const { result } = renderHook(() => useCategory());

      await expect(result.current).toEqual([]);
      await expect(consoleSpy).toHaveBeenCalled();
      
      getSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
