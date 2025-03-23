import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, fireEvent, waitFor, screen, within } from "@testing-library/react";
import axios from "axios";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import slugify from "slugify";
import UpdateProduct from "./UpdateProduct";
import Products from "./Products";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import { DUMMY_CATEGORIES, DUMMY_PRODUCTS } from "../../misc/dummyData";

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

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

axios.defaults.baseURL = "http://localhost:6060";

const adminCredentials = {
  email: "test@example.com",
  password: "password123",
};

const DUMMY_PRODUCT = {
  _id: "66db427fdb0119d9234b2333",
  name: "Dummy",
  slug: slugify("Dummy"),
  description: "A dummy product",
  price: 1234.56, 
  category: "66db427fdb0119d9234b27ed", 
  quantity: 1234,
  shipping: true,
  photo: {
    name: "mock-image.jpg",
    type: "image/jpg"
  }
};

const updatedMockProduct = {
  _id: DUMMY_PRODUCT._id,
  name: "Dummy2",
  slug: slugify("Dummy2"),
  price: 10000.80,
  description: "A dummy product 2",
  category: DUMMY_CATEGORIES[1]._id,
  quantity: 1000,
  shipping: "0",
  photo: {
    name: "mock-image2.jpg"
  }
};

const loginAdmin = async () => {
  const response = await axios.post("/api/v1/auth/login", adminCredentials);
  localStorage.setItem("auth", JSON.stringify(response.data));
  const token = response.data.token;
  axios.defaults.headers.common["Authorization"] = token;
};

const createProduct = async () => {
  const productData = new FormData();
  productData.append("name", DUMMY_PRODUCT.name);
  productData.append("description", DUMMY_PRODUCT.description);
  productData.append("price", DUMMY_PRODUCT.price);
  productData.append("quantity", DUMMY_PRODUCT.quantity);
  productData.append("photo", new File(["mock-image-data"], DUMMY_PRODUCT.photo.name, { type: DUMMY_PRODUCT.photo.type }));
  productData.append("category", DUMMY_PRODUCT.category);
  productData.append("shipping", DUMMY_PRODUCT.shipping);
  const response = await axios.post(
    "/api/v1/product/create-product",
    productData
  );
  DUMMY_PRODUCT._id = response.data.products._id;
  updatedMockProduct._id = response.data.products._id;
};

beforeAll(async () => {
  await loginAdmin();
  await createProduct();
});

