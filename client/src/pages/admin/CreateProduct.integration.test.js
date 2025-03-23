import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  getByTestId,
  within,
} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import CreateProduct from "./CreateProduct";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import { DUMMY_CATEGORIES, DUMMY_PRODUCTS } from "../../misc/dummyData";
import slugify from "slugify";

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
    <option {...props}>{children}</option>
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

axios.defaults.baseURL = "http://localhost:6060";

URL.createObjectURL = jest.fn().mockReturnValue("mock_image.jpg");

const adminCredentials = {
  email: "test@example.com",
  password: "password123",
};

const loginAdmin = async () => {
  const response = await axios.post("/api/v1/auth/login", adminCredentials);
  localStorage.setItem("auth", JSON.stringify(response.data));
  const token = response.data.token;
  axios.defaults.headers.common["Authorization"] = token;
};

beforeAll(async () => {
  await loginAdmin();
});

// product to create
const DUMMY_PRODUCT = {
  _id: "66db427fdb0119d9234b2333",
  name: "Dummy",
  slug: slugify("Dummy"),
  description: "A dummy product",
  price: 1234.56,
  category: "66db427fdb0119d9234b27ef",
  quantity: 1234,
  shipping: 0,
  photo: {
    name: "mock-image.jpg",
    type: "image/jpg",
  },
};

