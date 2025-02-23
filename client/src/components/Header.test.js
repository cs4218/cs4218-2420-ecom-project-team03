// Header.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";
import { useAuth } from '../context/auth';
import toast from "react-hot-toast";
import "@testing-library/jest-dom";

// Mock useAuth hook
const mockAuth = {
  user: { name: 'Test User', role: 0, token: 'test-token' },
};

jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [mockAuth, jest.fn()]),
}));

// Mock useCart hook
const mockCart = [{ _id: '1', name: 'Product 1' }];
jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [mockCart, jest.fn()]),
}));

// Mock useSearch hook
jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => ["", jest.fn()]),
}));

// Mock useCategory hook
const mockCategories = [
  { _id: '1', name: 'Category 1', slug: 'category-1' },
  { _id: '2', name: 'Category 2', slug: 'category-2' },
];
jest.mock('../hooks/useCategory', () => jest.fn(() => mockCategories));

// Mock toast
jest.mock("react-hot-toast", () => ({
    success: jest.fn(),
    error: jest.fn(),
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

describe('Header', () => {
  it('renders the navigation links correctly', () => {
    render(
        <MemoryRouter>
            <Header />
        </MemoryRouter>
    );

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText(/All Categories/i)).toBeInTheDocument();
    expect(screen.getByText(/Category 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Category 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Cart/i)).toBeInTheDocument();
  });

  it('renders the user-specific links when authenticated', () => {
    render(
        <MemoryRouter>
            <Header />
        </MemoryRouter>
    );

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  it('renders the login and register links when not authenticated', () => {
    // Mock auth with undefined user
    const mockAuthUndefined = { user: null };
    useAuth.mockReturnValue([mockAuthUndefined, jest.fn()]);

    render(
        <MemoryRouter>
            <Header />
        </MemoryRouter>
    );

    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it('displays the correct number of items in the cart', () => {
    render(
        <MemoryRouter>
            <Header />
        </MemoryRouter>
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // Assuming cart has 1 item
  });

  it('calls handleLogout correctly', () => {
    const mockSetAuth = jest.fn();
    useAuth.mockReturnValue([mockAuth, mockSetAuth]);

    render(
      <MemoryRouter>
        <Header />   
      </MemoryRouter>
    );

    // Click the Logout link
    fireEvent.click(screen.getByText(/Logout/i));

    // Check if setAuth was called with the correct arguments
    expect(mockSetAuth).toHaveBeenCalledWith({
      ...mockAuth,
      user: null,
      token: '',
    });

    // Check if localStorage.removeItem was called with the correct key
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth');

    // Check if toast.success was called with the correct message
    expect(toast.success).toHaveBeenCalledWith('Logout Successfully');
  });

  it('handles errors in handleLogout correctly', () => {
    // Mock setAuth to throw an error
    useAuth.mockReturnValue([mockAuth, () => { throw new Error('Mocked error') }])

    render(
      <MemoryRouter>
        <Header />   
      </MemoryRouter>
    );

    // Click the Logout link
    fireEvent.click(screen.getByText(/Logout/i));

    // Check if toast.error was called with the correct message
    expect(toast.error).toHaveBeenCalledWith('Logout Failed');
  });

  it("redirects to the correct dashboard based on user role", () => {
    useAuth.mockReturnValue([{ user: { name: 'Test Admin User', role: 1, token: 'test-token' } }, jest.fn()]);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("Test Admin User")).toBeInTheDocument();
  });
});