describe("Update Product Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully fetch product details", async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={[`/admin/product/${DUMMY_PRODUCT.slug}`]}>
              <Routes>
                <Route path="/admin/product/:slug" element={<UpdateProduct />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    expect(screen.getByText("Update Product")).toBeInTheDocument();
    expect(screen.getByText("Upload Photo")).toBeInTheDocument();
    expect(screen.getByText("UPDATE PRODUCT")).toBeInTheDocument();
    expect(screen.getByText("DELETE PRODUCT")).toBeInTheDocument();

    const nameInput = screen.getByTestId("name-input");
    const descInput = screen.getByTestId("desc-input");
    const priceInput = screen.getByTestId("price-input");
    const quantityInput = screen.getByTestId("quantity-input");
    const categoryCombobox = screen.getAllByRole("combobox")[0];
    const shippingCombobox = screen.getAllByRole("combobox")[1];

    await waitFor(() => expect(nameInput.value).toBe(DUMMY_PRODUCT.name));
    await waitFor(() => expect(descInput.value).toBe(DUMMY_PRODUCT.description));
    await waitFor(() => expect(priceInput.value).toBe(DUMMY_PRODUCT.price.toString()));
    await waitFor(() => expect(quantityInput.value).toBe(DUMMY_PRODUCT.quantity.toString()));
    await waitFor(() => expect(categoryCombobox.value).toBe(DUMMY_PRODUCT.category));
    await waitFor(() => expect(shippingCombobox.value).toBe(DUMMY_PRODUCT.shipping ? "0" : "1"));
  });

  it("should successfully fetch categories", async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={[`/admin/product/${DUMMY_PRODUCT.slug}`]}>
              <Routes>
                <Route path="/admin/product/:slug" element={<UpdateProduct />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    const combobox = screen.getAllByRole("combobox")[0];
    await Promise.all(
      DUMMY_CATEGORIES.map(async (item) => {
        expect(await within(combobox).findByText(item.name)).toBeInTheDocument();
      })
    );
  });

  it("should display an error message if invalid details were provided", async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={[`/dashboard/admin/product/${DUMMY_PRODUCT.slug}`]}>
              <Routes>
                <Route path="dashboard/admin/product/:slug" element={<UpdateProduct />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("name-input").value).toBe(DUMMY_PRODUCT.name));

    fireEvent.change(screen.getByTestId("name-input"), {
      target: { value: "" },
    });

    // Trigger form submission
    fireEvent.click(screen.getByText("UPDATE PRODUCT"));
    expect(await screen.findByText("Invalid details provided")).toBeInTheDocument();
  });

  it("should successfully update product details", async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={[`/dashboard/admin/product/${DUMMY_PRODUCT.slug}`]}>
              <Routes>
                <Route path="dashboard/admin/product/:slug" element={<UpdateProduct />} />
                <Route path="dashboard/admin/products" element={<Products />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("name-input").value).toBe(DUMMY_PRODUCT.name));

    // Change input fields
    fireEvent.change(screen.getByTestId("name-input"), {
      target: { value: updatedMockProduct.name },
    });
    fireEvent.change(screen.getByTestId("desc-input"), {
      target: { value: updatedMockProduct.description },
    });
    fireEvent.change(screen.getByTestId("price-input"), {
      target: { value: updatedMockProduct.price },
    });
    fireEvent.change(screen.getByTestId("quantity-input"), {
      target: { value: updatedMockProduct.quantity },
    });

    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: updatedMockProduct.category } });
    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: updatedMockProduct.shipping } });

    // Upload photo
    URL.createObjectURL = jest.fn().mockReturnValueOnce(updatedMockProduct.photo.name);
    const file = new File(["mock-mock-image-data"], updatedMockProduct.photo.name, { type: "image/jpeg" });
    const fileUpload = screen.getByTestId("file-upload");
    fireEvent.change(fileUpload, { target: { files: [file] }});
    expect(await screen.findByText(updatedMockProduct.photo.name)).toBeInTheDocument();
    expect(await screen.findByRole("img")).toHaveAttribute("src", updatedMockProduct.photo.name);    

    // Trigger form submission
    fireEvent.click(screen.getByText("UPDATE PRODUCT"));
    expect(await screen.findByText("Product Updated Successfully")).toBeInTheDocument();

    expect(await screen.findByText(updatedMockProduct.name)).toBeInTheDocument();
    expect(await screen.findByText(updatedMockProduct.description)).toBeInTheDocument();
    const productLink = screen.getByTestId(updatedMockProduct._id);
    expect(productLink).toHaveAttribute("href", `/dashboard/admin/product/${updatedMockProduct.slug}`);
    const productImage = await screen.findByAltText(updatedMockProduct.name);
    expect(productImage).toHaveAttribute("src", expect.stringContaining(`/api/v1/product/product-photo/${updatedMockProduct._id}`));
  });

  it("should successfully delete product if user agrees", async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={[`/dashboard/admin/product/${updatedMockProduct.slug}`]}>
              <Routes>
                <Route path="dashboard/admin/product/:slug" element={<UpdateProduct />} />
                <Route path="dashboard/admin/products" element={<Products />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );
    
    jest.spyOn(window, "prompt").mockReturnValueOnce("yes");

    await waitFor(() => expect(screen.getByTestId("name-input").value).toBe(updatedMockProduct.name));

    // Trigger form submission
    fireEvent.click(screen.getByText("DELETE PRODUCT"));
    expect(await screen.findByText("Product Deleted Successfully")).toBeInTheDocument();

    // TODO: Check if product still exists
    expect(await screen.findByText(DUMMY_PRODUCTS[0].name)).toBeInTheDocument();
    expect(screen.queryByText(updatedMockProduct.name)).not.toBeInTheDocument();
  });
});