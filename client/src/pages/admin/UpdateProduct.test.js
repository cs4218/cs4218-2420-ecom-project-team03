import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import UpdateProduct from "./UpdateProduct";
import path from "node:path";

// Mocking axios.post
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

describe("Update Product Component", () => {
  const mockCategories = [
    { _id: "1", name: "Electronics" },
    { _id: "2", name: "Books" },
    { _id: "3", name: "Appliances" },
  ]

  const mockProduct = {
    _id: "1",
    name: "Laptop",
    category: "1",
    description: "Good laptop",
    price: "140.95",
    quantity: "200",
    shipping: "0",
    photo: { name: "mock_image.jpg" }
  };

  const updatedMockProduct = {
    _id: "1",
    name: "Laptop",
    category: "2",
    description: "Bad laptop",
    price: "10.01",
    quantity: "2000",
    shipping: "1",
    photo: { name: "mock_mock_image.jpg" }
  };

  const successfulProductResponse  = { data: { success: true, product: mockProduct }, status: 200 };
  const successfulCategoryResponse = { data: { success: true, category: mockCategories }, status: 200 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully fetch product details", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(getByText("Update Product")).toBeInTheDocument();
    expect(getByText("Upload Photo")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("name-input").value).toBe(mockProduct.name);
      expect(screen.getByTestId("desc-input").value).toBe(mockProduct.description);
      expect(screen.getByTestId("price-input").value).toBe(mockProduct.price);
      expect(screen.getByTestId("quantity-input").value).toBe(mockProduct.quantity);
      expect(screen.getAllByRole("combobox")[0].value).toBe(mockProduct.category);
      expect(screen.getAllByRole("combobox")[1].value).toBe(mockProduct.shipping);
    });
    expect(getByText("UPDATE PRODUCT")).toBeInTheDocument();
    expect(getByText("DELETE PRODUCT")).toBeInTheDocument();
  });

  it("should display an error message on failure to fetch product details ", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: false }, status: 500 });
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);

    render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    expect(toast.error).toHaveBeenCalledWith("Something went wrong when fetching product details");
  });

  it("should display an error message on any error in fetching product details ", async () => {
    axios.get.mockRejectedValueOnce("unexpected error");
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);

    render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    expect(toast.error).toHaveBeenCalledWith("Something went wrong when fetching product details");
  });

  it("should successfully fetch categories", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);
    
    render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category"));
    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    await Promise.all(
      mockCategories.map(async (item) => {
        expect(await screen.findByText(item.name)).toBeInTheDocument();
      })
    );
  });

  it("should display error message on failure to fetch categories", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockResolvedValueOnce({ data: { success: false }});

    render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
  });

  it("should display error message on any error in fetching categories", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockRejectedValue({ data: { success: false }});

    render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
  });

  it("should successfully update product details", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);
    axios.put.mockResolvedValueOnce({ data: { success: true }});
    axios.get.mockResolvedValueOnce("");

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

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
    expect(await screen.getByText(updatedMockProduct.photo.name)).toBeInTheDocument();
    expect(await screen.getByRole("img")).toHaveAttribute("src", updatedMockProduct.photo.name);    

    // Trigger form submission
    fireEvent.click(getByText("UPDATE PRODUCT"));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    const formData = axios.put.mock.calls[0][1];
    for (const pair of formData) {
      if (pair[0] == "photo") {
        expect(Object.hasOwn(updatedMockProduct, pair[0])).toBeTruthy();
        continue;
      }
      expect(Object.hasOwn(updatedMockProduct, pair[0]) && updatedMockProduct[pair[0]] === pair[1]).toBeTruthy();
    }

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
  });

  it("should display an error message if updating product was not successful", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    axios.put.mockResolvedValueOnce({ data: { success: false }});

    // Trigger form submission
    fireEvent.click(getByText("UPDATE PRODUCT"));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in updating product");
  });

  it("should display an error message if there is a server error in updating product", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    axios.put.mockRejectedValueOnce({ response: { status: 500 }});

    // Trigger form submission
    fireEvent.click(getByText("UPDATE PRODUCT"));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in updating product");
  });

  it("should display an error message if invalid details were provided", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    axios.put.mockRejectedValueOnce({ response: { status: 400 }});

    // Trigger form submission
    fireEvent.click(getByText("UPDATE PRODUCT"));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Invalid details provided");
  });

  it("should display an error message if there is any unexpected error in updating product", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    axios.put.mockRejectedValueOnce({ error: "unexpected error" });

    // Trigger form submission
    fireEvent.click(getByText("UPDATE PRODUCT"));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in updating product");
  });

  it("should successfully delete product if user agrees", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    
    jest.spyOn(window, "prompt").mockReturnValueOnce("yes");
    axios.delete.mockResolvedValueOnce({ data: { success: true }});

    // Trigger form submission
    fireEvent.click(getByText("DELETE PRODUCT"));
    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Product Deleted Successfully");
  });

  it("should not delete product if user disagrees", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    
    jest.spyOn(window, "prompt").mockReturnValueOnce(null);
    fireEvent.click(getByText("DELETE PRODUCT"));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(0));
  });

  it("should display error message if deleting product was not successful", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    
    jest.spyOn(window, "prompt").mockReturnValueOnce("yes");
    axios.delete.mockResolvedValueOnce({ data: { success: false }});

    // Trigger form submission
    fireEvent.click(getByText("DELETE PRODUCT"));
    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong when deleting product");
  });

  it("should display error message if there is an error in deleting product", async () => {
    axios.get.mockResolvedValueOnce(successfulProductResponse);
    axios.get.mockResolvedValueOnce(successfulCategoryResponse);

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/product/laptop"]}>
        <Routes>
          <Route path="/admin/product/:slug" element={<UpdateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    
    jest.spyOn(window, "prompt").mockReturnValueOnce("yes");
    axios.delete.mockRejectedValue("unexpected error");

    // Trigger form submission
    fireEvent.click(getByText("DELETE PRODUCT"));
    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong when deleting product");
  });
});