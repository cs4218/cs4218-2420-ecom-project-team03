import { expect, jest } from "@jest/globals";
import React from "react";
import {
  render,
  waitFor,
  screen
} from "@testing-library/react";
import axios from "axios";
import Products from "./Products";
import toast from "react-hot-toast";
import { MemoryRouter } from "react-router-dom";
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

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));
describe("Products Component", () => {
  const mockProducts = [ 
    {
      _id: '1',
      name: "Laptop",
      slug: "laptop",
      description: "A powerful laptop",
    },
    {
      _id: '2',
      name: "Smartphone",
      slug: "smartphone",
      description: "A high-end smartphone",
    },
    {
      _id: '3',
      name: "Textbook",
      slug: "textbook",
      description: "CS4218 Textbook in mint condition.",
    } 
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches product data on render", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, products: mockProducts },
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByText("All Products List")).toBeInTheDocument();
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product");
    });
  });

  it("displays fetched products", async () => {
    axios.get.mockResolvedValueOnce({
      status: 200, data: { success: true, products: mockProducts },
    });

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );
    
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    await Promise.all(
      mockProducts.map(async (item, index) => {
        expect(await screen.findByText(item.name)).toBeInTheDocument();
        expect(await screen.findByText(item.description)).toBeInTheDocument();
        const productLink = screen.getByTestId(item._id);
        expect(productLink).toHaveAttribute("href", `/dashboard/admin/product/${item.slug}`);
        const productImage = await screen.findByAltText(item.name);
        expect(productImage).toHaveAttribute("src", `/api/v1/product/product-photo/${item._id}`);
      })
    );
  });

  it("displays an error message if fetching products is unsuccessful", async () => {
    axios.get.mockRejectedValueOnce("Product fetch error");

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting products");
    });
  });
});