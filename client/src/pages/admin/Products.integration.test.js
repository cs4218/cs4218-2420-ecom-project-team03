import { expect, jest } from "@jest/globals";
import React from "react";
import {
  render,
  waitFor,
  screen,
  fireEvent,
  within
} from "@testing-library/react";
import axios from "axios";
import Products from "./Products";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import { DUMMY_PRODUCTS } from "../../misc/dummyData";
import { CartProvider } from "../../context/cart";
import UpdateProduct from "./UpdateProduct";
import { AuthProvider } from "../../context/auth";
import { SearchProvider } from "../../context/search";

jest.mock("antd", () => {
  const original = jest.requireActual("antd");
  const Select = ({ children, placeholder, value, onChange, ...props }) => (
    <select 
      placeholder={placeholder} 
      role="combobox"
      onChange={(event) => onChange(event.target.value)}
    >
      {children}
    </select>
  );
  Select.Option = ({ children, ...props }) => (
    <option {...props}>
      {children}
    </option>
  );
  return {
    ...original,
    Select,
  };
});

URL.createObjectURL = jest.fn().mockReturnValue("mock_image.jpg");

axios.defaults.baseURL = "http://localhost:6060";

describe("Products Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays fetched products", async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/dashboard/admin/products']}>
              <Products />
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );
    
    await Promise.all(
      DUMMY_PRODUCTS.map(async (item, index) => {
        const productCard = await screen.findByTestId(item._id);
        expect(await within(productCard).findByText(item.name)).toBeInTheDocument();
        expect(await within(productCard).findByText(item.description)).toBeInTheDocument();
        expect(productCard).toHaveAttribute("href", `/dashboard/admin/product/${item.slug}`);
        const productImage = await screen.findByAltText(item.name);
        expect(productImage).toHaveAttribute("src", expect.stringContaining(`/api/v1/product/product-photo/${item._id}`));
      })
    );
  });

  it("navigates to update page with product details when clicked on", async () => {
    const { getByText } = render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/dashboard/admin/products']}>
              <Routes>
                <Route path="/dashboard/admin/product/:slug" element={<UpdateProduct />} />
                <Route path="/dashboard/admin/products" element={<Products />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    fireEvent.click(await screen.findByTestId(DUMMY_PRODUCTS[0]._id));
    
    expect(getByText("Update Product")).toBeInTheDocument();
    expect(getByText("Upload Photo")).toBeInTheDocument();
    expect(getByText("UPDATE PRODUCT")).toBeInTheDocument();
    expect(getByText("DELETE PRODUCT")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("name-input").value).toBe(DUMMY_PRODUCTS[0].name);
      expect(screen.getByTestId("desc-input").value).toBe(DUMMY_PRODUCTS[0].description);
      expect(screen.getByTestId("price-input").value).toBe(DUMMY_PRODUCTS[0].price.toString());
      expect(screen.getByTestId("quantity-input").value).toBe(DUMMY_PRODUCTS[0].quantity.toString());
      expect(screen.getAllByRole("combobox")[0].value).toBe(DUMMY_PRODUCTS[0].category);
      expect(screen.getAllByRole("combobox")[1].value).toBe(DUMMY_PRODUCTS[0].shipping ? "0" : "1");
    });
  });
});