import { expect, jest } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import useCategory from "./useCategory";
import axios from "axios";
import toast from "react-hot-toast";
import { DUMMY_CATEGORIES } from "../misc/dummyData";

axios.defaults.baseURL = "http://localhost:6060";

describe("useCategory hook", () => {
  it("handles API response with success:true", async () => {
    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      // filter out redundant field __v
      const categories = result.current.map(({ __v, ...rest }) => rest);

      expect(categories).toEqual(DUMMY_CATEGORIES);
    });
  });

  describe("Negative tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("handles API response with success:false", async () => {
      const data = {
        success: false,
        message: "Error while getting all categories",
        error: new Error("Something went wrong"),
      };

      const getSpy = jest.spyOn(axios, "get").mockResolvedValue({
        data,
      });
      const toastSpy = jest.spyOn(toast, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useCategory());

      await expect(result.current).toEqual([]);
      await expect(toastSpy).toHaveBeenCalledWith(data.message);
      getSpy.mockRestore();
      toastSpy.mockRestore();
    });

    it("should handle API errors and keep categories empty", async () => {
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      const getSpy = jest
        .spyOn(axios, "get")
        .mockRejectedValue(new Error("Something went wrong"));
      const toastSpy = jest.spyOn(toast, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useCategory());

      await expect(result.current).toEqual([]);
      await expect(consoleSpy).toHaveBeenCalled();
      await expect(toastSpy).toHaveBeenCalledWith("Something went wrong while fetching categories data");

      toastSpy.mockRestore();
      getSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
