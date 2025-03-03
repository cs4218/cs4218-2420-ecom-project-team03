import React from "react";
import { render } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("CartProvider and useCart", () => {
  beforeEach(() => {
    // Clear localStorage and all mocks before each test
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  // Test 1: Initializes cart state from localStorage
  it("initializes cart state from localStorage", () => {
    const mockCart = [
      { id: "1", name: "Product 1", price: 10 },
      { id: "2", name: "Product 2", price: 20 },
    ];
    window.localStorage.setItem("cart", JSON.stringify(mockCart));

    let cartState;
    const TestComponent = () => {
      const [cart] = useCart();
      cartState = cart;
      return null;
    };

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Verify that the cart state is initialized from localStorage
    expect(cartState).toEqual(mockCart);
    expect(window.localStorage.getItem).toHaveBeenCalledWith("cart");
  });

  // Test 2: Provides empty cart state if localStorage is empty
  it("provides empty cart state if localStorage is empty", () => {
    let cartState;
    const TestComponent = () => {
      const [cart] = useCart();
      cartState = cart;
      return null;
    };

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Verify that the cart state is an empty array
    expect(cartState).toEqual([]);
    expect(window.localStorage.getItem).toHaveBeenCalledWith("cart");
  });
});