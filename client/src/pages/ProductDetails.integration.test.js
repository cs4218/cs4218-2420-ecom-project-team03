import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import React from 'react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import ProductDetails from './ProductDetails';
import { CartProvider } from '../context/cart';
import Pagenotfound from './Pagenotfound';
import CartPage from './CartPage';
import { AuthProvider } from '../context/auth';
import { SearchProvider } from '../context/search';

axios.defaults.baseURL = "http://localhost:6060";

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe('Product Details Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product details', async () => {
    const { getByText } = render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/product/laptop']}>
                <Routes>
                    <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Product Details')).toBeInTheDocument();
    expect(await screen.findByText('Name : Laptop')).toBeInTheDocument();
    expect(await screen.findByText('Description : A powerful laptop')).toBeInTheDocument();
    expect(await screen.findByText('Price : $1,499.99')).toBeInTheDocument();
    expect(await screen.findByText('Category : Electronic')).toBeInTheDocument();
    expect(screen.getByText('ADD TO CART')).toBeInTheDocument();
  });

  it('should add product to cart', async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/product/laptop']}>
              <Routes>
                  <Route path="/product/:slug" element={<ProductDetails />} />
                  <Route path="/cart" element={<CartPage />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    expect(await screen.findByText('Name : Laptop')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("primary-add-to-cart"));
    await waitFor(() => {
      const cartCount = screen.getByTestId('cart-count');
      expect(cartCount).toBeInTheDocument();
      expect(cartCount).toHaveTextContent("1");
    });
    fireEvent.click(screen.getByTestId("cart-header-button"));
    expect(await screen.findByText('You Have 1 items in your cart please login to checkout !')).toBeInTheDocument();
    expect(await screen.findByText('Laptop')).toBeInTheDocument();
  });

  it('should generate product image with correct attributes', async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/product/laptop']}>
                <Routes>
                    <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      const imgElement = screen.getByTestId("product-image");
      expect(imgElement).toBeInTheDocument();
      expect(imgElement).toHaveAttribute("src", expect.stringContaining("/api/v1/product/product-photo/66db427fdb0119d9234b27f3"));
      expect(imgElement).toHaveAttribute("alt", "Laptop");
    });
  });

  it('should render no similar products', async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/product/book']}>
                <Routes>
                    <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    expect(await screen.findByText('Name : Book')).toBeInTheDocument();
    expect(screen.getByText('Similar Products ➡️')).toBeInTheDocument();
    expect(await screen.findByText('No Similar Products found')).toBeInTheDocument();
  });

  it('should render similar product', async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/product/laptop']}>
                <Routes>
                    <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Similar Products ➡️')).toBeInTheDocument();
    expect(await screen.findByText('Smartphone')).toBeInTheDocument();
    expect(await screen.findByText('$99.99')).toBeInTheDocument();
    expect(await screen.findByText('A high-end smartphone...')).toBeInTheDocument();
  });

  it('should navigate to product details page of similar product', async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/product/laptop']}>
                <Routes>
                    <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );
    
    expect(await screen.findByText('Smartphone')).toBeInTheDocument();
    fireEvent.click(await screen.findByText('More Details'));

    expect(screen.getByText('Product Details')).toBeInTheDocument();
    expect(await screen.findByText('Name : Smartphone')).toBeInTheDocument();
    expect(await screen.findByText('Description : A high-end smartphone')).toBeInTheDocument();
    expect(await screen.findByText('Price : $99.99')).toBeInTheDocument();
    expect(await screen.findByText('Category : Electronic')).toBeInTheDocument();
    expect(screen.getByText('ADD TO CART')).toBeInTheDocument();
  });

  it('should add similar product to cart', async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/product/laptop']}>
              <Routes>
                  <Route path="/product/:slug" element={<ProductDetails />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    expect(await screen.findByText('Name : Laptop')).toBeInTheDocument();

    fireEvent.click(await screen.findByText('Add to Cart'));
    await waitFor(() => {
      const cartCount = screen.getByTestId('cart-count');
      expect(cartCount).toBeInTheDocument();
      expect(cartCount).toHaveTextContent("1");
    });
  });

  it('should navigate to 404 is slug has no product associated with it', async () => {
    const { getByText } = render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/product/lamppost']}>
              <Routes>
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="*" element={<Pagenotfound />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    await waitFor(() => expect(getByText("404")).toBeInTheDocument());
  });
});