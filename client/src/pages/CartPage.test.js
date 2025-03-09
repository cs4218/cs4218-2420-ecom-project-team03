import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { useCart } from '../context/cart';
import CartPage from './CartPage';
import axios from 'axios';
import toast from 'react-hot-toast';
import '@testing-library/jest-dom'
import DropIn from "braintree-web-drop-in-react";

// Mock axios
jest.mock('axios');
jest.mock('react-hot-toast');

// Mock auth and cart contexts
const mockAuth = {
  user: { name: 'Test User', address: 'Test Address' },
  token: 'test-token',
};

const mockCart = [
  { _id: '1', name: 'Product 1', price: 10, description: 'Description 1' },
  { _id: '2', name: 'Product 2', price: 20, description: 'Description 2' },
];

const setCart = jest.fn();
const mockNavigate = jest.fn();

// Mock the useAuth hoook
jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [mockAuth, jest.fn()]),
}));

// Mock the useCart hook
jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [mockCart, jest.fn()]),
}));

// Mock the useSearch hook
jest.mock('../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));  

// Mock the useCategory hook
jest.mock("../hooks/useCategory", () => jest.fn(() => []));

// Mock the useNavigate hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock the DropIn Component
jest.mock("braintree-web-drop-in-react", () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="dropin-component">Mocked DropIn</div>),
}));

// Mock the localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