describe("Create Product Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const renderComponent = () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={["/admin/create-product"]}>
              <Routes>
                <Route
                  path="/admin/create-product"
                  element={<CreateProduct />}
                />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );
  };

  it("renders create product form", async () => {
    renderComponent();

    const header = screen.getByTestId("create-product-header");
    expect(header).toHaveTextContent("Create Product");
    expect(
      screen.getByPlaceholderText("Select a category")
    ).toBeInTheDocument();
    expect(screen.getByText("Upload Photo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write a name")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write a description")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write a price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write a quantity")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Select shipping")).toBeInTheDocument();
    expect(screen.getByText("CREATE PRODUCT")).toBeInTheDocument();
  });

  it("should successfully fetch categories", async () => {
    renderComponent();

    const categorySelect = screen.getByPlaceholderText("Select a category");
    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);

    await Promise.all(
      DUMMY_CATEGORIES.map(async (item) => {
        expect(
          await within(categorySelect).findByText(item.name)
        ).toBeInTheDocument();
      })
    );
  });

  it("should successfully create a product", async () => {
    renderComponent();

    // ensure categories data is loaded in first
    const categorySelect = screen.getByPlaceholderText("Select a category");
    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);

    await Promise.all(
      DUMMY_CATEGORIES.map(async (item) => {
        expect(
          await within(categorySelect).findByText(item.name)
        ).toBeInTheDocument();
      })
    );

    // Fill up input fields
    fireEvent.change(screen.getByPlaceholderText("Write a name"), {
      target: { value: DUMMY_PRODUCT.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Write a description"), {
      target: { value: DUMMY_PRODUCT.description },
    });
    fireEvent.change(screen.getByPlaceholderText("Write a price"), {
      target: { value: DUMMY_PRODUCT.price },
    });
    fireEvent.change(screen.getByPlaceholderText("Write a quantity"), {
      target: { value: DUMMY_PRODUCT.quantity },
    });

    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: DUMMY_PRODUCT.category },
    });

    fireEvent.change(screen.getAllByRole("combobox")[1], {
      target: { value: DUMMY_PRODUCT.shipping },
    });

    // Upload photo
    URL.createObjectURL = jest
      .fn()
      .mockReturnValueOnce(DUMMY_PRODUCT.photo.name);
    const file = new File(["mock-mock-image-data"], DUMMY_PRODUCT.photo.name, {
      type: DUMMY_PRODUCT.photo.type,
    });
    const fileUpload = screen.getByTestId("file-upload");
    fireEvent.change(fileUpload, { target: { files: [file] } });
    expect(
      await screen.findByText(DUMMY_PRODUCT.photo.name)
    ).toBeInTheDocument();
    expect(await screen.findByRole("img")).toHaveAttribute(
      "src",
      DUMMY_PRODUCT.photo.name
    );

    const toastSpy = jest.spyOn(toast, "success");

    fireEvent.click(screen.getByText("CREATE PRODUCT"));

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        "Product Created Successfully"
      );
    });
  });

  describe("Invalid Fields", () => {
    it("should display error message on failure to create product: empty name", async () => {
        renderComponent();

        // ensure categories data is loaded in first
        const categorySelect = screen.getByPlaceholderText("Select a category");
        fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    
        await Promise.all(
          DUMMY_CATEGORIES.map(async (item) => {
            expect(
              await within(categorySelect).findByText(item.name)
            ).toBeInTheDocument();
          })
        );
    
        // Fill up input fields
        // Empty name
        fireEvent.change(screen.getByPlaceholderText("Write a name"), {
          target: { value: "" },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a description"), {
          target: { value: DUMMY_PRODUCT.description },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a price"), {
          target: { value: DUMMY_PRODUCT.price },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a quantity"), {
          target: { value: DUMMY_PRODUCT.quantity },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[0], {
          target: { value: DUMMY_PRODUCT.category },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[1], {
          target: { value: DUMMY_PRODUCT.shipping },
        });
    
        // Upload photo
        URL.createObjectURL = jest
          .fn()
          .mockReturnValueOnce(DUMMY_PRODUCT.photo.name);
        const file = new File(["mock-mock-image-data"], DUMMY_PRODUCT.photo.name, {
          type: DUMMY_PRODUCT.photo.type,
        });
        const fileUpload = screen.getByTestId("file-upload");
        fireEvent.change(fileUpload, { target: { files: [file] } });
        expect(
          await screen.findByText(DUMMY_PRODUCT.photo.name)
        ).toBeInTheDocument();
        expect(await screen.findByRole("img")).toHaveAttribute(
          "src",
          DUMMY_PRODUCT.photo.name
        );
    
        const toastSpy = jest.spyOn(toast, "error");
    
        fireEvent.click(screen.getByText("CREATE PRODUCT"));
    
        await waitFor(() => {
          expect(toastSpy).toHaveBeenCalledWith(
            "Name is required"
          );
        });
    });

    it("should display error message on failure to create product: empty description", async () => {
        renderComponent();

        // ensure categories data is loaded in first
        const categorySelect = screen.getByPlaceholderText("Select a category");
        fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    
        await Promise.all(
          DUMMY_CATEGORIES.map(async (item) => {
            expect(
              await within(categorySelect).findByText(item.name)
            ).toBeInTheDocument();
          })
        );
    
        // Fill up input fields
        // Empty name
        fireEvent.change(screen.getByPlaceholderText("Write a name"), {
          target: { value: DUMMY_PRODUCT.name },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a description"), {
          target: { value: "" },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a price"), {
          target: { value: DUMMY_PRODUCT.price },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a quantity"), {
          target: { value: DUMMY_PRODUCT.quantity },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[0], {
          target: { value: DUMMY_PRODUCT.category },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[1], {
          target: { value: DUMMY_PRODUCT.shipping },
        });
    
        // Upload photo
        URL.createObjectURL = jest
          .fn()
          .mockReturnValueOnce(DUMMY_PRODUCT.photo.name);
        const file = new File(["mock-mock-image-data"], DUMMY_PRODUCT.photo.name, {
          type: DUMMY_PRODUCT.photo.type,
        });
        const fileUpload = screen.getByTestId("file-upload");
        fireEvent.change(fileUpload, { target: { files: [file] } });
        expect(
          await screen.findByText(DUMMY_PRODUCT.photo.name)
        ).toBeInTheDocument();
        expect(await screen.findByRole("img")).toHaveAttribute(
          "src",
          DUMMY_PRODUCT.photo.name
        );
    
        const toastSpy = jest.spyOn(toast, "error");
    
        fireEvent.click(screen.getByText("CREATE PRODUCT"));
    
        await waitFor(() => {
          expect(toastSpy).toHaveBeenCalledWith(
            "Description is required"
          );
        });
    });

    it("should display error message on failure to create product: empty price", async () => {
        renderComponent();

        // ensure categories data is loaded in first
        const categorySelect = screen.getByPlaceholderText("Select a category");
        fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    
        await Promise.all(
          DUMMY_CATEGORIES.map(async (item) => {
            expect(
              await within(categorySelect).findByText(item.name)
            ).toBeInTheDocument();
          })
        );
    
        // Fill up input fields
        // Empty name
        fireEvent.change(screen.getByPlaceholderText("Write a name"), {
          target: { value: DUMMY_PRODUCT.name },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a description"), {
          target: { value: DUMMY_PRODUCT.description },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a price"), {
          target: { value: "" },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a quantity"), {
          target: { value: DUMMY_PRODUCT.quantity },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[0], {
          target: { value: DUMMY_PRODUCT.category },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[1], {
          target: { value: DUMMY_PRODUCT.shipping },
        });
    
        // Upload photo
        URL.createObjectURL = jest
          .fn()
          .mockReturnValueOnce(DUMMY_PRODUCT.photo.name);
        const file = new File(["mock-mock-image-data"], DUMMY_PRODUCT.photo.name, {
          type: DUMMY_PRODUCT.photo.type,
        });
        const fileUpload = screen.getByTestId("file-upload");
        fireEvent.change(fileUpload, { target: { files: [file] } });
        expect(
          await screen.findByText(DUMMY_PRODUCT.photo.name)
        ).toBeInTheDocument();
        expect(await screen.findByRole("img")).toHaveAttribute(
          "src",
          DUMMY_PRODUCT.photo.name
        );
    
        const toastSpy = jest.spyOn(toast, "error");
    
        fireEvent.click(screen.getByText("CREATE PRODUCT"));
    
        await waitFor(() => {
          expect(toastSpy).toHaveBeenCalledWith(
            "Price is required"
          );
        });
    });

    it("should display error message on failure to create product: negative price", async () => {
        renderComponent();

        // ensure categories data is loaded in first
        const categorySelect = screen.getByPlaceholderText("Select a category");
        fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    
        await Promise.all(
          DUMMY_CATEGORIES.map(async (item) => {
            expect(
              await within(categorySelect).findByText(item.name)
            ).toBeInTheDocument();
          })
        );
    
        // Fill up input fields
        // Empty name
        fireEvent.change(screen.getByPlaceholderText("Write a name"), {
          target: { value: DUMMY_PRODUCT.name },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a description"), {
          target: { value: DUMMY_PRODUCT.description },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a price"), {
          target: { value: "-1" },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a quantity"), {
          target: { value: DUMMY_PRODUCT.quantity },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[0], {
          target: { value: DUMMY_PRODUCT.category },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[1], {
          target: { value: DUMMY_PRODUCT.shipping },
        });
    
        // Upload photo
        URL.createObjectURL = jest
          .fn()
          .mockReturnValueOnce(DUMMY_PRODUCT.photo.name);
        const file = new File(["mock-mock-image-data"], DUMMY_PRODUCT.photo.name, {
          type: DUMMY_PRODUCT.photo.type,
        });
        const fileUpload = screen.getByTestId("file-upload");
        fireEvent.change(fileUpload, { target: { files: [file] } });
        expect(
          await screen.findByText(DUMMY_PRODUCT.photo.name)
        ).toBeInTheDocument();
        expect(await screen.findByRole("img")).toHaveAttribute(
          "src",
          DUMMY_PRODUCT.photo.name
        );
    
        const toastSpy = jest.spyOn(toast, "error");
    
        fireEvent.click(screen.getByText("CREATE PRODUCT"));
    
        await waitFor(() => {
          expect(toastSpy).toHaveBeenCalledWith(
            "Price should not be negative"
          );
        });
    });

    it("should display error message on failure to create product: empty category", async () => {
        renderComponent();

        // ensure categories data is loaded in first
        const categorySelect = screen.getByPlaceholderText("Select a category");
        fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    
        await Promise.all(
          DUMMY_CATEGORIES.map(async (item) => {
            expect(
              await within(categorySelect).findByText(item.name)
            ).toBeInTheDocument();
          })
        );
    
        // Fill up input fields
        // Empty name
        fireEvent.change(screen.getByPlaceholderText("Write a name"), {
          target: { value: DUMMY_PRODUCT.name },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a description"), {
          target: { value: DUMMY_PRODUCT.description },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a price"), {
          target: { value: DUMMY_PRODUCT.price },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a quantity"), {
          target: { value: DUMMY_PRODUCT.quantity },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[0], {
          target: { value: "" },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[1], {
          target: { value: DUMMY_PRODUCT.shipping },
        });
    
        // Upload photo
        URL.createObjectURL = jest
          .fn()
          .mockReturnValueOnce(DUMMY_PRODUCT.photo.name);
        const file = new File(["mock-mock-image-data"], DUMMY_PRODUCT.photo.name, {
          type: DUMMY_PRODUCT.photo.type,
        });
        const fileUpload = screen.getByTestId("file-upload");
        fireEvent.change(fileUpload, { target: { files: [file] } });
        expect(
          await screen.findByText(DUMMY_PRODUCT.photo.name)
        ).toBeInTheDocument();
        expect(await screen.findByRole("img")).toHaveAttribute(
          "src",
          DUMMY_PRODUCT.photo.name
        );
    
        const toastSpy = jest.spyOn(toast, "error");
    
        fireEvent.click(screen.getByText("CREATE PRODUCT"));
    
        await waitFor(() => {
          expect(toastSpy).toHaveBeenCalledWith(
            "Category is required"
          );
        });
    });

    it("should display error message on failure to create product: empty quantity", async () => {
        renderComponent();

        // ensure categories data is loaded in first
        const categorySelect = screen.getByPlaceholderText("Select a category");
        fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    
        await Promise.all(
          DUMMY_CATEGORIES.map(async (item) => {
            expect(
              await within(categorySelect).findByText(item.name)
            ).toBeInTheDocument();
          })
        );
    
        // Fill up input fields
        // Empty name
        fireEvent.change(screen.getByPlaceholderText("Write a name"), {
          target: { value: DUMMY_PRODUCT.name },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a description"), {
          target: { value: DUMMY_PRODUCT.description },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a price"), {
          target: { value: DUMMY_PRODUCT.price },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a quantity"), {
          target: { value: "" },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[0], {
          target: { value: DUMMY_CATEGORIES.category },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[1], {
          target: { value: DUMMY_PRODUCT.shipping },
        });
    
        // Upload photo
        URL.createObjectURL = jest
          .fn()
          .mockReturnValueOnce(DUMMY_PRODUCT.photo.name);
        const file = new File(["mock-mock-image-data"], DUMMY_PRODUCT.photo.name, {
          type: DUMMY_PRODUCT.photo.type,
        });
        const fileUpload = screen.getByTestId("file-upload");
        fireEvent.change(fileUpload, { target: { files: [file] } });
        expect(
          await screen.findByText(DUMMY_PRODUCT.photo.name)
        ).toBeInTheDocument();
        expect(await screen.findByRole("img")).toHaveAttribute(
          "src",
          DUMMY_PRODUCT.photo.name
        );
    
        const toastSpy = jest.spyOn(toast, "error");
    
        fireEvent.click(screen.getByText("CREATE PRODUCT"));
    
        await waitFor(() => {
          expect(toastSpy).toHaveBeenCalledWith(
            "Quantity is required"
          );
        });
    });
    it("should display error message on failure to create product: negative quantity", async () => {
        renderComponent();

        // ensure categories data is loaded in first
        const categorySelect = screen.getByPlaceholderText("Select a category");
        fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    
        await Promise.all(
          DUMMY_CATEGORIES.map(async (item) => {
            expect(
              await within(categorySelect).findByText(item.name)
            ).toBeInTheDocument();
          })
        );
    
        // Fill up input fields
        // Empty name
        fireEvent.change(screen.getByPlaceholderText("Write a name"), {
          target: { value: DUMMY_PRODUCT.name },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a description"), {
          target: { value: DUMMY_PRODUCT.description },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a price"), {
          target: { value: DUMMY_PRODUCT.price },
        });
        fireEvent.change(screen.getByPlaceholderText("Write a quantity"), {
          target: { value: "-1" },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[0], {
          target: { value: DUMMY_CATEGORIES.category },
        });
    
        fireEvent.change(screen.getAllByRole("combobox")[1], {
          target: { value: DUMMY_PRODUCT.shipping },
        });
    
        // Upload photo
        URL.createObjectURL = jest
          .fn()
          .mockReturnValueOnce(DUMMY_PRODUCT.photo.name);
        const file = new File(["mock-mock-image-data"], DUMMY_PRODUCT.photo.name, {
          type: DUMMY_PRODUCT.photo.type,
        });
        const fileUpload = screen.getByTestId("file-upload");
        fireEvent.change(fileUpload, { target: { files: [file] } });
        expect(
          await screen.findByText(DUMMY_PRODUCT.photo.name)
        ).toBeInTheDocument();
        expect(await screen.findByRole("img")).toHaveAttribute(
          "src",
          DUMMY_PRODUCT.photo.name
        );
    
        const toastSpy = jest.spyOn(toast, "error");
    
        fireEvent.click(screen.getByText("CREATE PRODUCT"));
    
        await waitFor(() => {
          expect(toastSpy).toHaveBeenCalledWith(
            "Quantity should not be negative"
          );
        });
    });
  });
});
