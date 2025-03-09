import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import CreateProduct from "./CreateProduct";

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

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("Create Product Component", () => {
  const mockCategories = [
    { _id: "1", name: "Electronics" },
    { _id: "2", name: "Books" },
    { _id: "3", name: "Appliances" },
  ]

  const mockProduct = {
    name: "Laptop",
    category: "1",
    description: "Good laptop",
    price: "140.95",
    quantity: "200",
    shipping: "0",
    photo: ""
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders create product form", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories }});

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/create-product"]}>
        <Routes>
          <Route path="/admin/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const header = screen.getByTestId("create-product-header");
    expect(header).toHaveTextContent("Create Product");
    expect(getByPlaceholderText("Select a category")).toBeInTheDocument();
    expect(getByText("Upload Photo")).toBeInTheDocument();
    expect(getByPlaceholderText("Write a name")).toBeInTheDocument();
    expect(getByPlaceholderText("Write a description")).toBeInTheDocument();
    expect(getByPlaceholderText("Write a price")).toBeInTheDocument();
    expect(getByPlaceholderText("Write a quantity")).toBeInTheDocument();
    expect(getByPlaceholderText("Select shipping")).toBeInTheDocument();
    expect(getByText("CREATE PRODUCT")).toBeInTheDocument();
  });

  it("should successfully fetch categories", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories }});
    
    render(
      <MemoryRouter initialEntries={["/admin/create-product"]}>
        <Routes>
          <Route path="/admin/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category"));
    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    await Promise.all(
      mockCategories.map(async (item) => {
        expect(await screen.findByText(item.name)).toBeInTheDocument();
      })
    );
  });

  it("should display error message on failure to fetch categories", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: false }});

    render(
      <MemoryRouter initialEntries={["/admin/create-product"]}>
        <Routes>
          <Route path="/admin/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
  });

  it("should display error message on any error in fetching categories", async () => {
    axios.get.mockRejectedValue({ data: { success: false }});

    render(
      <MemoryRouter initialEntries={["/admin/create-product"]}>
        <Routes>
          <Route path="/admin/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
  });

  it("should successfully create a product", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories }});
    axios.post.mockResolvedValueOnce({ data: { success: true }});

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/create-product"]}>
        <Routes>
          <Route path="/admin/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // Fill up input fields
    fireEvent.change(getByPlaceholderText("Write a name"), {
      target: { value: mockProduct.name },
    });
    fireEvent.change(getByPlaceholderText("Write a description"), {
      target: { value: mockProduct.description },
    });
    fireEvent.change(getByPlaceholderText("Write a price"), {
      target: { value: mockProduct.price },
    });
    fireEvent.change(getByPlaceholderText("Write a quantity"), {
      target: { value: mockProduct.quantity },
    });

    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: '1' } });
    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: '0' } });

    // Upload photo
    URL.createObjectURL = jest.fn().mockReturnValueOnce("mock_image.jpg");
    const file = new File(["mock-image-data"], "mock_image.jpg", { type: "image/jpeg" });
    const fileUpload = screen.getByTestId("file-upload");
    fireEvent.change(fileUpload, { target: { files: [file] }});
    expect(await screen.getByText("mock_image.jpg")).toBeInTheDocument();
    expect(await screen.getByRole("img")).toHaveAttribute("src", "mock_image.jpg");    

    fireEvent.click(getByText("CREATE PRODUCT"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    const formData = axios.post.mock.calls[0][1];
    for (const pair of formData) {
      if (pair[0] == "photo") {
        expect(Object.hasOwn(mockProduct, pair[0])).toBeTruthy();
        continue;
      }
      expect(Object.hasOwn(mockProduct, pair[0]) && mockProduct[pair[0]] === pair[1]).toBeTruthy();
    }
    expect(toast.success).toHaveBeenCalledWith("Product Created Successfully");
  });

  it("should display error message on failure to create product", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories }});
    axios.post.mockResolvedValueOnce({ data: { success: false }});

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/create-product"]}>
        <Routes>
          <Route path="/admin/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    fireEvent.click(getByText("CREATE PRODUCT"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in creating product");
  });

  it("should display error message on failure to create product due to server error", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories }});
    axios.post.mockRejectedValue({ response: { status: 500 }});

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/create-product"]}>
        <Routes>
          <Route path="/admin/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    fireEvent.click(getByText("CREATE PRODUCT"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in creating product");
  });

  it("should display error message on failure to create product due to invalid details", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories }});
    axios.post.mockRejectedValue({ response: { status: 400 }});

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/create-product"]}>
        <Routes>
          <Route path="/admin/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    fireEvent.click(getByText("CREATE PRODUCT"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Invalid details provided");
  });

  it("should display error message on any error in creating product", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories }});
    axios.post.mockRejectedValue("unexpected error");

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/admin/create-product"]}>
        <Routes>
          <Route path="/admin/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    fireEvent.click(getByText("CREATE PRODUCT"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in creating product");
  });
});