// Test the basic functions of the cart
describe('CartPage Cart functions', () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue([mockCart, jest.fn()]);
    useAuth.mockReturnValue([mockAuth, jest.fn()]);
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  // Test 1: Renders CartPage component
  it('renders CartPage component', async () => {
    const { getByText } = await act(async() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    expect(getByText(/Hello Test User/i)).toBeInTheDocument();
    expect(getByText(/Test Address/i)).toBeInTheDocument();
  });

  // Test 2: Renders CartPage component when cart is empty
  it('renders CartPage component with empty cart', async () => {
    //Mock empty cart
    useCart.mockReturnValue([[], jest.fn()]);
    const { getByText } = await act(async() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    expect(getByText(/Hello Test User/i)).toBeInTheDocument();
    expect(getByText(/Test Address/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
  });

  // Test 3: Displays cart items
  it('displays cart items', async () => {
    const { getByText } = await act(async() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    expect(getByText(/Product 1/i)).toBeInTheDocument();
    expect(getByText(/Product 2/i)).toBeInTheDocument();
  });

  // Test 4: Calculates total price correctly
  it('calculates the total price correctly', async () => {
    await act(async() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    // Find the total price element
    const totalPriceElement = screen.getByText(/Total : \$30.00/i);

    // Check if the total price is correctly displayed
    expect(totalPriceElement).toBeInTheDocument();
  });

  // Test 5: Handle error when price is invalid
  it('handles errors in calculating price', async () => {
    //Mock cart with invalid priced item
    useCart.mockReturnValue([[
      { _id: '1', name: 'Product 1', price: 10, description: 'Description 1' },
      { _id: '2', name: 'Product 2', price: "invalid", description: 'Description 2' },
    ], jest.fn()]);

    await act(async() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  // Test 6: Removes cart item
  it('removes cart item', async () => {
    const setCart = jest.fn();
    useCart.mockReturnValue([mockCart, setCart]);

    await act(async() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    // Get all "Remove" buttons
    const removeButtons = screen.getAllByRole("button", { name: "Remove" });

    // Click the first "Remove" button
    fireEvent.click(removeButtons[0]);

    const mockCartAfterRemoval = mockCart.slice(1);

    expect(setCart).toHaveBeenCalledWith(mockCartAfterRemoval);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify(mockCartAfterRemoval)
    );
  });

  //Test 7: Error when removing cart items
  it("should not remove items from cart when error is thrown", async () => {
    const setCart = jest.fn().mockImplementationOnce(() => {
      throw new Error("Error when removing item");
    });
    useCart.mockReturnValue([mockCart, setCart]);

    await act(async() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);

    expect(setCart).toHaveBeenCalledTimes(1);
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalled();
  });
});

// Test the functions of the Update Address Button
describe('CartPage Update Address function', () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue([mockCart, jest.fn()]);
    useAuth.mockReturnValue([mockAuth, jest.fn()]);
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  //Test 8: Update Address button
  it('naviagte to profile page when Update Address button is clicked', async () => {
    await act(async() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    const updateAddressButton = screen.getByRole("button", { name: "Update Address" });
    expect(updateAddressButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(updateAddressButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  //Test 9: Update Address button when no user address
  it("display update address button even when user address is absent", async () => {
    useAuth.mockReturnValue([
      {
        user: { name: 'Test User', address: '' },
        token: 'test-token',
      },
      jest.fn(),
    ]);

    await act(async() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    const updateAddressButton = screen.getByRole("button", { name: "Update Address" });
    expect(updateAddressButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(updateAddressButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });
});

// Test the functions of the Make Payment Button
describe('CartPage Payment function', () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue([mockCart, jest.fn()]);
    useAuth.mockReturnValue([mockAuth, jest.fn()]);
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  // Test 10: Obtains payment gateway token
  it('obtains the payment gateway token', async () => {
    // Mock the axios.get method to return a mock response
    axios.get.mockResolvedValue({ data: { clientToken: 'test-client-token' } });

    await act(() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));
    
    expect(axios.get).toHaveBeenCalledWith('/api/v1/product/braintree/token');
  });

  // Test 11: Handle errors when obtaining gateway token
  it('handles errors when obtaining the payment gateway token', async () => {
    // Mock the axios.get method to throw an error
    const mockError = new Error('Network Error');
    axios.get.mockRejectedValue(mockError);
    // Mock console.log to capture calls
    const mockConsoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await act(() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    // Wait for the error to be logged
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });
    expect(mockConsoleLogSpy).toHaveBeenCalledWith(mockError);
  });;

  // Test 12: hnalde payment success
  it('handles payment successfully', async () => {
    useCart.mockReturnValue([mockCart, setCart]);

    // Mock the axios.get method to return a mock response
    axios.get.mockResolvedValue({ data: { clientToken: 'test-client-token' } });
    axios.post.mockResolvedValue({ data: { success: true } });

    // Mock the DropIn instance
    const mockInstance = {
      requestPaymentMethod: jest.fn().mockResolvedValue({
          nonce: 'test-nonce',
          cart: mockCart,
        }),
    };

    DropIn.mockImplementation(({ onInstance }) => {
      React.useEffect(() => {
        onInstance(mockInstance);
      }, [onInstance]);

      return <div data-testid="dropin-component">Mocked DropIn</div>;
    });

    await act(async() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    // Wait for get request for braintree token
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });

    // Wait for the DropIn component to be rendered
    expect(screen.getByTestId("dropin-component")).toBeInTheDocument();

    // Get the Make Payment button
    const paymentButton = screen.getByRole('button', { name: /Make Payment/i });
    // Ensure the button is enabled
    expect(paymentButton).toBeEnabled();
    // Trigger the handlePayment function
    fireEvent.click(paymentButton);

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/product/braintree/payment", {
        nonce: 'test-nonce',
        cart: mockCart,
      });
      expect(setCart).toHaveBeenCalledWith([]);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
      expect(toast.success).toHaveBeenCalledWith("Payment Completed Successfully");
    });
  });

  // Test 13: hnalde payment errors
  it('handles payment errors', async () => {
    // Mock the instance.requestPaymentMethod method to throw an error
    const mockError = new Error('Payment Error');
    // Mock the axios.get method to return a mock response
    axios.get.mockResolvedValue({ data: { clientToken: 'test-client-token' } });
    axios.post.mockRejectedValue(mockError);

    // Mock the DropIn instance
    const mockInstance = {
      requestPaymentMethod: jest.fn().mockResolvedValue({
          nonce: 'test-nonce',
          cart: mockCart,
        }),
    };

    DropIn.mockImplementation(({ onInstance }) => {
      React.useEffect(() => {
        onInstance(mockInstance);
      }, [onInstance]);

      return <div data-testid="dropin-component">Mocked DropIn</div>;
    });

    await act(async() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    // Wait for get request for braintree token
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token");
    });

    // Wait for the DropIn component to be rendered
    expect(screen.getByTestId("dropin-component")).toBeInTheDocument();

    // Get the Make Payment button
    const paymentButton = screen.getByRole('button', { name: /Make Payment/i });
    // Ensure the button is enabled
    expect(paymentButton).toBeEnabled();
    // Trigger the handlePayment function
    fireEvent.click(paymentButton);

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/v1/product/braintree/payment", {
        nonce: 'test-nonce',
        cart: mockCart,
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
      expect(toast.success).not.toHaveBeenCalled();
    });
  });
});

// Test the Cart Page with no user
describe('CartPage when user is not logged in', () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue([mockCart, jest.fn()]);
    useAuth.mockReturnValue([{
      user: null,
      token: null,
    }, jest.fn()]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //Test 14: No User
  it('bring user to Login page when user is not yet logged in', async () => {
    await act(async() => render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    ));

    const loginButton = screen.getByRole("button", {
      name: "Please Login to checkout",
    });
    expect(loginButton).toBeInTheDocument();
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/cart" });
  });
});